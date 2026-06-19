import { getStripe } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/server'
import { notifyMakePaymentReceived } from '@/lib/make/notify'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object
      const reservationId: string | undefined = intent.metadata?.reservationId
      const isDeposit = intent.metadata?.type === 'deposit'

      if (isDeposit) {
        // Deposit captured (capture_method:manual — shouldn't normally fire succeeded, but handle it)
        await db
          .from('deposits')
          .update({ status: 'captured', captured_at: new Date().toISOString() })
          .eq('stripe_payment_intent_id', intent.id)
        break
      }

      await db
        .from('payments')
        .update({
          status: 'succeeded',
          stripe_charge_id: intent.latest_charge,
          paid_at: new Date().toISOString(),
        })
        .eq('stripe_payment_intent_id', intent.id)

      if (reservationId) {
        await db
          .from('reservations')
          .update({ status: 'confirmed' })
          .eq('id', reservationId)
          .eq('status', 'pending')

        const { data: res } = await db
          .from('reservations')
          .select('reservation_number,customers(email)')
          .eq('id', reservationId)
          .single()

        await notifyMakePaymentReceived({
          reservationId,
          reservationNumber: res?.reservation_number,
          paymentIntentId: intent.id,
          amount: intent.amount / 100,
          currency: intent.currency.toUpperCase(),
          customerEmail: res?.customers?.email,
          status: 'succeeded',
        })
      }
      break
    }

    case 'payment_intent.amount_capturable_updated': {
      // Deposit pre-authorization confirmed (capture_method: manual)
      const intent = event.data.object
      if (intent.metadata?.type === 'deposit') {
        await db
          .from('deposits')
          .update({
            status: 'authorized',
            authorized_at: new Date().toISOString(),
            // Stripe card pre-authorizations expire after 7 days
            authorization_expiry: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          })
          .eq('stripe_payment_intent_id', intent.id)
      }
      break
    }

    case 'payment_intent.canceled': {
      const intent = event.data.object
      const isDeposit = intent.metadata?.type === 'deposit'

      if (isDeposit) {
        await db
          .from('deposits')
          .update({ status: 'released', released_at: new Date().toISOString() })
          .eq('stripe_payment_intent_id', intent.id)
      } else {
        await db
          .from('payments')
          .update({ status: 'failed', failure_reason: 'Paiement annulé' })
          .eq('stripe_payment_intent_id', intent.id)
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object
      await db
        .from('payments')
        .update({
          status: 'failed',
          failure_reason: intent.last_payment_error?.message ?? null,
        })
        .eq('stripe_payment_intent_id', intent.id)
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object
      const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null
      if (!paymentIntentId) break

      const isFullRefund = charge.refunded === true
      await db
        .from('payments')
        .update({
          status: isFullRefund ? 'refunded' : 'partially_refunded',
          refunded_at: new Date().toISOString(),
        })
        .eq('stripe_payment_intent_id', paymentIntentId)

      if (isFullRefund) {
        const { data: payment } = await db
          .from('payments')
          .select('reservation_id')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .maybeSingle()

        if (payment?.reservation_id) {
          await db
            .from('reservations')
            .update({ status: 'cancelled' })
            .eq('id', payment.reservation_id)
            .in('status', ['pending', 'confirmed'])
        }
      }
      break
    }

    case 'charge.dispute.created': {
      const dispute = event.data.object
      const paymentIntentId = typeof dispute.payment_intent === 'string' ? dispute.payment_intent : null
      console.error('[webhook/stripe] LITIGE OUVERT — montant:', dispute.amount / 100, 'EUR — PI:', paymentIntentId)

      if (paymentIntentId) {
        await db
          .from('payments')
          .update({ metadata: { dispute_id: dispute.id, dispute_status: dispute.status } })
          .eq('stripe_payment_intent_id', paymentIntentId)
      }
      break
    }

    case 'charge.dispute.closed': {
      const dispute = event.data.object
      const paymentIntentId = typeof dispute.payment_intent === 'string' ? dispute.payment_intent : null
      console.log('[webhook/stripe] LITIGE CLÔTURÉ — statut:', dispute.status, '— PI:', paymentIntentId)

      if (paymentIntentId) {
        await db
          .from('payments')
          .update({ metadata: { dispute_id: dispute.id, dispute_status: dispute.status } })
          .eq('stripe_payment_intent_id', paymentIntentId)

        // Dispute lost: mark payment as refunded
        if (dispute.status === 'lost') {
          await db
            .from('payments')
            .update({ status: 'refunded', refunded_at: new Date().toISOString() })
            .eq('stripe_payment_intent_id', paymentIntentId)
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
