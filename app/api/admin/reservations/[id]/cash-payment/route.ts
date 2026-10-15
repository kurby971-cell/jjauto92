import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-guard'
import { NextResponse } from 'next/server'

// Enregistre l'encaissement en espèces du solde de la location (règlement à la prise du véhicule).
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
    .select('id, reservation_number, status, customer_id, total_amount, payments(amount, status)')
    .eq('id', id)
    .single()

  if (!r) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
  if (!['confirmed', 'active', 'completed'].includes(r.status)) {
    return NextResponse.json({ error: 'La réservation doit être confirmée, en cours ou terminée' }, { status: 409 })
  }

  const payments: Array<{ amount: number; status: string }> = ([] as Array<{ amount: number; status: string }>).concat(r.payments ?? [])
  const paid = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const balance = Math.round((Number(r.total_amount) - paid) * 100) / 100

  if (balance <= 0) {
    return NextResponse.json({ error: 'Aucun solde à encaisser' }, { status: 409 })
  }

  const { error: insErr } = await db.from('payments').insert({
    reservation_id: r.id,
    customer_id: r.customer_id,
    amount: balance,
    currency: 'eur',
    status: 'succeeded',
    type: 'reservation',
    refund_amount: 0,
    description: `Solde en espèces ${r.reservation_number}`,
    paid_at: new Date().toISOString(),
    metadata: { method: 'especes' },
  })
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

  return NextResponse.json({ success: true, amount: balance })
}
