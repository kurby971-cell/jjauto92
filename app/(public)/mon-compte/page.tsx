import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getCustomerByUser } from '@/lib/mon-compte/utils'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mon compte — JJ AUTO 92' }

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
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
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
  no_show: 'bg-orange-100 text-orange-700',
}

export default async function MonComptePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion?next=/mon-compte')

  const customer = await getCustomerByUser(user.id, user.email ?? '')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  let recentReservations: any[] = []
  let activeReservation: any = null
  let nextReservation: any = null

  if (customer) {
    const { data } = await db
      .from('reservations')
      .select('id,reservation_number,start_date,end_date,total_amount,status,vehicles(brand,model,year,photos)')
      .eq('customer_id', customer.id)
      .order('start_date', { ascending: false })
      .limit(10)

    recentReservations = data ?? []
    activeReservation = recentReservations.find((r: any) => r.status === 'active')
    const today = new Date().toISOString().split('T')[0]
    nextReservation = recentReservations.find(
      (r: any) => r.status === 'confirmed' && r.start_date >= today
    )
  }

  return (
    <div className="space-y-6">

      {/* Active reservation highlight */}
      {activeReservation && (
        <div className="bg-[#0D1B2A] rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="bg-emerald-500 text-white text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                En cours
              </span>
              <h2 className="text-xl font-extrabold mt-3">
                {activeReservation.vehicles?.brand} {activeReservation.vehicles?.model}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Du {fmt(activeReservation.start_date)} au {fmt(activeReservation.end_date)}
              </p>
              <p className="text-[#C9A84C] font-bold mt-2">Réf. {activeReservation.reservation_number}</p>
            </div>
            <Link
              href={`/mon-compte/reservations/${activeReservation.id}`}
              className="shrink-0 bg-[#C9A84C] hover:bg-[#B8963E] text-[#0D1B2A] font-extrabold text-xs px-4 py-2.5 rounded-xl uppercase tracking-widest transition-colors"
            >
              Voir détail
            </Link>
          </div>
        </div>
      )}

      {/* Next reservation */}
      {!activeReservation && nextReservation && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Prochaine réservation</p>
              <p className="font-bold text-[#0D1B2A]">
                {nextReservation.vehicles?.brand} {nextReservation.vehicles?.model} · {fmt(nextReservation.start_date)}
              </p>
            </div>
          </div>
          <Link
            href={`/mon-compte/reservations/${nextReservation.id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-semibold whitespace-nowrap"
          >
            Voir →
          </Link>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Réservations</p>
          <p className="text-3xl font-black text-[#0D1B2A]">{customer?.total_reservations ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total dépensé</p>
          <p className="text-3xl font-black text-[#0D1B2A]">
            {(customer?.total_spent ?? 0).toLocaleString('fr-FR')}€
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 col-span-2 lg:col-span-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Statut compte</p>
          <div className="flex items-center gap-2 mt-1">
            {customer?.is_verified ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-[#0D1B2A] text-sm">Vérifié</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="font-bold text-[#0D1B2A] text-sm">En attente de vérification</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent reservations */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-extrabold text-[#0D1B2A]">Réservations récentes</h2>
          <Link href="/mon-compte/reservations" className="text-xs text-[#C9A84C] font-semibold hover:underline">
            Voir tout →
          </Link>
        </div>

        {recentReservations.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-sm font-medium">Aucune réservation pour le moment</p>
            <Link href="/vehicules" className="mt-4 inline-flex items-center gap-2 bg-[#C9A84C] text-[#0D1B2A] font-extrabold text-xs px-5 py-2.5 rounded-xl uppercase tracking-widest hover:bg-[#B8963E] transition-colors">
              Réserver un véhicule
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentReservations.slice(0, 5).map((r: any) => (
              <Link
                key={r.id}
                href={`/mon-compte/reservations/${r.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0D1B2A]">
                      {r.vehicles?.brand} {r.vehicles?.model} {r.vehicles?.year}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {fmt(r.start_date)} → {fmt(r.end_date)} · {r.total_amount.toLocaleString('fr-FR')}€
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-[#C9A84C] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/vehicules"
          className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#C9A84C] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center shrink-0 group-hover:bg-[#C9A84C]/20 transition-colors">
            <svg className="w-5 h-5 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-[#0D1B2A] text-sm">Nouvelle réservation</p>
            <p className="text-xs text-gray-500 mt-0.5">Explorer notre flotte</p>
          </div>
        </Link>
        <Link
          href="/contact"
          className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#C9A84C] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0D1B2A]/10 flex items-center justify-center shrink-0 group-hover:bg-[#0D1B2A]/20 transition-colors">
            <svg className="w-5 h-5 text-[#0D1B2A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-[#0D1B2A] text-sm">Nous contacter</p>
            <p className="text-xs text-gray-500 mt-0.5">Question ou problème ?</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
