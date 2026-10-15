import { createAdminClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import StatusBadge from '@/components/admin/StatusBadge'

export const metadata: Metadata = { title: 'Dashboard — Admin JJ AUTO 92' }

const fmtMoney = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' €'
const TZ = 'Europe/Paris'
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: TZ })
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000)
const parisToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())

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
  const today = parisToday()
  const firstOfMonth = `${today.slice(0, 8)}01T00:00:00+02:00`
  const in7Days = daysFromNow(7).toISOString().split('T')[0]
  const in2Days = daysFromNow(2).toISOString()
  const in30Days = daysFromNow(30).toISOString().split('T')[0]
  const weekAgo = daysFromNow(-7).toISOString()

  const [
    { data: paymentsMonth },
    { count: active },
    { count: startToday },
    { count: returnToday },
    { count: totalVehicles },
    { count: totalClients },
    { data: recent },
    { count: lateReturns },
    { count: depositsActive },
    { count: depositsExpiring },
    { count: failedPayments },
    { data: upcoming },
    { data: toCollectRows },
    { data: horizonRows },
    { data: unverifiedRows },
  ] = await Promise.all([
    db.from('payments').select('amount').eq('status', 'succeeded').not('stripe_payment_intent_id', 'is', null).gte('created_at', firstOfMonth),
    db.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('reservations').select('*', { count: 'exact', head: true }).eq('start_date', today).in('status', ['confirmed', 'active']),
    db.from('reservations').select('*', { count: 'exact', head: true }).eq('end_date', today).eq('status', 'active'),
    db.from('vehicles').select('*', { count: 'exact', head: true }).eq('is_active', true),
    db.from('customers').select('*', { count: 'exact', head: true }),
    db.from('reservations')
      .select('id,reservation_number,status,start_date,end_date,total_amount,total_days,vehicles(brand,model),customers(first_name,last_name)')
      .order('created_at', { ascending: false })
      .limit(8),
    db.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'active').lt('end_date', today),
    db.from('deposits').select('*', { count: 'exact', head: true }).in('status', ['authorized', 'partially_captured']),
    db.from('deposits').select('*', { count: 'exact', head: true }).eq('status', 'authorized').lte('authorization_expiry', in2Days),
    db.from('payments').select('id, reservations!inner(status)', { count: 'exact', head: true }).eq('status', 'failed').neq('reservations.status', 'cancelled').gte('created_at', weekAgo),
    db.from('reservations')
      .select('id,reservation_number,start_date,pickup_time,total_amount,payments(amount,status),vehicles(brand,model),customers(first_name,last_name,is_verified)')
      .eq('status', 'confirmed')
      .gte('start_date', today)
      .lte('start_date', in7Days)
      .order('start_date', { ascending: true })
      .limit(6),
    db.from('reservations')
      .select('total_amount,payments(amount,status)')
      .in('status', ['confirmed', 'active']),
    db.from('reservations')
      .select('start_date,end_date')
      .in('status', ['confirmed', 'active'])
      .lt('start_date', in30Days)
      .gt('end_date', today),
    db.from('reservations')
      .select('customer_id,customers!inner(is_verified)')
      .in('status', ['confirmed', 'active'])
      .eq('customers.is_verified', false),
  ])

  const caMonth = (paymentsMonth ?? []).reduce((s: number, p: { amount: number }) => s + Number(p.amount), 0)
  type PayLite = { amount: number; status: string }
  const balanceOf = (total: number, payments: unknown) =>
    Math.max(
      0,
      Math.round(
        (Number(total) -
          ([] as PayLite[]).concat((payments as PayLite[]) ?? [])
            .filter((p) => p.status === 'succeeded')
            .reduce((sum, p) => sum + Number(p.amount), 0)) * 100,
      ) / 100,
    )
  const cashToCollect = (toCollectRows ?? []).reduce(
    (sum: number, r: { total_amount: number; payments: unknown }) => sum + balanceOf(r.total_amount, r.payments),
    0,
  )

  // Occupation sur les 30 prochains jours : jours loués / (véhicules × 30)
  const DAY = 86_400_000
  const t0 = Date.parse(today)
  const t1 = t0 + 30 * DAY
  const bookedDays = (horizonRows ?? []).reduce((sum: number, r: { start_date: string; end_date: string }) => {
    const a = Math.max(Date.parse(r.start_date), t0)
    const b = Math.min(Date.parse(r.end_date), t1)
    return sum + Math.max(0, Math.round((b - a) / DAY))
  }, 0)
  const tauxOcc = (totalVehicles ?? 0) > 0 ? Math.round((bookedDays / ((totalVehicles ?? 1) * 30)) * 100) : 0
  const docsToVerify = new Set((unverifiedRows ?? []).map((r: { customer_id: string }) => r.customer_id)).size

  type RecentRow = {
    id: string; reservation_number: string; status: string
    start_date: string; end_date: string; total_days: number; total_amount: number
    vehicles: { brand: string; model: string } | null
    customers: { first_name: string; last_name: string } | null
  }

  const alerts = [
    { n: docsToVerify, label: 'conducteur(s) à vérifier avant le départ', href: '/admin/documents', tone: 'amber' },
    { n: lateReturns ?? 0, label: 'retour(s) en retard', href: '/admin/reservations', tone: 'red' },
    { n: depositsExpiring ?? 0, label: 'caution(s) expirant sous 48 h', href: '/admin/cautions', tone: 'red' },
    { n: failedPayments ?? 0, label: 'paiement(s) échoué(s) sur 7 jours', href: '/admin/reservations', tone: 'amber' },
  ].filter((a) => a.n > 0)

  type UpcomingRow = {
    id: string; reservation_number: string; start_date: string; pickup_time: string | null
    total_amount: number; payments: unknown
    vehicles: { brand: string; model: string } | null
    customers: { first_name: string; last_name: string; is_verified: boolean } | null
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#0D1B2A]">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${
                a.tone === 'red' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}
            >
              <span>{a.n} {a.label}</span>
              <span className="text-xs">Voir →</span>
            </Link>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Encaissé en ligne" value={fmtMoney(caMonth)} sub="Acomptes carte confirmés ce mois" />
        <Kpi label="Espèces à encaisser" value={fmtMoney(cashToCollect)} sub="Soldes dus à la prise du véhicule" accent={cashToCollect > 0} />
        <Kpi label="Occupation 30 jours" value={`${tauxOcc} %`} sub={`${totalVehicles ?? 0} véhicule(s) actif(s)`} />
        <Kpi label="Cautions actives" value={String(depositsActive ?? 0)} sub={`${totalClients ?? 0} clients en base`} />
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

      {/* Prochains départs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#0D1B2A]">Prochains départs (7 jours)</h2>
        </div>
        <ul className="divide-y divide-gray-50">
          {(!upcoming || upcoming.length === 0) && (
            <li className="text-center py-8 text-gray-400 text-sm">Aucun départ confirmé dans les 7 prochains jours</li>
          )}
          {(upcoming ?? []).map((r: UpcomingRow) => (
            <li key={r.id} className="px-5 py-3 flex items-center justify-between text-sm">
              <span className="text-gray-700">
                <span className="font-mono text-xs font-bold text-[#0D1B2A] mr-2">{r.reservation_number}</span>
                {r.customers ? `${r.customers.first_name} ${r.customers.last_name}` : '—'}
                {r.vehicles ? ` · ${r.vehicles.brand} ${r.vehicles.model}` : ''}
              </span>
              <span className="text-xs text-right">
                <span className="text-gray-500">{fmtDate(r.start_date)}{r.pickup_time ? ` à ${r.pickup_time.slice(0, 5)}` : ''}</span>
                <span className="block mt-0.5 font-semibold">
                  <span className="text-gray-700">Solde {fmtMoney(balanceOf(r.total_amount, r.payments))}</span>
                  {r.customers && !r.customers.is_verified && <span className="ml-2 text-amber-600">Docs à vérifier</span>}
                </span>
              </span>
            </li>
          ))}
        </ul>
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
