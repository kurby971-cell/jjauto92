'use client'

import { useState } from 'react'
import QRCode from 'qrcode'

export default function DepositRequest({ reservationId, amount }: { reservationId: string; amount: number }) {
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function request() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}/deposit-request`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erreur')
      setUrl(json.url)
      setQr(await QRCode.toDataURL(json.url, { width: 220, margin: 1 }))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* copie impossible : le lien reste affiché */
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs text-gray-500 mb-2">
        Caution de {amount.toLocaleString('fr-FR')} € à pré-autoriser à la prise du véhicule.
      </p>
      {!url && (
        <button
          onClick={request}
          disabled={loading}
          className="bg-[#0D1B2A] text-white text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Génération…' : 'Demander la caution (QR code / lien)'}
        </button>
      )}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      {url && (
        <div className="space-y-2">
          {qr && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="QR code de la caution" width={220} height={220} className="rounded-lg border border-gray-200" />
          )}
          <p className="text-xs text-gray-500 break-all font-mono">{url}</p>
          <button onClick={copy} className="text-xs font-bold text-[#A07830] underline">
            {copied ? 'Lien copié' : 'Copier le lien'}
          </button>
        </div>
      )}
    </div>
  )
}
