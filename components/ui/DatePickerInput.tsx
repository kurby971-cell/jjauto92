'use client'

import { useState, useRef, useEffect } from 'react'

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS_FR = ['Lu','Ma','Me','Je','Ve','Sa','Di']

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function parseISO(iso: string) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m: m - 1, d }
}

function localToday() {
  const d = new Date()
  return toISO(d.getFullYear(), d.getMonth(), d.getDate())
}

function formatFR(iso: string) {
  const p = parseISO(iso)
  if (!p) return ''
  return `${String(p.d).padStart(2, '0')} ${MONTHS_FR[p.m]} ${p.y}`
}

interface Props {
  value: string
  onChange: (v: string) => void
  min?: string
  max?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  variant?: 'light' | 'dark'
}

export default function DatePickerInput({
  value, onChange, min, max,
  placeholder = 'Choisir une date',
  disabled = false,
  className = '',
  variant = 'light',
}: Props) {
  const today = localToday()
  const isDark = variant === 'dark'
  const thisYear = new Date().getFullYear()

  // Year range: driven by min/max, defaulting to 1940–thisYear+10
  const yearMin = min ? (parseISO(min)?.y ?? thisYear) : 1940
  const yearMax = max ? (parseISO(max)?.y ?? thisYear) : thisYear + 10
  // Descending so the most recent valid year appears at the top of the dropdown
  const years = Array.from({ length: yearMax - yearMin + 1 }, (_, i) => yearMax - i)

  // Initialise the calendar to: value month → max month → min month → today
  const initView = () => {
    const p = parseISO(value) ?? parseISO(max ?? '') ?? parseISO(min ?? '') ?? parseISO(today)!
    return { y: p.y, m: p.m }
  }

  const [open, setOpen] = useState(false)
  const [viewY, setViewY] = useState(() => initView().y)
  const [viewM, setViewM] = useState(() => initView().m)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync calendar view when value changes externally
  useEffect(() => {
    const p = parseISO(value)
    if (p) { setViewY(p.y); setViewM(p.m) }
  }, [value])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open])

  function selectDay(d: number) {
    onChange(toISO(viewY, viewM, d))
    setOpen(false)
  }

  function isDayDisabled(d: number) {
    const iso = toISO(viewY, viewM, d)
    if (min && iso < min) return true
    if (max && iso > max) return true
    return false
  }

  const totalDays = new Date(viewY, viewM + 1, 0).getDate()
  const firstWeekday = (() => {
    const dow = new Date(viewY, viewM, 1).getDay()
    return dow === 0 ? 6 : dow - 1  // Mon=0 … Sun=6
  })()

  const selectedP = parseISO(value)
  const todayP = parseISO(today)

  const triggerCls = [
    'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-colors',
    isDark
      ? 'bg-white/5 border border-white/20 hover:border-white/40'
      : 'bg-white border border-gray-200 hover:border-gray-300',
    open && isDark ? 'border-gold/70' : '',
    open && !isDark ? 'border-[#C9A84C] ring-2 ring-[#C9A84C]/20' : '',
    disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
  ].filter(Boolean).join(' ')

  const selectCls = 'bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold text-[#0D1B2A] cursor-pointer focus:outline-none focus:border-[#C9A84C] transition-colors'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={triggerCls}
      >
        <svg
          className={`w-4 h-4 shrink-0 ${isDark ? 'text-white/50' : 'text-gray-400'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>

        <span className={
          value
            ? (isDark ? 'text-white' : 'text-[#0D1B2A]')
            : (isDark ? 'text-white/50' : 'text-gray-400')
        }>
          {value ? formatFR(value) : placeholder}
        </span>

        {value && !disabled && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange('') }}
            className={`ml-auto shrink-0 leading-none transition-colors ${isDark ? 'text-white/30 hover:text-white/70' : 'text-gray-300 hover:text-gray-500'}`}
            aria-label="Effacer"
          >
            ✕
          </button>
        )}
      </button>

      {/* Calendar popup */}
      {open && (
        <div className="absolute z-50 mt-1.5 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 select-none">
          {/* Month + year dropdowns */}
          <div className="flex items-center gap-2 mb-3">
            <select
              value={viewM}
              onChange={e => setViewM(Number(e.target.value))}
              className={`flex-1 ${selectCls}`}
            >
              {MONTHS_FR.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
            <select
              value={viewY}
              onChange={e => setViewY(Number(e.target.value))}
              className={`w-[74px] ${selectCls}`}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-0.5">
            {DAYS_FR.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`gap-${i}`} />
            ))}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1
              const dis = isDayDisabled(day)
              const sel = selectedP?.y === viewY && selectedP?.m === viewM && selectedP?.d === day
              const isToday = todayP?.y === viewY && todayP?.m === viewM && todayP?.d === day

              return (
                <button
                  key={day}
                  type="button"
                  disabled={dis}
                  onClick={() => selectDay(day)}
                  className={[
                    'w-full aspect-square flex items-center justify-center text-xs font-medium rounded-lg transition-colors',
                    sel ? 'bg-[#0D1B2A] text-white' : '',
                    !sel && isToday ? 'border border-[#C9A84C] text-[#0D1B2A] font-bold' : '',
                    !sel && !isToday && !dis ? 'hover:bg-gray-100 text-gray-700 cursor-pointer' : '',
                    dis ? 'text-gray-200 cursor-not-allowed' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
