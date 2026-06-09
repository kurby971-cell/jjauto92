import { getStripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { reservationId, amount, currency = 'eur' } = await request.json()

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe attend des centimes
    currency,
    metadata: { reservationId, userId: user.id },
    automatic_payment_methods: { enabled: true },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
