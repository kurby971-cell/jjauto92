'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CashBalance({ reservationId, amount }: { reservationId: string; amount: number }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}/cash-payment`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erreur')
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
      setLoading(false)
    }
  }

  const label = amount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €'

  return (
    <div className="mt-3">
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-lg"
        >
          Solde de {label} encaissé en espèces
        </button>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-600">Confirmer l&apos;encaissement de {label} en espèces ?</span>
          <button onClick={submit} disabled={loading} className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50">
            {loading ? 'Enregistrement…' : 'Oui, encaissé'}
          </button>
          <button onClick={() => setConfirming(false)} disabled={loading} className="text-xs text-gray-500 underline">
            Annuler
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
