'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBadge from './StatusBadge'

export interface VehicleRow {
  id: string
  brand: string
  model: string
  year: number
  license_plate: string
  status: string
  category: string
  current_mileage: number
  is_active: boolean
  photos: Array<{ url: string; is_primary: boolean }>
  upcoming: Array<{ start_date: string; end_date: string; reservation_number: string }>
}

const VEHICLE_STATUSES = ['disponible', 'en_location', 'en_maintenance', 'hors_service']
const STATUS_LABELS: Record<string, string> = {
  disponible: 'Disponible', en_location: 'En location',
  en_maintenance: 'Maintenance', hors_service: 'Hors service',
}

function getNext14Days() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

function isInRange(date: string, start: string, end: string) {
  return date >= start && date <= end
}

export default function FleetGrid({ vehicles }: { vehicles: VehicleRow[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [statusModal, setStatusModal] = useState<VehicleRow | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const days14 = getNext14Days()

  const filtered = filterStatus === 'all'
    ? vehicles
    : vehicles.filter(v => v.status === filterStatus)

  async function updateStatus() {
    if (!statusModal || !newStatus) return
    setLoading(statusModal.id)
    try {
      const res = await fetch(`/api/admin/vehicles/${statusModal.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Erreur')
      router.refresh()
      setStatusModal(null)
    } finally {
      setLoading(null)
    }
  }

  const primaryPhoto = (v: VehicleRow) =>
    v.photos?.find(p => p.is_primary)?.url ?? v.photos?.[0]?.url ?? null

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {['disponible', 'en_location', 'en_maintenance', 'hors_service'].map((s) => {
          const count = vehicles.filter(v => v.status === s).length
          const colors: Record<string, string> = {
            disponible: 'bg-emerald-50 border-emerald-200 text-emerald-700',
            en_location: 'bg-amber-50 border-amber-200 text-amber-700',
            en_maintenance: 'bg-orange-50 border-orange-200 text-orange-700',
            hors_service: 'bg-red-50 border-red-200 text-red-600',
          }
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              className={`p-4 rounded-xl border text-left transition-all ${colors[s]} ${filterStatus === s ? 'ring-2 ring-offset-1 ring-current' : ''}`}
            >
              <p className="text-2xl font-extrabold">{count}</p>
              <p className="text-xs font-semibold mt-0.5">{STATUS_LABELS[s]}</p>
            </button>
          )
        })}
      </div>

      {/* Fleet cards */}
      <div className="space-y-3">
        {filtered.map((v) => {
          const photo = primaryPhoto(v)
          const occupiedDays = new Set(
            v.upcoming.flatMap(u =>
              days14.filter(d => isInRange(d, u.start_date, u.end_date))
            )
          )

          return (
            <div key={v.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {/* Photo */}
                <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1M13 16l-2 1M13 16V6m0 10h5l2-1V8a1 1 0 00-.44-.82L18 6h-5v10z" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#0D1B2A] text-sm">{v.brand} {v.model} {v.year}</span>
                    <span className="font-mono text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{v.license_plate}</span>
                    <StatusBadge status={v.status} type="vehicle" />
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">{v.current_mileage.toLocaleString('fr-FR')} km</p>
                </div>

                {/* Action */}
                <button
                  onClick={() => { setStatusModal(v); setNewStatus(v.status) }}
                  disabled={loading === v.id}
                  className="shrink-0 px-3 py-1.5 border border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-semibold rounded-lg transition-colors"
                >
                  Modifier statut
                </button>
              </div>

              {/* 14-day occupation calendar */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-0.5">
                  {days14.map((day, i) => {
                    const isOccupied = occupiedDays.has(day)
                    const isToday = i === 0
                    const d = new Date(day)
                    const dayNum = d.getDate()
                    return (
                      <div key={day} className="flex-1 text-center">
                        <div className="text-[9px] text-gray-400 mb-0.5">{dayNum}</div>
                        <div
                          title={isOccupied ? 'Réservé' : 'Disponible'}
                          className={`h-3 rounded-sm ${
                            isOccupied
                              ? 'bg-[#C9A84C]'
                              : isToday
                                ? 'bg-blue-200'
                                : 'bg-gray-100'
                          }`}
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <span className="w-2 h-2 rounded-sm bg-[#C9A84C] inline-block" />
                    Réservé
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <span className="w-2 h-2 rounded-sm bg-gray-100 inline-block border border-gray-200" />
                    Disponible
                  </span>
                  {v.upcoming.length > 0 && (
                    <span className="text-[10px] text-gray-500 ml-auto">
                      {v.upcoming.length} résa à venir
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>Aucun véhicule dans cette catégorie</p>
          </div>
        )}
      </div>

      {/* Status modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-extrabold text-[#0D1B2A] text-lg mb-1">
              {statusModal.brand} {statusModal.model}
            </h3>
            <p className="text-gray-500 text-sm mb-5">Modifier le statut du véhicule</p>
            <div className="space-y-2">
              {VEHICLE_STATUSES.map((s) => (
                <label key={s} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={newStatus === s}
                    onChange={() => setNewStatus(s)}
                    className="accent-[#C9A84C]"
                  />
                  <StatusBadge status={s} type="vehicle" />
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setStatusModal(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={updateStatus}
                disabled={!!loading || newStatus === statusModal.status}
                className="flex-1 py-2.5 bg-[#0D1B2A] text-white rounded-xl text-sm font-extrabold hover:bg-[#1a2d45] disabled:opacity-50"
              >
                {loading ? '…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
