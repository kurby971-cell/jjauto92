import { createAdminClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import DepositsTable from '@/components/admin/DepositsTable'

export const metadata: Metadata = { title: 'Cautions — Admin JJ AUTO 92' }

export default async function AdminCautionsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const { data } = await db
    .from('deposits')
    .select('id,amount,captured_amount,status,authorized_at,authorization_expiry,captured_at,released_at,reservations(reservation_number,start_date,end_date),customers(first_name,last_name,email)')
    .order('authorized_at', { ascending: false })
    .limit(200)

  const activeStatuses = ['authorized', 'partially_captured']
  const active = (data ?? []).filter((d: { status: string }) => activeStatuses.includes(d.status))
  const archived = (data ?? []).filter((d: { status: string }) => !activeStatuses.includes(d.status))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0D1B2A]">Gestion des cautions</h1>
        <p className="text-gray-500 text-sm mt-1">Préautorisations actives — libérez ou capturez selon l'état du véhicule au retour.</p>
      </div>

      {/* Active deposits */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          Cautions actives ({active.length})
        </h2>
        <DepositsTable deposits={active} />
      </div>

      {/* Archived */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
          Historique ({archived.length})
        </h2>
        <DepositsTable deposits={archived} />
      </div>
    </div>
  )
}
