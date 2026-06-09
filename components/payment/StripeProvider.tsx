'use client'

import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/client'

interface Props {
  clientSecret: string
  children: React.ReactNode
}

export default function StripeProvider({ clientSecret, children }: Props) {
  return (
    <Elements stripe={getStripe()} options={{ clientSecret }}>
      {children}
    </Elements>
  )
}
