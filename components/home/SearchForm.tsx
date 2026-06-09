'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export default function SearchForm() {
  const router = useRouter()
  const [from, setFrom] = useState(todayStr)
  const [to, setTo] = useState(tomorrowStr)
  const [pickupTime, setPickupTime] = useState('09:00')
  const [returnTime, setReturnTime] = useState('09:00')

  function handleFromChange(value: string) {
    setFrom(value)
    if (value >= to) {
      const next = new Date(value)
      next.setDate(next.getDate() + 1)
      setTo(next.toISOString().split('T')[0])
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams({
      from,
      to,
      pickup_time: pickupTime,
      return_time: returnTime,
    })
    router.push(`/vehicules?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">

        {/* Date départ */}
        <div className="lg:col-span-1">
          <label className="block text-gold text-[10px] font-bold uppercase tracking-widest mb-1.5">
            Départ
          </label>
          <input
            type="date"
            value={from}
            min={todayStr()}
            onChange={(e) => handleFromChange(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition-colors"
            required
          />
        </div>

        {/* Heure départ */}
        <div>
          <label className="block text-gold text-[10px] font-bold uppercase tracking-widest mb-1.5">
            Heure
          </label>
          <input
            type="time"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {/* Date retour */}
        <div className="lg:col-span-1">
          <label className="block text-gold text-[10px] font-bold uppercase tracking-widest mb-1.5">
            Retour
          </label>
          <input
            type="date"
            value={to}
            min={from || todayStr()}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition-colors"
            required
          />
        </div>

        {/* Heure retour */}
        <div>
          <label className="block text-gold text-[10px] font-bold uppercase tracking-widest mb-1.5">
            Heure
          </label>
          <input
            type="time"
            value={returnTime}
            onChange={(e) => setReturnTime(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-gold hover:bg-gold-400 active:bg-gold-600 text-navy font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
          </svg>
          Rechercher
        </button>
      </div>
    </form>
  )
}
