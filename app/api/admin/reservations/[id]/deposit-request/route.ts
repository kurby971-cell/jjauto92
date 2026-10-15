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

  // Une seule caution par réservation (deposits.reservation_id est UNIQUE)
  const { data: existing } = await db
    .from('deposits')
    .select('id, status')
    .eq('reservation_id', id)
    .maybeSingle()

  if (existing?.status === 'pending') {
    return NextResponse.json({ depositId: existing.id, url: `${siteUrl}/caution/${existing.id}` })
  }
  if (existing && ['authorized', 'partially_captured'].includes(existing.status)) {
    return NextResponse.json({ error: 'Une caution est déjà autorisée pour cette réservation' }, { status: 409 })
  }
  if (existing?.status === 'captured') {
    return NextResponse.json({ error: 'La caution de cette réservation a déjà été encaissée' }, { status: 409 })
  }

  // Autorisation étendue (jusqu'à ~30 jours selon le réseau) demandée si la carte et le compte la permettent ;
  // sinon Stripe retombe sur la durée standard de 7 jours.
  const intentParams = {
    amount: Math.round(amount * 100),
    currency: 'eur',
    capture_method: 'manual' as const,
    metadata: {
      reservationId: r.id,
      reservationNumber: r.reservation_number,
      customerId: r.customer_id,
      type: 'deposit',
    },
    automatic_payment_methods: { enabled: true },
    description: `Caution ${r.reservation_number} — JJ AUTO 92`,
  }
  let intent
  try {
    try {
      intent = await getStripe().paymentIntents.create({
        ...intentParams,
        payment_method_options: { card: { request_extended_authorization: 'if_available' } },
      })
    } catch (extErr) {
      console.error('[Stripe] autorisation étendue indisponible, repli sur 7 jours:', extErr)
      intent = await getStripe().paymentIntents.create(intentParams)
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur Stripe'
    return NextResponse.json({ error: `Stripe : ${msg}` }, { status: 502 })
  }

  // Caution précédemment libérée ou expirée : on réutilise la ligne avec une nouvelle pré-autorisation
  const row = {
    reservation_id: r.id,
    customer_id: r.customer_id,
    stripe_payment_intent_id: intent.id,
    amount,
    currency: 'eur',
    captured_amount: 0,
    status: 'pending',
    authorized_at: null,
    authorization_expiry: null,
    released_at: null,
  }
  const { data: dep, error: depErr } = existing
    ? await db.from('deposits').update(row).eq('id', existing.id).select('id').single()
    : await db.from('deposits').insert(row).select('id').single()

  if (depErr || !dep) {
    try { await getStripe().paymentIntents.cancel(intent.id) } catch {}
    return NextResponse.json({ error: depErr?.message ?? 'Erreur enregistrement caution' }, { status: 500 })
  }

  return NextResponse.json({ depositId: dep.id, url: `${siteUrl}/caution/${dep.id}` })
}
