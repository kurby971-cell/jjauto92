import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCustomerByUser } from '@/lib/mon-compte/utils'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mes réservations — JJ AUTO 92' }

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysBetween(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  active: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
  no_show: 'Non présenté',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
  no_show: 'bg-orange-100 text-orange-700 border-orange-200',
}

export default async function MesReservationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion?next=/mon-compte/reservations')

  const customer = await getCustomerByUser(user.id, user.email ?? '')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any
  let reservations: any[] = []

  if (customer) {
    const { data } = await db
      .from('reservations')
      .select('id,reservation_number,start_date,end_date,total_amount,deposit_amount,status,vehicles(id,brand,model,year,category,photos)')
      .eq('customer_id', customer.id)
      .order('start_date', { ascending: false })
      .limit(100)
    reservations = data ?? []
  }

  const active = reservations.filter((r: any) => ['active', 'confirmed', 'pending'].includes(r.status))
  const past = reservations.filter((r: any) => ['completed', 'cancelled', 'no_show'].includes(r.status))

  function ReservationCard({ r }: { r: any }) {
    const days = daysBetween(r.start_date, r.end_date)
    const photo = r.vehicles?.photos?.[0]

    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
        <div className="flex flex-col sm:flex-row">
          {/* Photo */}
          <div className="sm:w-48 h-32 sm:h-auto bg-gray-100 shrink-0 overflow-hidden">
            {photo ? (
              <img src={photo} alt={`${r.vehicles.brand} ${r.vehicles.model}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-5 flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLOR[r.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
                <h3 className="text-base font-extrabold text-[#0D1B2A] mt-2">
                  {r.vehicles?.brand} {r.vehicles?.model} {r.vehicles?.year}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Réf. {r.reservation_number}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[#0D1B2A]">{r.total_amount.toLocaleString('fr-FR')}€</p>
                <p className="text-xs text-gray-500">{days} jour{days > 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-[#C9A84C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{fmt(r.start_date)}</span>
                <span className="text-gray-300">→</span>
                <span className="font-medium">{fmt(r.end_date)}</span>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/mon-compte/reservations/${r.id}`}
                  className="text-xs font-bold px-4 py-2 bg-[#0D1B2A] text-white rounded-xl hover:bg-[#1a2d45] transition-colors"
                >
                  Voir détail
                </Link>
                {['confirmed', 'completed', 'active'].includes(r.status) && (
                  <Link
                    href={`/mon-compte/reservations/${r.id}/contrat`}
                    className="text-xs font-bold px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Récapitulatif
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-extrabold text-[#0D1B2A]">Mes réservations</h1>
        <p className="text-gray-500 text-sm mt-1">
          {reservations.length} réservation{reservations.length > 1 ? 's' : ''} au total
        </p>
      </div>

      {reservations.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-16 text-center">
          <svg className="w-14 h-14 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-bold text-[#0D1B2A] mb-1">Aucune réservation</p>
          <p className="text-gray-500 text-sm mb-6">Réservez votre premier véhicule dès maintenant.</p>
          <Link href="/vehicules" className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0D1B2A] font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-[#B8963E] transition-colors">
            Voir la flotte
          </Link>
        </div>
      )}

      {active.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">En cours &amp; à venir</h2>
          {active.map((r: any) => <ReservationCard key={r.id} r={r} />)}
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Historique</h2>
          {past.map((r: any) => <ReservationCard key={r.id} r={r} />)}
        </section>
      )}
    </div>
  )
}
