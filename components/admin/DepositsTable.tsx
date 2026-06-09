'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import StatusBadge from './StatusBadge'

export interface DepositRow {
  id: string
  amount: number
  captured_amount: number
  status: string
  authorized_at: string | null
  authorization_expiry: string | null
  captured_at: string | null
  released_at: string | null
  reservations: {
    reservation_number: string
    start_date: string
    end_date: string
  } | null
  customers: {
    first_name: string
    last_name: string
    email: string
  } | null
}

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR') : '—'

const fmtMoney = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' €'

export default function DepositsTable({ deposits }: { deposits: DepositRow[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const captureRef = useRef<HTMLDialogElement>(null)
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRow | null>(null)
  const [captureAmount, setCaptureAmount] = useState('')
  const [captureReason, setCaptureReason] = useState('')

  async function doAction(id: string, action: string, extra?: Record<string, unknown>) {
    setLoading(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/deposits/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erreur')
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(null)
    }
  }

  async function confirmCapture() {
    if (!selectedDeposit) return
    await doAction(selectedDeposit.id, 'capture', {
      capture_amount: captureAmount ? Number(captureAmount) : selectedDeposit.amount,
      capture_reason: captureReason,
    })
    captureRef.current?.close()
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Réservation</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Expiration</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deposits.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    Aucune caution active
                  </td>
                </tr>
              )}
              {deposits.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {d.reservations ? (
                      <>
                        <span className="font-mono text-xs font-bold text-[#0D1B2A]">
                          {d.reservations.reservation_number}
                        </span>
                        <p className="text-gray-400 text-[10px] mt-0.5">
                          {fmtDate(d.reservations.start_date)} → {fmtDate(d.reservations.end_date)}
                        </p>
                      </>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {d.customers ? (
                      <>
                        <p className="font-medium text-gray-800">{d.customers.first_name} {d.customers.last_name}</p>
                        <p className="text-gray-400 text-xs">{d.customers.email}</p>
                      </>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-gray-800">{fmtMoney(d.amount)}</span>
                    {d.captured_amount > 0 && (
                      <p className="text-orange-600 text-[10px]">Capturé : {fmtMoney(d.captured_amount)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.status} type="deposit" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600 text-xs">{fmtDate(d.authorization_expiry)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {d.status === 'authorized' && (
                        <>
                          <button
                            onClick={() => doAction(d.id, 'release')}
                            disabled={loading === d.id}
                            className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                          >
                            Libérer
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDeposit(d)
                              setCaptureAmount(String(d.amount))
                              setCaptureReason('')
                              captureRef.current?.showModal()
                            }}
                            className="px-2.5 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Capturer
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Capture modal */}
      <dialog
        ref={captureRef}
        className="rounded-2xl shadow-2xl p-0 w-full max-w-sm backdrop:bg-black/50 border-0"
        onClick={(e) => e.target === captureRef.current && captureRef.current?.close()}
      >
        <div className="p-6">
          <h3 className="font-extrabold text-[#0D1B2A] text-lg mb-1">Capturer la caution</h3>
          <p className="text-gray-500 text-sm mb-5">
            Caution max : <strong>{selectedDeposit ? fmtMoney(selectedDeposit.amount) : '—'}</strong>
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Montant à capturer (€)</label>
              <input
                type="number"
                value={captureAmount}
                onChange={(e) => setCaptureAmount(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Motif</label>
              <textarea
                value={captureReason}
                onChange={(e) => setCaptureReason(e.target.value)}
                rows={3}
                placeholder="Ex : Dommages constatés à l'état des lieux de retour"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => captureRef.current?.close()}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold"
            >
              Annuler
            </button>
            <button
              onClick={confirmCapture}
              className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-extrabold hover:bg-orange-700"
            >
              Confirmer capture
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
