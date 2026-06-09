import { createAdminClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import StatusBadge from '@/components/admin/StatusBadge'

export const metadata: Metadata = { title: 'Dashboard — Admin JJ AUTO 92' }

const fmtMoney = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' €'
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-3xl font-extrabold leading-none ${accent ? 'text-amber-600' : 'text-[#0D1B2A]'}`}>{value}</p>
      <p className="text-gray-500 text-xs mt-1.5">{sub}</p>
    </div>
  )
}

export default async function AdminDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any
  const today = new Date().toISOString().split('T')[0]
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [
    { data: paymentsMonth },
    { count: pending },
    { count: active },
    { count: startToday },
    { count: returnToday },
    { count: totalVehicles },
    { count: inRental },
    { count: totalClients },
    { data: recent },
  ] = await Promise.all([
    db.from('payments').select('amount').eq('status', 'succeeded').gte('created_at', firstOfMonth),
    db.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('reservations').select('*', { count: 'exact', head: true }).eq('start_date', today),
    db.from('reservations').select('*', { count: 'exact', head: true }).eq('end_date', today).eq('status', 'active'),
    db.from('vehicles').select('*', { count: 'exact', head: true }).eq('is_active', true),
    db.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'en_location'),
    db.from('customers').select('*', { count: 'exact', head: true }),
    db.from('reservations')
      .select('id,reservation_number,status,start_date,end_date,total_amount,total_days,vehicles(brand,model),customers(first_name,last_name)')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const caMonth = (paymentsMonth ?? []).reduce((s: number, p: { amount: number }) => s + Number(p.amount), 0)
  const tauxOcc = (totalVehicles ?? 0) > 0 ? Math.round(((inRental ?? 0) / (totalVehicles ?? 1)) * 100) : 0

  type RecentRow = {
    id: string; reservation_number: string; status: string
    start_date: string; end_date: string; total_days: number; total_amount: number
    vehicles: { brand: string; model: string } | null
    customers: { first_name: string; last_name: string } | null
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#0D1B2A]">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="CA du mois" value={fmtMoney(caMonth)} sub="Paiements confirmés ce mois" />
        <Kpi label="En attente" value={String(pending ?? 0)} sub="Réservations à confirmer" accent={(pending ?? 0) > 0} />
        <Kpi label="Taux d'occupation" value={`${tauxOcc} %`} sub={`${inRental ?? 0} / ${totalVehicles ?? 0} en location`} />
        <Kpi label="Clients" value={String(totalClients ?? 0)} sub="Total base de données" />
      </div>

      {/* Today cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { count: startToday ?? 0, label: 'Départs aujourd\'hui', color: 'bg-[#C9A84C]/10 border-[#C9A84C]/30 text-[#A07830]' },
          { count: returnToday ?? 0, label: 'Retours aujourd\'hui', color: 'bg-blue-50 border-blue-200 text-blue-600' },
          { count: active ?? 0, label: 'Locations actives', color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
        ].map(({ count, label, color }) => (
          <div key={label} className={`rounded-2xl border p-4 flex items-center gap-4 ${color}`}>
            <p className="text-3xl font-extrabold text-[#0D1B2A]">{count}</p>
            <p className="text-sm font-semibold">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent reservations */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#0D1B2A]">Réservations récentes</h2>
          <Link href="/admin/reservations" className="text-xs text-[#C9A84C] font-semibold hover:underline">
            Voir tout →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                {['Réf', 'Client', 'Véhicule', 'Dates', 'Montant', 'Statut'].map((h) => (
                  <th key={h} className={`px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider ${h === 'Montant' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(!recent || recent.length === 0) && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">Aucune réservation</td></tr>
              )}
              {(recent ?? []).map((r: RecentRow) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs font-bold text-[#0D1B2A]">{r.reservation_number}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-700 text-sm">
                    {r.customers ? `${r.customers.first_name} ${r.customers.last_name}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-700 text-sm">
                    {r.vehicles ? `${r.vehicles.brand} ${r.vehicles.model}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {fmtDate(r.start_date)} → {fmtDate(r.end_date)}
                    <span className="text-gray-400 ml-1">· {r.total_days}j</span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-gray-800">{fmtMoney(r.total_amount)}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} type="reservation" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
