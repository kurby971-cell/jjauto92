'use client'

import { useState, useEffect, useCallback } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/client'
import type { Vehicle, RentalOption } from '@/lib/types'
import type { ReservationDraft, DriverData, DocumentRefs } from './types'
import { EMPTY_DOCS } from './types'
import ProgressBar from './ProgressBar'
import Step1Summary from './Step1Summary'
import Step2Driver from './Step2Driver'
import Step3Payment from './Step3Payment'

const LS_KEY = 'jjauto92_reservation_draft'

interface Props {
  vehicle: Vehicle | null
  rentalOptions: RentalOption[]
  initialDateStart: string | null
  initialDateEnd: string | null
}

function buildInitialDraft(vehicle: Vehicle, from: string | null, to: string | null): ReservationDraft {
  return {
    vehicleId: vehicle.id,
    vehicleSlug: vehicle.slug,
    dateStart: from ?? '',
    dateEnd: to ?? '',
    nbDays: 0,
    selectedOptionIds: [],
    baseAmount: 0,
    optionsAmount: 0,
    totalAmount: 0,
    depositAmount: vehicle.deposit_amount,
    driver: null,
    documents: EMPTY_DOCS,
    reservationId: null,
    reservationNumber: null,
    lastStep: 1,
  }
}

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

export default function ReservationTunnel({ vehicle, rentalOptions, initialDateStart, initialDateEnd }: Props) {
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<ReservationDraft | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [depositClientSecret, setDepositClientSecret] = useState<string | null>(null)
  const [creatingReservation, setCreatingReservation] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Init draft from localStorage or URL params
  useEffect(() => {
    if (!vehicle) return
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.vehicleId === vehicle.id) {
          // Extract _clientSecret before spreading into draft (not part of ReservationDraft type)
          const { _clientSecret: savedCs, _depositClientSecret: savedDepCs, ...draftData } = parsed as ReservationDraft & { _clientSecret?: string; _depositClientSecret?: string }
          setDraft({
            ...draftData,
            dateStart: initialDateStart ?? draftData.dateStart,
            dateEnd: initialDateEnd ?? draftData.dateEnd,
          })
          if (savedCs) {
            // clientSecret présent → restaure step 3 normalement
            setClientSecret(savedCs)
            if (savedDepCs) setDepositClientSecret(savedDepCs)
            setStep(draftData.lastStep ?? 1)
          } else if ((draftData.lastStep ?? 1) === 3) {
            // step 3 sans clientSecret (ancien format LS ou session interrompue)
            // → retour à l'étape 1 pour éviter le spinner infini
            setStep(1)
          } else {
            setStep(draftData.lastStep ?? 1)
          }
          return
        }
      }
    } catch {}
    setDraft(buildInitialDraft(vehicle, initialDateStart, initialDateEnd))
  }, [vehicle?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist draft to localStorage — clientSecret stored under _clientSecret so it
  // survives page refreshes while step 3 is active (Stripe PI client secrets are
  // safe for short-term client-side storage; they don't grant server-side access)
  useEffect(() => {
    if (draft) {
      const data: Record<string, unknown> = { ...draft, lastStep: step }
      if (clientSecret) data._clientSecret = clientSecret
      if (depositClientSecret) data._depositClientSecret = depositClientSecret
      localStorage.setItem(LS_KEY, JSON.stringify(data))
    }
  }, [draft, step, clientSecret])

  const updateDraft = useCallback((updates: Partial<ReservationDraft>) => {
    setDraft((prev) => prev ? { ...prev, ...updates } : prev)
  }, [])

  // ── Step 1 → 2 ──────────────────────────────────────────────
  function handleStep1Complete(data: Pick<ReservationDraft,
    'dateStart' | 'dateEnd' | 'nbDays' | 'selectedOptionIds' |
    'baseAmount' | 'optionsAmount' | 'totalAmount' | 'depositAmount'
  >) {
    updateDraft(data)
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Step 2 → 3 (creates reservation + payment intent) ────────
  async function handleStep2Complete(driver: DriverData, documents: DocumentRefs) {
    if (!draft) return
    setCreateError(null)
    setCreatingReservation(true)

    updateDraft({ driver, documents })

    try {
      const res = await fetch('/api/reservation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: draft.vehicleId,
          dateStart: draft.dateStart,
          dateEnd: draft.dateEnd,
          selectedOptionIds: draft.selectedOptionIds,
          driver,
          documents,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erreur serveur')

      const { clientSecret: cs, depositClientSecret: depCs, reservationId, reservationNumber } = json
      if (!cs) {
        throw new Error('Erreur d\'initialisation du paiement (client secret manquant). Veuillez réessayer.')
      }
      setClientSecret(cs)
      if (depCs) setDepositClientSecret(depCs)
      updateDraft({ reservationId, reservationNumber })
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setCreateError((err as Error).message)
    } finally {
      setCreatingReservation(false)
    }
  }

  function handleBack() {
    setStep((s) => Math.max(1, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── No vehicle ───────────────────────────────────────────────
  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1M13 16l-2 1M13 16V6m0 10h5l2-1V8a1 1 0 00-.44-.82L18 6h-5v10z"/>
            </svg>
          </div>
          <h1 className="text-navy font-extrabold text-xl mb-2">Aucun véhicule sélectionné</h1>
          <p className="text-gray-500 text-sm mb-6">Commencez par choisir un véhicule dans notre catalogue.</p>
          <a href="/vehicules" className="inline-flex items-center gap-2 bg-gold text-navy font-extrabold text-sm px-6 py-3 rounded-xl uppercase tracking-widest">
            Voir nos véhicules
          </a>
        </div>
      </div>
    )
  }

  if (!draft) return null // Hydrating

  return (
    <div className="bg-gray-50 min-h-screen pb-16">

      {/* Header */}
      <div className="bg-navy border-b border-navy-700">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-gold text-[11px] font-bold uppercase tracking-[0.2em] mb-1">Réservation</p>
          <h1 className="text-white font-extrabold text-2xl">
            {vehicle.brand} {vehicle.model}
          </h1>
          <p className="text-gray-500 text-sm mt-3">
            {step < 3 ? (
              <>Étape {step} sur 3</>
            ) : (
              <>Finalisation du paiement</>
            )}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-20 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <ProgressBar current={step} />
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-2xl mx-auto px-4 py-8">

        {createError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p className="text-red-700 text-sm font-semibold">{createError}</p>
              <a href="tel:+33761422192" className="text-red-500 text-xs underline mt-0.5 block">
                Besoin d'aide ? Appelez-nous : 07 61 42 21 92
              </a>
            </div>
          </div>
        )}

        {step === 1 && (
          <Step1Summary
            vehicle={vehicle}
            options={rentalOptions}
            draft={draft}
            onComplete={handleStep1Complete}
          />
        )}

        {step === 2 && (
          <Step2Driver
            draft={draft}
            onComplete={handleStep2Complete}
            onBack={handleBack}
            loading={creatingReservation}
          />
        )}

        {step === 3 && clientSecret && (
          <Elements
            stripe={getStripe()}
            options={{ clientSecret, appearance: stripeAppearance }}
          >
            <Step3Payment vehicle={vehicle} draft={draft} />
          </Elements>
        )}

        {step === 3 && !clientSecret && (
          <div className="text-center py-16">
            <svg className="w-8 h-8 text-gold mx-auto animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-gray-500 text-sm mt-3">Initialisation du paiement…</p>
          </div>
        )}

        {/* Step 3: no back (reservation already created) */}
        {step === 3 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Besoin de modifier quelque chose ?{' '}
            <a href="tel:+33761422192" className="underline hover:text-navy transition-colors">
              Appelez-nous : 07 61 42 21 92
            </a>
          </p>
        )}

      </div>
    </div>
  )
}
