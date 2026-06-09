'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface PendingDoc {
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  reservationNumber: string
  reservationId: string
  startDate: string
  totalAmount: number
  createdAt: string
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })

export default function DocumentsQueue({ items }: { items: PendingDoc[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function verify(customerId: string) {
    setLoading(customerId)
    setError(null)
    try {
      const res = await fetch(`/api/admin/customers/${customerId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_verified: true }),
      })
      if (!res.ok) throw new Error('Erreur lors de la vérification')
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-800 font-bold mb-1">File de validation vide</p>
          <p className="text-gray-500 text-sm">Tous les conducteurs actifs ont été vérifiés.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.customerId} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-bold text-[#0D1B2A]">{item.customerName}</span>
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wide">
                      Documents à vérifier
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Email</p>
                      <p className="text-gray-700 truncate">{item.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Téléphone</p>
                      <p className="text-gray-700">{item.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Réservation</p>
                      <p className="text-gray-700 font-mono font-bold">{item.reservationNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Départ</p>
                      <p className="text-gray-700">{fmtDate(item.startDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => verify(item.customerId)}
                    disabled={loading === item.customerId}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {loading === item.customerId ? '…' : 'Valider documents'}
                  </button>
                  <a
                    href={`tel:${item.customerPhone.replace(/\s/g, '')}`}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 hover:text-[#0D1B2A] hover:border-gray-300 text-xs font-semibold rounded-xl transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Appeler
                  </a>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 bg-amber-50 rounded-xl p-3">
                <p className="text-amber-700 text-xs font-medium">
                  <strong>Note :</strong> Les documents (permis recto/verso, pièce d'identité) sont stockés dans Supabase Storage.
                  Accédez au tableau de bord Supabase pour les visualiser directement avant de valider ce conducteur.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
