'use client'

import { useState, useMemo } from 'react'
import type { Vehicle, RentalOption } from '@/lib/types'
import type { ReservationDraft } from './types'
import DatePickerInput from '@/components/ui/DatePickerInput'

const FUEL_LABELS: Record<string, string> = {
  essence: 'Essence', diesel: 'Diesel', electrique: 'Électrique',
  hybride: 'Hybride', hybride_rechargeable: 'Hybride plug-in',
}
const CATEGORY_LABELS: Record<string, string> = {
  economy: 'Économique', compact: 'Compacte', standard: 'Standard',
  suv: 'SUV', premium: 'Premium', luxury: 'Luxe', utility: 'Utilitaire',
}

interface Props {
  vehicle: Vehicle
  options: RentalOption[]
  draft: ReservationDraft
  onComplete: (data: Pick<ReservationDraft, 'dateStart' | 'dateEnd' | 'nbDays' | 'selectedOptionIds' | 'baseAmount' | 'optionsAmount' | 'totalAmount' | 'depositAmount'>) => void
}

export default function Step1Summary({ vehicle, options, draft, onComplete }: Props) {
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [dateStart, setDateStart] = useState(draft.dateStart)
  const [dateEnd, setDateEnd] = useState(draft.dateEnd)
  const [selectedIds, setSelectedIds] = useState<string[]>(draft.selectedOptionIds)

  const nbDays = useMemo(() => {
    if (!dateStart || !dateEnd || dateEnd <= dateStart) return 0
    return Math.round((new Date(dateEnd).getTime() - new Date(dateStart).getTime()) / 86_400_000)
  }, [dateStart, dateEnd])

  const baseAmount = nbDays * vehicle.daily_rate
  const optionsAmount = useMemo(() => {
    return options
      .filter((o) => selectedIds.includes(o.id))
      .reduce((sum, o) => sum + o.price_per_day * nbDays + o.price_fixed, 0)
  }, [options, selectedIds, nbDays])
  const totalAmount = baseAmount + optionsAmount

  const primaryPhoto = vehicle.photos?.find((p) => p.is_primary) ?? vehicle.photos?.[0]
  const canContinue = nbDays > 0

  function toggleOption(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  function handleContinue() {
    if (!canContinue) return
    onComplete({
      dateStart, dateEnd, nbDays, selectedOptionIds: selectedIds,
      baseAmount, optionsAmount, totalAmount, depositAmount: vehicle.deposit_amount,
    })
  }

  // Format dates for display
  const fmtDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

  return (
    <div className="space-y-6">

      {/* Vehicle card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row">
          {/* Photo */}
          <div className="sm:w-52 shrink-0 aspect-video sm:aspect-auto bg-navy relative">
            {primaryPhoto ? (
              <img
                src={primaryPhoto.url}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-gold/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1M13 16l-2 1M13 16V6m0 10h5l2-1V8a1 1 0 00-.44-.82L18 6h-5v10z"/>
                </svg>
              </div>
            )}
          </div>
          {/* Info */}
          <div className="p-5 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-navy text-gold text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                {CATEGORY_LABELS[vehicle.category] ?? vehicle.category}
              </span>
            </div>
            <h2 className="text-navy font-extrabold text-xl">{vehicle.brand} {vehicle.model}</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {vehicle.year} · {FUEL_LABELS[vehicle.fuel_type] ?? vehicle.fuel_type} · {vehicle.transmission === 'automatique' ? 'Automatique' : 'Manuelle'} · {vehicle.seats} places
            </p>
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {vehicle.features.slice(0, 4).map((f) => (
                  <span key={f} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-medium">{f}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-[11px] font-bold text-gold uppercase tracking-widest mb-4">Période de location</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date de départ</label>
            <DatePickerInput
              value={dateStart}
              min={today}
              onChange={(v) => {
                setDateStart(v)
                if (dateEnd && v >= dateEnd) setDateEnd('')
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date de retour</label>
            <DatePickerInput
              value={dateEnd}
              min={dateStart ? (() => { const d = new Date(dateStart + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().split('T')[0] })() : today}
              disabled={!dateStart}
              onChange={setDateEnd}
            />
          </div>
        </div>
        {nbDays > 0 && (
          <p className="text-gold text-xs font-semibold mt-3">
            ✓ {nbDays} jour{nbDays > 1 ? 's' : ''} — du {fmtDate(dateStart)} au {fmtDate(dateEnd)}
          </p>
        )}
      </div>

      {/* Options */}
      {options.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-[11px] font-bold text-gold uppercase tracking-widest mb-4">Options (facultatif)</h3>
          <div className="space-y-2">
            {options.map((opt) => {
              const checked = selectedIds.includes(opt.id)
              const cost = nbDays > 0
                ? opt.price_per_day * nbDays + opt.price_fixed
                : opt.price_fixed > 0 ? opt.price_fixed : null
              return (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 rounded-xl p-3 cursor-pointer border transition-colors ${
                    checked ? 'bg-gold/10 border-gold/40' : 'bg-gray-50 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOption(opt.id)}
                    className="mt-0.5 accent-gold"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-navy font-semibold text-sm">{opt.name}</span>
                      <span className="text-gold font-bold text-xs whitespace-nowrap">
                        {opt.price_per_day > 0 ? `${opt.price_per_day} €/j${cost ? ` · ${cost} €` : ''}` : `${opt.price_fixed} €`}
                      </span>
                    </div>
                    {opt.description && <p className="text-gray-500 text-xs mt-0.5 leading-snug">{opt.description}</p>}
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Price summary */}
      <div className="bg-navy rounded-2xl p-5">
        <h3 className="text-[11px] font-bold text-gold uppercase tracking-widest mb-4">Récapitulatif tarifaire</h3>
        {nbDays > 0 ? (
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{nbDays} jour{nbDays > 1 ? 's' : ''} × {vehicle.daily_rate} €</span>
              <span className="text-white font-semibold">{baseAmount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</span>
            </div>
            {options.filter((o) => selectedIds.includes(o.id)).map((opt) => {
              const cost = opt.price_per_day * nbDays + opt.price_fixed
              return (
                <div key={opt.id} className="flex justify-between text-sm">
                  <span className="text-gray-400 truncate max-w-[60%]">+ {opt.name}</span>
                  <span className="text-white font-semibold">{cost.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</span>
                </div>
              )
            })}
            <div className="border-t border-navy-700 pt-2.5 flex justify-between">
              <span className="text-white font-bold">Total location</span>
              <span className="text-gold font-extrabold text-xl">{totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 pt-1">
              <span>Caution (remboursée)</span>
              <span>{vehicle.deposit_amount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Sélectionnez vos dates pour voir le prix total.</p>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={handleContinue}
        disabled={!canContinue}
        className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed text-navy font-extrabold text-sm py-4 rounded-xl uppercase tracking-widest transition-colors"
      >
        Continuer — Informations conducteur
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  )
}
