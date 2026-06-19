import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-guard'
import { getStripe } from '@/lib/stripe/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error as Response

  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const { action, capture_amount, capture_reason } = await request.json()
  const now = new Date().toISOString()

  const { data: deposit, error: fetchErr } = await db
    .from('deposits')
    .select('id, status, amount, stripe_payment_intent_id')
    .eq('id', id)
    .single()

  if (fetchErr || !deposit) {
    return NextResponse.json({ error: 'Caution introuvable' }, { status: 404 })
  }

  if (action === 'release') {
    if (deposit.status !== 'authorized') {
      return NextResponse.json({ error: 'Seules les cautions autorisées peuvent être libérées' }, { status: 409 })
    }

    if (deposit.stripe_payment_intent_id) {
      try {
        await getStripe().paymentIntents.cancel(deposit.stripe_payment_intent_id)
      } catch (stripeErr: unknown) {
        const msg = stripeErr instanceof Error ? stripeErr.message : String(stripeErr)
        return NextResponse.json({ error: `Stripe : ${msg}` }, { status: 502 })
      }
    }

    const { error: upErr } = await db
      .from('deposits')
      .update({ status: 'released', released_at: now })
      .eq('id', id)
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'capture') {
    if (!['authorized', 'partially_captured'].includes(deposit.status)) {
      return NextResponse.json({ error: 'Impossible de capturer cette caution' }, { status: 409 })
    }
    const amount = capture_amount ?? deposit.amount
    const isPartial = amount < deposit.amount

    if (deposit.stripe_payment_intent_id) {
      try {
        await getStripe().paymentIntents.capture(deposit.stripe_payment_intent_id, {
          amount_to_capture: Math.round(amount * 100),
        })
      } catch (stripeErr: unknown) {
        const msg = stripeErr instanceof Error ? stripeErr.message : String(stripeErr)
        return NextResponse.json({ error: `Stripe : ${msg}` }, { status: 502 })
      }
    }

    const { error: upErr } = await db
      .from('deposits')
      .update({
        status: isPartial ? 'partially_captured' : 'captured',
        captured_amount: amount,
        captured_at: now,
        capture_reason: capture_reason ?? null,
      })
      .eq('id', id)
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}
