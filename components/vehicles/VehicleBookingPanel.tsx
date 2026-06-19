'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import type { Vehicle, RentalOption } from '@/lib/types'
import type { UnavailabilityPeriod } from '@/lib/supabase/queries'

// ── Calendar helpers ────────────────────────────────────────────
const WEEK_DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function isoFromParts(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

// Parse as UTC midnight so toISOString() always returns the same calendar date
// regardless of the browser's local timezone (critical for UTC+ timezones like France).
function dateFromISO(iso: string) {
  return new Date(iso + 'T00:00:00Z')
}

function addDays(iso: string, n: number) {
  const d = dateFromISO(iso)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().split('T')[0]
}

function daysBetween(a: string, b: string) {
  return Math.round((dateFromISO(b).getTime() - dateFromISO(a).getTime()) / 86_400_000)
}

function buildBlockedSet(periods: UnavailabilityPeriod[]) {
  const set = new Set<string>()
  for (const { start_date, end_date } of periods) {
    const cur = dateFromISO(start_date)
    const end = dateFromISO(end_date)
    while (cur <= end) {
      set.add(cur.toISOString().split('T')[0])
      cur.setUTCDate(cur.getUTCDate() + 1)
    }
  }
  return set
}

function hasBlockedInRange(start: string, end: string, blocked: Set<string>) {
  const cur = dateFromISO(start)
  cur.setUTCDate(cur.getUTCDate() + 1)
  const endDate = dateFromISO(end)
  while (cur < endDate) {
    if (blocked.has(cur.toISOString().split('T')[0])) return true
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return false
}

// ── Pricing ──────────────────────────────────────────────────────
const TARIFF_ROWS = [
  { label: '1 jour', days: 1 },
  { label: 'Week-end (2 j)', days: 2 },
  { label: 'Semaine (7 j)', days: 7 },
  { label: 'Mois (30 j)', days: 30 },
]

// ── Component ────────────────────────────────────────────────────
interface Props {
  vehicle: Vehicle
  options: RentalOption[]
  unavailabilities: UnavailabilityPeriod[]
}

export default function VehicleBookingPanel({ vehicle, options, unavailabilities }: Props) {
  const today = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])
  const nowMonth = useMemo(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  }, [])

  const [calMonth, setCalMonth] = useState(nowMonth)
  const [selStart, setSelStart] = useState<string | null>(null)
  const [selEnd, setSelEnd] = useState<string | null>(null)
  const [hoverDate, setHoverDate] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set())

  const blocked = useMemo(() => buildBlockedSet(unavailabilities), [unavailabilities])

  // Hover range set (preview while selecting end date)
  const hoverRange = useMemo<Set<string>>(() => {
    if (!selStart || selEnd || !hoverDate || hoverDate <= selStart) return new Set()
    if (blocked.has(hoverDate) || hasBlockedInRange(selStart, hoverDate, blocked)) return new Set()
    const set = new Set<string>()
    let cur = addDays(selStart, 1)
    while (cur < hoverDate) {
      set.add(cur)
      cur = addDays(cur, 1)
    }
    return set
  }, [selStart, selEnd, hoverDate, blocked])

  // Selected range set
  const selectedRange = useMemo<Set<string>>(() => {
    if (!selStart || !selEnd) return new Set()
    const set = new Set<string>()
    let cur = addDays(selStart, 1)
    while (cur < selEnd) {
      set.add(cur)
      cur = addDays(cur, 1)
    }
    return set
  }, [selStart, selEnd])

  // ── Pricing calculation ───────────────────────────────────────
  const nbDays = selStart && selEnd ? daysBetween(selStart, selEnd) : 0
  const baseTotal = nbDays * vehicle.daily_rate

  const optionsTotal = useMemo(() => {
    return [...selectedOptions].reduce((sum, id) => {
      const opt = options.find((o) => o.id === id)
      if (!opt) return sum
      return sum + opt.price_per_day * nbDays + opt.price_fixed
    }, 0)
  }, [selectedOptions, options, nbDays])

  const grandTotal = baseTotal + optionsTotal

  // ── Options toggle ────────────────────────────────────────────
  const toggleOption = useCallback((id: string) => {
    setSelectedOptions((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  // ── Calendar ─────────────────────────────────────────────────
  const calYear = calMonth.getFullYear()
  const calMonthIdx = calMonth.getMonth()
  const daysInMonth = new Date(calYear, calMonthIdx + 1, 0).getDate()
  const firstDow = (() => {
    const d = new Date(calYear, calMonthIdx, 1).getDay()
    return d === 0 ? 6 : d - 1 // Mon = 0
  })()
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7

  function handleDayClick(iso: string) {
    if (iso < today || blocked.has(iso)) return

    if (!selStart || (selStart && selEnd)) {
      setSelStart(iso)
      setSelEnd(null)
      return
    }

    if (iso === selStart) {
      setSelStart(null)
      return
    }

    if (iso < selStart) {
      setSelStart(iso)
      setSelEnd(null)
      return
    }

    if (hasBlockedInRange(selStart, iso, blocked)) {
      // Blocked date in range — restart from clicked date
      setSelStart(iso)
      setSelEnd(null)
      return
    }

    setSelEnd(iso)
  }

  function getDayStyle(iso: string, isPast: boolean, isBlocked: boolean) {
    if (isPast) return 'text-gray-300 cursor-default'
    if (isBlocked) return 'text-red-300 bg-red-50 rounded-lg cursor-not-allowed line-through'
    if (iso === selStart || iso === selEnd) return 'bg-navy text-white font-bold rounded-lg cursor-pointer'
    if (selectedRange.has(iso)) return 'bg-gold/25 text-navy cursor-pointer'
    if (hoverRange.has(iso)) return 'bg-gold/15 text-navy cursor-pointer'
    if (iso === today) return 'ring-1 ring-gold text-navy font-semibold rounded-lg cursor-pointer hover:bg-gold/10'
    return 'text-navy hover:bg-gray-100 rounded-lg cursor-pointer'
  }

  const reserveHref = useMemo(() => {
    const base = `/reservation?vehicle=${vehicle.slug ?? vehicle.id}`
    if (selStart && selEnd) return `${base}&from=${selStart}&to=${selEnd}`
    return base
  }, [vehicle.slug, vehicle.id, selStart, selEnd])

  const canGoBack = calMonth > nowMonth

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      {/* ── Desktop sticky panel ── */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Price header */}
          <div className="bg-navy px-6 py-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest">À partir de</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-4xl font-extrabold text-white">{vehicle.daily_rate}</span>
                  <span className="text-gold font-bold">€</span>
                  <span className="text-gray-500 text-sm">/ jour</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs">Caution</p>
                <p className="text-white font-bold">{vehicle.deposit_amount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</p>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 space-y-6">

            {/* Tariff table */}
            <div>
              <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-3">Grille tarifaire</p>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                {TARIFF_ROWS.map(({ label, days }, i) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <span className="text-gray-600">{label}</span>
                    <div className="text-right">
                      <span className="font-bold text-navy">{(vehicle.daily_rate * days).toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</span>
                      <span className="text-gray-400 text-xs ml-1">({vehicle.daily_rate} €/j)</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-[10px] mt-2 leading-relaxed">
                Supplément week-end et haute saison applicable. Tarifs dégressifs pour longues durées — nous contacter.
              </p>
            </div>

            {/* Km inclus */}
            <div className="flex items-center gap-3 bg-gold/10 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              <div>
                <p className="text-navy font-bold text-sm">{vehicle.mileage_included_per_day.toLocaleString('fr-FR')} km inclus / jour</p>
                <p className="text-gray-500 text-xs">{vehicle.excess_mileage_rate} €/km au-delà</p>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-100" />

            {/* Options */}
            {options.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-3">Options disponibles</p>
                <div className="space-y-2">
                  {options.map((opt) => {
                    const checked = selectedOptions.has(opt.id)
                    const priceLabel = opt.price_fixed > 0 && opt.price_per_day === 0
                      ? `${opt.price_fixed} €`
                      : opt.price_per_day > 0
                        ? `${opt.price_per_day} €/j${nbDays > 0 ? ` · ${(opt.price_per_day * nbDays + opt.price_fixed).toLocaleString('fr-FR')} € total` : ''}`
                        : 'Inclus'

                    return (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-colors border ${
                          checked ? 'bg-gold/10 border-gold/40' : 'bg-gray-50 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOption(opt.id)}
                          className="mt-0.5 accent-gold shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-navy font-semibold text-sm">{opt.name}</span>
                            <span className="text-gold font-bold text-xs whitespace-nowrap">{priceLabel}</span>
                          </div>
                          {opt.description && (
                            <p className="text-gray-500 text-xs mt-0.5 leading-snug">{opt.description}</p>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Separator */}
            <div className="border-t border-gray-100" />

            {/* Availability calendar */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Disponibilités</p>
                {(selStart || selEnd) && (
                  <button
                    onClick={() => { setSelStart(null); setSelEnd(null) }}
                    className="text-[10px] text-gray-400 hover:text-navy underline underline-offset-2 transition-colors"
                  >
                    Effacer dates
                  </button>
                )}
              </div>

              {/* Calendar navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setCalMonth(new Date(calYear, calMonthIdx - 1, 1))}
                  disabled={!canGoBack}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  aria-label="Mois précédent"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <p className="text-navy font-bold text-sm">
                  {MONTHS_FR[calMonthIdx]} {calYear}
                </p>
                <button
                  onClick={() => setCalMonth(new Date(calYear, calMonthIdx + 1, 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Mois suivant"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 mb-1">
                {WEEK_DAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-y-0.5">
                {Array.from({ length: totalCells }, (_, idx) => {
                  const day = idx - firstDow + 1
                  if (day < 1 || day > daysInMonth) {
                    return <div key={idx} />
                  }
                  const iso = isoFromParts(calYear, calMonthIdx, day)
                  const isPast = iso < today
                  const isBlocked = blocked.has(iso)
                  const style = getDayStyle(iso, isPast, isBlocked)
                  const isEndRound = iso === selEnd
                  const isStartRound = iso === selStart

                  return (
                    <div
                      key={iso}
                      role={isPast || isBlocked ? undefined : 'button'}
                      tabIndex={isPast || isBlocked ? undefined : 0}
                      onClick={() => handleDayClick(iso)}
                      onMouseEnter={() => !selEnd && selStart && setHoverDate(iso)}
                      onMouseLeave={() => setHoverDate(null)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDayClick(iso)}
                      className={`relative text-center text-sm py-1.5 select-none transition-colors ${style} ${isStartRound || isEndRound ? 'z-10' : ''}`}
                      aria-label={isBlocked ? `${iso} indisponible` : iso}
                      aria-pressed={iso === selStart || iso === selEnd}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-navy" />
                  <span className="text-[10px] text-gray-400">Sélectionné</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gold/25" />
                  <span className="text-[10px] text-gray-400">Période choisie</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-red-50 border border-red-200" />
                  <span className="text-[10px] text-gray-400">Indisponible</span>
                </div>
              </div>
            </div>

            {/* Price summary — shown when dates selected */}
            {selStart && selEnd && nbDays > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Récapitulatif</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {nbDays} jour{nbDays > 1 ? 's' : ''} × {vehicle.daily_rate} €
                  </span>
                  <span className="font-semibold text-navy">{baseTotal.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</span>
                </div>
                {[...selectedOptions].map((id) => {
                  const opt = options.find((o) => o.id === id)
                  if (!opt) return null
                  const cost = opt.price_per_day * nbDays + opt.price_fixed
                  return (
                    <div key={id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate max-w-[60%]">{opt.name}</span>
                      <span className="font-semibold text-navy">{cost.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</span>
                    </div>
                  )
                })}
                <div className="border-t border-gray-200 pt-2.5 flex justify-between">
                  <span className="font-bold text-navy">Total estimé</span>
                  <span className="font-extrabold text-navy text-lg">
                    {grandTotal.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
                  </span>
                </div>
                <p className="text-gray-400 text-[10px]">Hors caution. Prix définitif à la confirmation.</p>
              </div>
            )}

            {/* Desktop CTA */}
            <Link
              href={reserveHref}
              className="flex items-center justify-center gap-2 w-full bg-gold hover:bg-gold-400 text-navy font-extrabold text-sm py-4 rounded-xl uppercase tracking-widest transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              {selStart && selEnd ? 'Confirmer la réservation' : 'Réserver ce véhicule'}
            </Link>

            {/* Phone fallback */}
            <a
              href="tel:+33761422192"
              className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-600 hover:text-navy hover:border-navy text-sm py-3 rounded-xl font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              07 61 42 21 92 — Réserver par téléphone
            </a>

          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom CTA ── */}
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] px-4 py-3 safe-bottom">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="shrink-0">
            {selStart && selEnd && nbDays > 0 ? (
              <>
                <p className="text-[10px] text-gray-500 leading-none">{nbDays} j · total estimé</p>
                <p className="text-lg font-extrabold text-navy leading-tight">
                  {grandTotal.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] text-gray-500 leading-none">À partir de</p>
                <p className="text-lg font-extrabold text-navy leading-tight">
                  {vehicle.daily_rate} €<span className="text-xs font-normal text-gray-400">/jour</span>
                </p>
              </>
            )}
          </div>
          <Link
            href={reserveHref}
            className="flex-1 text-center bg-gold hover:bg-gold-400 text-navy font-extrabold text-sm py-3.5 rounded-xl uppercase tracking-widest transition-colors"
          >
            {selStart && selEnd ? 'Confirmer' : 'Réserver ce véhicule'}
          </Link>
        </div>
      </div>
    </>
  )
}
