'use client'

import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import StatusBadge from './StatusBadge'

export interface ClientRow {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  created_at: string
  is_verified: boolean
  is_blacklisted: boolean
  total_reservations: number
  total_spent: number
  admin_notes: string | null
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })

const fmtMoney = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' €'

export default function ClientsTable({ clients }: { clients: ClientRow[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified' | 'blacklisted'>('all')
  const [loading, setLoading] = useState<string | null>(null)
  const notesRef = useRef<HTMLDialogElement>(null)
  const [notesClient, setNotesClient] = useState<ClientRow | null>(null)
  const [notesInput, setNotesInput] = useState('')

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (filter === 'verified' && !c.is_verified) return false
      if (filter === 'unverified' && c.is_verified) return false
      if (filter === 'blacklisted' && !c.is_blacklisted) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !`${c.first_name} ${c.last_name}`.toLowerCase().includes(q) &&
          !c.email.toLowerCase().includes(q) &&
          !c.phone.includes(q)
        ) return false
      }
      return true
    })
  }, [clients, filter, search])

  async function toggleVerify(c: ClientRow) {
    setLoading(c.id + 'verify')
    try {
      await fetch(`/api/admin/customers/${c.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_verified: !c.is_verified }),
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  async function toggleBlacklist(c: ClientRow) {
    setLoading(c.id + 'blacklist')
    try {
      await fetch(`/api/admin/customers/${c.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_blacklisted: !c.is_blacklisted }),
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  async function saveNotes() {
    if (!notesClient) return
    await fetch(`/api/admin/customers/${notesClient.id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes: notesInput }),
    })
    notesRef.current?.close()
    router.refresh()
  }

  const customerStatus = (c: ClientRow) => {
    if (c.is_blacklisted) return 'blacklisted'
    if (c.is_verified) return 'verified'
    return 'unverified'
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'verified', 'unverified', 'blacklisted'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filter === f ? 'bg-[#0D1B2A] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {{ all: 'Tous', verified: 'Vérifiés', unverified: 'Non vérifiés', blacklisted: 'Blacklistés' }[f]}
            </button>
          ))}
        </div>
      </div>

      <p className="text-gray-500 text-xs mb-3">{filtered.length} client{filtered.length > 1 ? 's' : ''}</p>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Réservations</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">CA Total</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Depuis</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Aucun client trouvé</td></tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${c.is_blacklisted ? 'bg-red-50/50' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{c.first_name} {c.last_name}</p>
                    {c.admin_notes && (
                      <p className="text-gray-400 text-xs truncate max-w-[150px]" title={c.admin_notes}>{c.admin_notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-600 text-xs">{c.email}</p>
                    <a href={`tel:${c.phone}`} className="text-gray-500 text-xs hover:text-[#0D1B2A]">{c.phone}</a>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-gray-800">{c.total_reservations}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-gray-800">{fmtMoney(c.total_spent)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={customerStatus(c)} type="customer" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500 text-xs">{fmtDate(c.created_at)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!c.is_blacklisted && (
                        <button
                          onClick={() => toggleVerify(c)}
                          disabled={loading === c.id + 'verify'}
                          title={c.is_verified ? 'Retirer la vérification' : 'Marquer comme vérifié'}
                          className={`px-2 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            c.is_verified
                              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          }`}
                        >
                          {c.is_verified ? 'Révoquer' : 'Vérifier'}
                        </button>
                      )}
                      <button
                        onClick={() => toggleBlacklist(c)}
                        disabled={loading === c.id + 'blacklist'}
                        className={`px-2 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          c.is_blacklisted
                            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        {c.is_blacklisted ? 'Débloquer' : 'Blacklist'}
                      </button>
                      <button
                        onClick={() => { setNotesClient(c); setNotesInput(c.admin_notes ?? ''); notesRef.current?.showModal() }}
                        className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                      >
                        Notes
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes modal */}
      <dialog
        ref={notesRef}
        className="rounded-2xl shadow-2xl p-0 w-full max-w-sm backdrop:bg-black/50 border-0"
        onClick={(e) => e.target === notesRef.current && notesRef.current?.close()}
      >
        <div className="p-6">
          <h3 className="font-extrabold text-[#0D1B2A] text-lg mb-1">
            Notes — {notesClient?.first_name} {notesClient?.last_name}
          </h3>
          <p className="text-gray-500 text-sm mb-4">Notes internes, visibles uniquement par l'équipe admin.</p>
          <textarea
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            rows={5}
            placeholder="Historique, incidents, préférences…"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 resize-none"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => notesRef.current?.close()}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold"
            >
              Annuler
            </button>
            <button
              onClick={saveNotes}
              className="flex-1 py-2.5 bg-[#0D1B2A] text-white rounded-xl text-sm font-extrabold"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
