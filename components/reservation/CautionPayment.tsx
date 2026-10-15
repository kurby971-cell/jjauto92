'use client'

import { useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/client'
import DepositStep from './DepositStep'

const appearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#C9A84C',
    colorText: '#0D1B2A',
    colorBackground: '#ffffff',
    borderRadius: '12px',
    fontFamily: 'system-ui, sans-serif',
  },
}

export default function CautionPayment({
  clientSecret, amount, depositId,
}: { clientSecret: string; amount: number; depositId: string }) {
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 p-6 text-center">
        <h2 className="text-navy font-extrabold text-lg mb-1">Caution enregistrée</h2>
        <p className="text-gray-500 text-sm">
          Aucun débit n&apos;a été effectué. Vous pouvez revenir vers notre équipe.
        </p>
      </div>
    )
  }

  return (
    <Elements key={clientSecret} stripe={getStripe()} options={{ clientSecret, appearance }}>
      <DepositStep
        standalone
        depositAmount={amount}
        returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/caution/${depositId}`}
        onAuthorized={() => setDone(true)}
      />
    </Elements>
  )
}
