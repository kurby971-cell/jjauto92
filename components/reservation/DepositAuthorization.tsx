'use client'

import { useEffect, useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/client'

const LS_KEY = 'jjauto92_reservation_draft'

const stripeAppearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#C9A84C',
    colorText: '#0D1B2A',
    colorBackground: '#ffffff',
    borderRadius: '12px',
    fontFamily: 'system-ui, sans-serif',
  },
}

function DepositForm({ reservationId }: { reservationId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [status, setStatus] = useState<'idle' | 'authorizing' | 'success' | 'error'>('idle')
  const [ready, setReady] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleAuthorize() {
    if (!stripe || !elements) return
    setStatus('authorizing')
    setErrorMsg(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/reservation/confirmation?reservation=${reservationId}&redirect_status=succeeded`,
      },
      redirect: 'if_required',
    })

    if (error) {
      const msg =
        error.type === 'card_error' || error.type === 'validation_error'
          ? (error.message ?? 'Carte refusée')
          : 'Erreur lors de la pré-autorisation. Veuillez réessayer.'
      setErrorMsg(msg)
      setStatus('error')
      return
    }

    // Success — clear deposit secret from localStorage
    setStatus('success')
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        delete parsed._depositClientSecret
        localStorage.setItem(LS_KEY, JSON.stringify(parsed))
      }
    } catch {}
  }

  if (status === 'success') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <div>
          <p className="font-bold text-emerald-800 text-sm">Caution pré-autorisée</p>
          <p className="text-emerald-700 text-sm mt-0.5">
            La caution est bloquée sur votre carte et sera libérée en fin de location sans frais.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div>
        <h3 className="text-[11px] font-bold text-gold uppercase tracking-widest mb-1">
          Pré-autorisation de caution
        </h3>
        <p className="text-gray-500 text-sm">
          Entrez vos coordonnées bancaires pour pré-autoriser la caution.
          Aucun débit — la somme est simplement réservée et libérée en fin de location.
        </p>
      </div>

      <PaymentElement onReady={() => setReady(true)} options={{ layout: 'tabs' }} />

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-red-700 text-sm">{errorMsg}</p>
        </div>
      )}

      <button
        onClick={handleAuthorize}
        disabled={!stripe || !elements || !ready || status === 'authorizing'}
        className="w-full flex items-center justify-center gap-2 bg-navy hover:bg-navy/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm py-4 rounded-xl uppercase tracking-widest transition-colors"
      >
        {status === 'authorizing' ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Traitement…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            Pré-autoriser la caution
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        Pré-autorisation sécurisée · Aucun débit · Libérée automatiquement en fin de location
      </p>
    </div>
  )
}

export default function DepositAuthorization({ reservationId }: { reservationId: string }) {
  const [depositClientSecret, setDepositClientSecret] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.reservationId === reservationId && parsed._depositClientSecret) {
          setDepositClientSecret(parsed._depositClientSecret)
        }
      }
    } catch {}
    setChecked(true)
  }, [reservationId])

  if (!checked || !depositClientSecret) return null

  return (
    <Elements
      stripe={getStripe()}
      options={{ clientSecret: depositClientSecret, appearance: stripeAppearance }}
    >
      <DepositForm reservationId={reservationId} />
    </Elements>
  )
}
