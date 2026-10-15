import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-guard'
import { getStripe } from '@/lib/stripe/server'
import { NextResponse } from 'next/server'

// Génère (ou retrouve) la demande de caution d'une réservation : une pré-autorisation
// Stripe (capture manuelle) que le client valide sur son téléphone via un lien / QR code,
// à la prise du véhicule. Une pré-autorisation carte n'étant valable que 7 jours, elle
// n'est jamais créée à la réservation.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error as Response

  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const { data: r } = await db
    .from('reservations')
    .select('id, reservation_number, status, customer_id, deposit_amount')
    .eq('id', id)
    .single()

  if (!r) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
  if (!['confirmed', 'active'].includes(r.status)) {
    return NextResponse.json({ error: 'La réservation doit être confirmée ou en cours' }, { status: 409 })
  }
  const amount = Number(r.deposit_amount)
  if (!(amount > 0)) {
    return NextResponse.json({ error: 'Aucune caution pour ce véhicule' }, { status: 409 })
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jjautomobiles.fr').replace(/\/$/, '')

  // Caution déjà demandée : on réutilise la demande en attente, on refuse s'il y en a une active
  const { data: existing } = await db
    .from('deposits')
    .select('id, status')
    .eq('reservation_id', id)
    .in('status', ['pending', 'authorized', 'partially_captured'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing?.status === 'authorized' || existing?.status === 'partially_captured') {
    return NextResponse.json({ error: 'Une caution est déjà autorisée pour cette réservation' }, { status: 409 })
  }
  if (existing) {
    return NextResponse.json({ depositId: existing.id, url: `${siteUrl}/caution/${existing.id}` })
  }

  let intent
  try {
    intent = await getStripe().paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      capture_method: 'manual',
      metadata: {
        reservationId: r.id,
        reservationNumber: r.reservation_number,
        customerId: r.customer_id,
        type: 'deposit',
      },
      automatic_payment_methods: { enabled: true },
      description: `Caution ${r.reservation_number} — JJ AUTO 92`,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur Stripe'
    return NextResponse.json({ error: `Stripe : ${msg}` }, { status: 502 })
  }

  const { data: dep, error: depErr } = await db
    .from('deposits')
    .insert({
      reservation_id: r.id,
      customer_id: r.customer_id,
      stripe_payment_intent_id: intent.id,
      amount,
      currency: 'eur',
      captured_amount: 0,
      status: 'pending',
    })
    .select('id')
    .single()

  if (depErr || !dep) {
    try { await getStripe().paymentIntents.cancel(intent.id) } catch {}
    return NextResponse.json({ error: depErr?.message ?? 'Erreur enregistrement caution' }, { status: 500 })
  }

  return NextResponse.json({ depositId: dep.id, url: `${siteUrl}/caution/${dep.id}` })
}
