'use client'

import { useState } from 'react'

export default function ResendConfirmation({ reservationId }: { reservationId: string }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function submit() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}/resend-confirmation`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erreur')
      setMessage({ ok: true, text: `E-mail de confirmation renvoyé à ${json.to}` })
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message })
    }
    setLoading(false)
  }

  return (
    <div className="mt-3">
      <button
        onClick={submit}
        disabled={loading}
        className="border border-gray-300 text-gray-700 text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? 'Envoi…' : 'Renvoyer l’e-mail de confirmation'}
      </button>
      {message && <p className={`text-xs mt-2 ${message.ok ? 'text-emerald-600' : 'text-red-600'}`}>{message.text}</p>}
    </div>
  )
}
