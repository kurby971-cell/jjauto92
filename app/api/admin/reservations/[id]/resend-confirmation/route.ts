import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-guard'
import { notifyMakePaymentReceived } from '@/lib/make/notify'
import { NextResponse } from 'next/server'

const longDate = (iso: string) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris',
  })

type Pay = { amount: number; status: string; stripe_payment_intent_id: string | null }

// Renvoie l'e-mail de confirmation (via Make) au client d'une réservation dont l'acompte a été encaissé en ligne.
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
    .select('id,reservation_number,status,total_amount,start_date,end_date,pickup_time,return_time,pickup_location,deposit_amount,customers(first_name,last_name,email),vehicles(brand,model),payments(amount,status,stripe_payment_intent_id)')
    .eq('id', id)
    .single()

  if (!r) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
  if (!['confirmed', 'active'].includes(r.status)) {
    return NextResponse.json({ error: 'La réservation doit être confirmée ou en cours' }, { status: 409 })
  }
  if (!r.customers?.email) return NextResponse.json({ error: 'Aucun e-mail client' }, { status: 409 })

  const online = ([] as Pay[])
    .concat(r.payments ?? [])
    .filter((p) => p.status === 'succeeded' && p.stripe_payment_intent_id)
  if (online.length === 0) {
    return NextResponse.json({ error: 'Aucun paiement en ligne encaissé pour cette réservation' }, { status: 409 })
  }
  const paid = online.reduce((sum, p) => sum + Number(p.amount), 0)
  const total = Number(r.total_amount)

  await notifyMakePaymentReceived({
    reservationId: r.id,
    reservationNumber: r.reservation_number,
    paymentIntentId: online[0].stripe_payment_intent_id as string,
    amount: paid,
    totalAmount: total,
    balanceDue: Math.max(0, Math.round((total - paid) * 100) / 100),
    currency: 'EUR',
    customerEmail: r.customers.email,
    customerName: `${r.customers.first_name ?? ''} ${r.customers.last_name ?? ''}`.trim(),
    vehicleName: r.vehicles ? `${r.vehicles.brand} ${r.vehicles.model}` : undefined,
    startDate: r.start_date ? longDate(r.start_date) : undefined,
    endDate: r.end_date ? longDate(r.end_date) : undefined,
    pickupTime: r.pickup_time ? String(r.pickup_time).slice(0, 5) : undefined,
    returnTime: r.return_time ? String(r.return_time).slice(0, 5) : undefined,
    pickupLocation: r.pickup_location,
    depositAmount: r.deposit_amount != null ? Number(r.deposit_amount) : undefined,
    status: 'succeeded',
  })

  return NextResponse.json({ success: true, to: r.customers.email })
}
