'use client'

import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import StatusBadge from './StatusBadge'

export interface ReservationRow {
  id: string
  reservation_number: string
  status: string
  start_date: string
  end_date: string
  total_days: number
  total_amount: number
  created_at: string
  vehicles: { brand: string; model: string; license_plate: string } | null
  customers: { id: string; first_name: string; last_name: string; email: string; phone: string } | null
}

const fuelLevels = ['vide', 'quart', 'demi', 'trois_quarts', 'plein']
const fuelLabels: Record<string, string> = {
  vide: 'Vide', quart: '1/4', demi: '1/2', trois_quarts: '3/4', plein: 'Plein',
}

const STATUS_FILTERS = ['tous', 'pending', 'confirmed', 'active', 'completed', 'cancelled']
const STATUS_LABELS: Record<string, string> = {
  tous: 'Tous', pending: 'En attente', confirmed: 'Confirmées',
  active: 'En cours', completed: 'Terminées', cancelled: 'Annulées',
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })

const fmtMoney = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' €'

export default function ReservationsTable({ reservations }: { reservations: ReservationRow[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('tous')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Departure modal
  const departureRef = useRef<HTMLDialogElement>(null)
  const returnRef = useRef<HTMLDialogElement>(null)
  const [modalResId, setModalResId] = useState<string | null>(null)
  const [mileageInput, setMileageInput] = useState('')
  const [fuelInput, setFuelInput] = useState('plein')
  const [cancelReason, setCancelReason] = useState('')
  const cancelRef = useRef<HTMLDialogElement>(null)

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (statusFilter !== 'tous' && r.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const customer = r.customers
          ? `${r.customers.first_name} ${r.customers.last_name} ${r.customers.email}`.toLowerCase()
          : ''
        const vehicle = r.vehicles ? `${r.vehicles.brand} ${r.vehicles.model}`.toLowerCase() : ''
        if (
          !r.reservation_number.toLowerCase().includes(q) &&
          !customer.includes(q) &&
          !vehicle.includes(q)
        ) return false
      }
      return true
    })
  }, [reservations, statusFilter, search])

  async function doAction(id: string, action: string, extra?: Record<string, unknown>) {
    setLoading(id + action)
    setError(null)
    try {
      const res = await fetch(`/api/admin/reservations/${id}/action`, {
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

  function openDeparture(id: string) {
    setModalResId(id)
    setMileageInput('')
    setFuelInput('plein')
    departureRef.current?.showModal()
  }

  function openReturn(id: string) {
    setModalResId(id)
    setMileageInput('')
    setFuelInput('plein')
    returnRef.current?.showModal()
  }

  function openCancel(id: string) {
    setModalResId(id)
    setCancelReason('')
    cancelRef.current?.showModal()
  }

  async function confirmDeparture() {
    if (!modalResId) return
    await doAction(modalResId, 'start', {
      mileage_start: mileageInput ? Number(mileageInput) : undefined,
      fuel_level_start: fuelInput,
    })
    departureRef.current?.close()
  }

  async function confirmReturn() {
    if (!modalResId) return
    await doAction(modalResId, 'complete', {
      mileage_end: mileageInput ? Number(mileageInput) : undefined,
      fuel_level_end: fuelInput,
    })
    returnRef.current?.close()
  }

  async function confirmCancel() {
    if (!modalResId) return
    await doAction(modalResId, 'cancel', { cancellation_reason: cancelReason })
    cancelRef.current?.close()
  }

  const isLoading = (id: string, action: string) => loading === id + action

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher client, véhicule, n° réservation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-[#0D1B2A] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {STATUS_LABELS[s]}
              {s === 'pending' && reservations.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[9px] font-black px-1 py-0.5 rounded-full">
                  {reservations.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <p className="text-gray-500 text-xs mb-3">{filtered.length} réservation{filtered.length > 1 ? 's' : ''}</p>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Réf</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Véhicule</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    Aucune réservation trouvée
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-[#0D1B2A] font-bold">{r.reservation_number}</span>
                    <p className="text-gray-400 text-[10px] mt-0.5">{new Date(r.created_at).toLocaleDateString('fr-FR')}</p>
                  </td>
                  <td className="px-4 py-3">
                    {r.customers ? (
                      <>
                        <p className="font-medium text-gray-800 text-sm">{r.customers.first_name} {r.customers.last_name}</p>
                        <p className="text-gray-400 text-xs">{r.customers.phone}</p>
                      </>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {r.vehicles ? (
                      <>
                        <p className="font-medium text-gray-800 text-sm">{r.vehicles.brand} {r.vehicles.model}</p>
                        <p className="text-gray-400 text-xs font-mono">{r.vehicles.license_plate}</p>
                      </>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-800 text-xs font-medium">{fmtDate(r.start_date)} → {fmtDate(r.end_date)}</p>
                    <p className="text-gray-400 text-[10px]">{r.total_days} jour{r.total_days > 1 ? 's' : ''}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-gray-800">{fmtMoney(r.total_amount)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} type="reservation" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status === 'pending' && (
                        <>
                          <button
                            onClick={() => doAction(r.id, 'confirm')}
                            disabled={!!isLoading(r.id, 'confirm')}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isLoading(r.id, 'confirm') ? '…' : 'Confirmer'}
                          </button>
                          <button
                            onClick={() => openCancel(r.id)}
                            className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Annuler
                          </button>
                        </>
                      )}
                      {r.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => openDeparture(r.id)}
                            className="px-2.5 py-1.5 bg-[#C9A84C] hover:bg-[#B8963E] text-[#0D1B2A] text-xs font-semibold rounded-lg transition-colors"
                          >
                            Départ ▶
                          </button>
                          <button
                            onClick={() => openCancel(r.id)}
                            className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Annuler
                          </button>
                        </>
                      )}
                      {r.status === 'active' && (
                        <button
                          onClick={() => openReturn(r.id)}
                          className="px-2.5 py-1.5 bg-[#0D1B2A] hover:bg-[#1a2d45] text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          Retour ↩
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Departure modal */}
      <dialog
        ref={departureRef}
        className="rounded-2xl shadow-2xl p-0 w-full max-w-sm backdrop:bg-black/50 border-0"
        onClick={(e) => e.target === departureRef.current && departureRef.current?.close()}
      >
        <div className="p-6">
          <h3 className="font-extrabold text-[#0D1B2A] text-lg mb-1">Départ du véhicule</h3>
          <p className="text-gray-500 text-sm mb-5">Enregistrez le kilométrage et le niveau de carburant au départ.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Kilométrage départ</label>
              <input
                type="number"
                value={mileageInput}
                onChange={(e) => setMileageInput(e.target.value)}
                placeholder="Ex : 45 230"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Niveau carburant</label>
              <select
                value={fuelInput}
                onChange={(e) => setFuelInput(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]"
              >
                {fuelLevels.map((f) => (
                  <option key={f} value={f}>{fuelLabels[f]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => departureRef.current?.close()}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={confirmDeparture}
              className="flex-1 py-2.5 bg-[#C9A84C] text-[#0D1B2A] rounded-xl text-sm font-extrabold hover:bg-[#B8963E] transition-colors"
            >
              Confirmer départ
            </button>
          </div>
        </div>
      </dialog>

      {/* Return modal */}
      <dialog
        ref={returnRef}
        className="rounded-2xl shadow-2xl p-0 w-full max-w-sm backdrop:bg-black/50 border-0"
        onClick={(e) => e.target === returnRef.current && returnRef.current?.close()}
      >
        <div className="p-6">
          <h3 className="font-extrabold text-[#0D1B2A] text-lg mb-1">Retour du véhicule</h3>
          <p className="text-gray-500 text-sm mb-5">Enregistrez le kilométrage et le niveau de carburant au retour.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Kilométrage retour</label>
              <input
                type="number"
                value={mileageInput}
                onChange={(e) => setMileageInput(e.target.value)}
                placeholder="Ex : 45 890"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Niveau carburant</label>
              <select
                value={fuelInput}
                onChange={(e) => setFuelInput(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]"
              >
                {fuelLevels.map((f) => (
                  <option key={f} value={f}>{fuelLabels[f]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => returnRef.current?.close()}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={confirmReturn}
              className="flex-1 py-2.5 bg-[#0D1B2A] text-white rounded-xl text-sm font-extrabold hover:bg-[#1a2d45] transition-colors"
            >
              Confirmer retour
            </button>
          </div>
        </div>
      </dialog>

      {/* Cancel modal */}
      <dialog
        ref={cancelRef}
        className="rounded-2xl shadow-2xl p-0 w-full max-w-sm backdrop:bg-black/50 border-0"
        onClick={(e) => e.target === cancelRef.current && cancelRef.current?.close()}
      >
        <div className="p-6">
          <h3 className="font-extrabold text-[#0D1B2A] text-lg mb-1">Annuler la réservation</h3>
          <p className="text-gray-500 text-sm mb-5">Cette action est irréversible.</p>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Motif d'annulation</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Ex : Client désiste, véhicule indisponible…"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => cancelRef.current?.close()}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Retour
            </button>
            <button
              onClick={confirmCancel}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-extrabold hover:bg-red-700 transition-colors"
            >
              Confirmer annulation
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
