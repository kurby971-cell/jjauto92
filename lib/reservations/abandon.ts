import { getStripe } from '@/lib/stripe/server'

// Durée pendant laquelle une réservation « pending » (paiement non finalisé)
// bloque le véhicule. Passé ce délai, elle est annulée automatiquement.
export const PENDING_HOLD_MINUTES = 30

export type AbandonResult = 'cancelled' | 'paid' | 'not_found' | 'not_pending'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Annule une réservation web restée « pending » : libère les dates, annule les
// PaymentIntents Stripe (loyer + caution, ce qui relâche une pré-autorisation
// éventuelle) et met à jour les enregistrements. Refuse si un paiement a abouti.
export async function abandonReservation(db: any, reservationId: string, reason: string): Promise<AbandonResult> {
  const { data: reservation } = await db
    .from('reservations')
    .select('id, status')
    .eq('id', reservationId)
    .maybeSingle()
  if (!reservation) return 'not_found'
  if (reservation.status !== 'pending') return 'not_pending'

  const { data: payments } = await db
    .from('payments')
    .select('id, status, stripe_payment_intent_id')
    .eq('reservation_id', reservationId)
  if ((payments ?? []).some((p: { status: string }) => p.status === 'succeeded')) return 'paid'

  // Garde « status = pending » : évite d'écraser une réservation confirmée entre-temps
  const { data: updated, error } = await db
    .from('reservations')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancellation_reason: reason })
    .eq('id', reservationId)
    .eq('status', 'pending')
    .select('id')
  if (error || !updated?.length) return 'not_pending'

  const { data: deposits } = await db
    .from('deposits')
    .select('id, status, stripe_payment_intent_id')
    .eq('reservation_id', reservationId)

  const stripe = getStripe()
  const intents: string[] = [
    ...(payments ?? []).map((p: { stripe_payment_intent_id: string | null }) => p.stripe_payment_intent_id),
    ...(deposits ?? []).map((d: { stripe_payment_intent_id: string | null }) => d.stripe_payment_intent_id),
  ].filter(Boolean)
  for (const id of intents) {
    try {
      await stripe.paymentIntents.cancel(id)
    } catch (err) {
      console.error('[abandonReservation] annulation PaymentIntent impossible:', err instanceof Error ? err.message : err)
    }
  }

  await db.from('payments').update({ status: 'failed', failure_reason: reason }).eq('reservation_id', reservationId).eq('status', 'pending')
  for (const d of deposits ?? []) {
    if (d.status === 'authorized') {
      await db.from('deposits').update({ status: 'released', released_at: new Date().toISOString() }).eq('id', d.id)
    } else if (d.status === 'pending') {
      await db.from('deposits').update({ status: 'expired' }).eq('id', d.id)
    }
  }
  return 'cancelled'
}

// Annule les réservations web « pending » plus vieilles que PENDING_HOLD_MINUTES.
export async function expireStalePendingReservations(db: any): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - PENDING_HOLD_MINUTES * 60_000).toISOString()
    const { data } = await db
      .from('reservations')
      .select('id')
      .eq('status', 'pending')
      .eq('source', 'web')
      .lt('created_at', cutoff)
      .limit(20)
    for (const r of data ?? []) {
      await abandonReservation(db, r.id, 'Expirée — paiement non finalisé')
    }
  } catch (err) {
    console.error('[expireStalePendingReservations]', err instanceof Error ? err.message : err)
  }
}
