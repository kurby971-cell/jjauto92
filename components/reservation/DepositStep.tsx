'use client'

import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

interface Props {
  depositAmount: number
  returnUrl: string
  onAuthorized: () => void
}

export default function DepositStep({ depositAmount, returnUrl, onAuthorized }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const [status, setStatus] = useState<'idle' | 'authorizing' | 'error'>('idle')
  const [ready, setReady] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleAuthorize() {
    if (!stripe || !elements) return
    setStatus('authorizing')
    setErrorMsg(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
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

    onAuthorized()
  }

  return (
    <div className="space-y-6">
      <div className="bg-navy rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-gold text-[11px] font-bold uppercase tracking-widest mb-1">Étape 1/2 — Caution</p>
          <p className="text-white text-sm">Pré-autorisation avant la location</p>
        </div>
        <span className="text-gold font-extrabold text-2xl">
          {depositAmount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
        </span>
      </div>

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
    </div>
  )
}
