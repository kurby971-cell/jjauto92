'use client'

import { useState } from 'react'

interface Option {
  id: string
  code: string
  name: string
  description: string | null
  price_per_day: number
  price_fixed: number
  is_active: boolean
}

function priceLabel(o: Option) {
  const parts: string[] = []
  if (Number(o.price_per_day) > 0) parts.push(`${Number(o.price_per_day)} €/jour`)
  if (Number(o.price_fixed) > 0) parts.push(`${Number(o.price_fixed)} € forfait`)
  return parts.join(' + ') || 'Gratuit'
}

export default function OptionsManager({ options }: { options: Option[] }) {
  const [items, setItems] = useState(options)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function toggle(o: Option) {
    setBusyId(o.id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/options/${o.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !o.is_active }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Erreur')
      setItems((prev) => prev.map((x) => (x.id === o.id ? { ...x, is_active: !o.is_active } : x)))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
      {error && <p className="px-5 py-3 text-sm text-red-600">{error}</p>}
      {items.map((o) => (
        <div key={o.id} className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <p className={`font-semibold text-sm ${o.is_active ? 'text-[#0D1B2A]' : 'text-gray-400'}`}>{o.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{priceLabel(o)}{o.description ? ` — ${o.description}` : ''}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={o.is_active}
            aria-label={`${o.is_active ? 'Désactiver' : 'Activer'} ${o.name}`}
            disabled={busyId === o.id}
            onClick={() => toggle(o)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${o.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${o.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      ))}
      {items.length === 0 && <p className="px-5 py-6 text-sm text-gray-500">Aucune option.</p>}
    </div>
  )
}
