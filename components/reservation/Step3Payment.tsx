'use client'

import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import type { Vehicle } from '@/lib/types'
import type { ReservationDraft } from './types'

interface Props {
  vehicle: Vehicle
  draft: ReservationDraft
}

export default function Step3Payment({ vehicle, draft }: Props) {
  const stripe = useStripe()
  const elements = useElements()

  const [cgvAccepted, setCgvAccepted] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

  async function handlePay() {
    if (!stripe || !elements || !cgvAccepted || !draft.reservationId) return
    setError(null)
    setPaying(true)

    const returnUrl =
      `${window.location.origin}/reservation/confirmation` +
      `?reservation=${draft.reservationId}` +
      `&ref=${draft.reservationNumber ?? ''}`

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    })

    // Only reached if redirect didn't happen (i.e., an error)
    if (stripeError) {
      setError(
        stripeError.type === 'card_error' || stripeError.type === 'validation_error'
          ? (stripeError.message ?? 'Paiement refusé')
          : 'Une erreur est survenue. Veuillez réessayer.'
      )
    }
    setPaying(false)
  }

  return (
    <div className="space-y-6">

      {/* Order recap */}
      <div className="bg-navy rounded-2xl p-5">
        <h3 className="text-[11px] font-bold text-gold uppercase tracking-widest mb-4">Votre commande</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{vehicle.brand} {vehicle.model}</span>
            <span className="text-white font-semibold">{vehicle.year}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              {fmtDate(draft.dateStart)} → {fmtDate(draft.dateEnd)}
            </span>
            <span className="text-white font-semibold">
              {draft.nbDays} jour{draft.nbDays > 1 ? 's' : ''}
            </span>
          </div>
          {draft.optionsAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Options</span>
              <span className="text-white font-semibold">
                {draft.optionsAmount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
              </span>
            </div>
          )}
          <div className="border-t border-navy-700 pt-3 flex justify-between items-baseline">
            <span className="text-white font-bold">Total à payer</span>
            <span className="text-gold font-extrabold text-2xl">
              {draft.totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
            </span>
          </div>
          {draft.reservationNumber && (
            <p className="text-gray-500 text-[10px] pt-1">Réf. {draft.reservationNumber}</p>
          )}
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-[11px] font-bold text-gold uppercase tracking-widest mb-4">Paiement sécurisé</h3>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <span className="text-xs text-gray-500">Paiement chiffré · Traité par Stripe</span>
        </div>

        <PaymentElement
          onReady={() => setReady(true)}
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* CGV */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={cgvAccepted}
          onChange={(e) => setCgvAccepted(e.target.checked)}
          className="mt-0.5 accent-gold w-4 h-4 shrink-0"
        />
        <span className="text-sm text-gray-600 leading-relaxed">
          J'accepte les{' '}
          <a href="#" target="_blank" className="text-navy font-semibold underline underline-offset-2 hover:text-gold transition-colors">
            Conditions Générales de Location
          </a>{' '}
          et la{' '}
          <a href="#" target="_blank" className="text-navy font-semibold underline underline-offset-2 hover:text-gold transition-colors">
            Politique de confidentialité
          </a>{' '}
          de JJ AUTO 92. Je confirme que les informations fournies sont exactes.
        </span>
      </label>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handlePay}
        disabled={!stripe || !elements || !ready || !cgvAccepted || paying}
        className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed text-navy font-extrabold text-sm py-4 rounded-xl uppercase tracking-widest transition-colors"
      >
        {paying ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Traitement en cours…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            Confirmer et payer — {draft.totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        Caution de {vehicle.deposit_amount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} € préautorisée séparément · Restituée en fin de location
      </p>

    </div>
  )
}
