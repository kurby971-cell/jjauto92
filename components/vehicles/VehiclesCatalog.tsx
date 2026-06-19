'use client'

import { useState, useMemo } from 'react'
import VehicleCard from './VehicleCard'
import type { Vehicle, VehicleCategory } from '@/lib/types'
import type { ReservedPeriod } from '@/lib/supabase/queries'
import DatePickerInput from '@/components/ui/DatePickerInput'

const CATEGORIES: { value: VehicleCategory | ''; label: string }[] = [
  { value: '', label: 'Tous' },
  { value: 'economy', label: 'Économique' },
  { value: 'compact', label: 'Compacte' },
  { value: 'standard', label: 'Standard' },
  { value: 'suv', label: 'SUV' },
  { value: 'premium', label: 'Premium' },
  { value: 'luxury', label: 'Luxe' },
  { value: 'utility', label: 'Utilitaire' },
]

function overlaps(vehicleId: string, start: string, end: string, periods: ReservedPeriod[]) {
  return periods.some(
    (p) => p.vehicle_id === vehicleId && p.start_date <= end && p.end_date >= start
  )
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

interface Props {
  vehicles: Vehicle[]
  reservedPeriods: ReservedPeriod[]
}

export default function VehiclesCatalog({ vehicles, reservedPeriods }: Props) {
  const [category, setCategory] = useState<VehicleCategory | ''>('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const priceMax = useMemo(
    () => Math.ceil(Math.max(...vehicles.map((v) => v.daily_rate), 200) / 10) * 10,
    [vehicles]
  )
  const effectiveMaxPrice = maxPrice ?? priceMax

  const today = new Date().toISOString().split('T')[0]
  const datesValid = dateStart && dateEnd && dateStart <= dateEnd

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (category && v.category !== category) return false
      if (v.daily_rate > effectiveMaxPrice) return false
      if (datesValid && overlaps(v.id, dateStart, dateEnd, reservedPeriods)) return false
      return true
    })
  }, [vehicles, category, dateStart, dateEnd, effectiveMaxPrice, datesValid, reservedPeriods])

  const unavailableCount = datesValid
    ? vehicles.filter(
        (v) =>
          (!category || v.category === category) &&
          v.daily_rate <= effectiveMaxPrice &&
          overlaps(v.id, dateStart, dateEnd, reservedPeriods)
      ).length
    : 0

  const hasFilters = !!(category || dateStart || dateEnd || maxPrice !== null)

  function resetFilters() {
    setCategory('')
    setDateStart('')
    setDateEnd('')
    setMaxPrice(null)
  }

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Page hero ── */}
      <div className="bg-navy">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14 lg:py-20">
          <span className="text-gold text-[11px] font-bold uppercase tracking-[0.2em]">Catalogue</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-3 leading-tight">
            Notre flotte
          </h1>
          <div className="w-14 h-1 bg-gold mt-5" />
          <p className="text-gray-400 mt-4 max-w-xl">
            {vehicles.length} véhicule{vehicles.length !== 1 ? 's' : ''} — assurance incluse, livraison possible, tarifs transparents.
          </p>
        </div>
      </div>

      {/* ── Filters bar (sticky) ── */}
      <div className="sticky top-20 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">

          {/* Mobile toggle */}
          <div className="lg:hidden flex items-center justify-between py-3">
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="flex items-center gap-2 text-sm font-bold text-navy"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
              </svg>
              Filtrer
              {hasFilters && <span className="bg-gold text-navy text-[10px] font-black px-1.5 py-0.5 rounded-full">●</span>}
            </button>
            <span className="text-sm text-gray-500">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Filter content */}
          <div className={`pb-4 ${filtersOpen ? 'block' : 'hidden'} lg:block`}>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap pt-3 lg:pt-4">
              {CATEGORIES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setCategory(value)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
                    category === value
                      ? 'bg-navy text-gold'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Date + price row */}
            <div className="flex flex-wrap gap-3 items-end mt-3">

              {/* Date début */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Départ</label>
                <DatePickerInput
                  value={dateStart}
                  min={today}
                  onChange={(v) => {
                    setDateStart(v)
                    if (dateEnd && v > dateEnd) setDateEnd('')
                  }}
                  className="w-40"
                />
              </div>

              {/* Date retour */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Retour</label>
                <DatePickerInput
                  value={dateEnd}
                  min={dateStart || today}
                  onChange={setDateEnd}
                  disabled={!dateStart}
                  className="w-40"
                />
              </div>

              {/* Prix max */}
              <div className="flex flex-col gap-1.5 min-w-[180px]">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Prix max :{' '}
                  <span className="text-navy normal-case tracking-normal">
                    {effectiveMaxPrice === priceMax ? 'tous prix' : `${effectiveMaxPrice} €/j`}
                  </span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={priceMax}
                  step={10}
                  value={effectiveMaxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full accent-gold cursor-pointer"
                />
              </div>

              {/* Reset */}
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-navy transition-colors pb-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  Effacer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">

        {/* Result info bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <p className="text-sm text-gray-500">
            <span className="font-bold text-navy">{filtered.length}</span> véhicule{filtered.length !== 1 ? 's' : ''}
            {datesValid && ` disponible${filtered.length !== 1 ? 's' : ''} du ${fmt(dateStart)} au ${fmt(dateEnd)}`}
          </p>
          {unavailableCount > 0 && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              {unavailableCount} indisponible{unavailableCount !== 1 ? 's' : ''} sur ces dates
            </span>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-9 h-9 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1M13 16l-2 1M13 16V6m0 10h5l2-1V8a1 1 0 00-.44-.82L18 6h-5v10z"/>
              </svg>
            </div>
            <div>
              <p className="text-navy font-bold text-lg">Aucun véhicule disponible</p>
              <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
                {datesValid
                  ? 'Tous nos véhicules sont réservés sur ces dates. Essayez une autre période.'
                  : 'Aucun véhicule ne correspond à vos critères.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetFilters}
                className="bg-navy text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-navy/90 transition-colors"
              >
                Réinitialiser les filtres
              </button>
              <a
                href="tel:+33761422192"
                className="flex items-center gap-2 bg-gold text-navy text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-gold/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                Nous appeler
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
