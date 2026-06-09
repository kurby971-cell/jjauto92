import { createAdminClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import ReservationsTable from '@/components/admin/ReservationsTable'

export const metadata: Metadata = { title: 'Réservations — Admin JJ AUTO 92' }

export default async function AdminReservationsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const { data } = await db
    .from('reservations')
    .select('id,reservation_number,status,start_date,end_date,total_days,total_amount,created_at,vehicles(brand,model,license_plate),customers(id,first_name,last_name,email,phone)')
    .order('created_at', { ascending: false })
    .limit(500)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0D1B2A]">Réservations</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez toutes les réservations — confirmez, annulez, enregistrez départs et retours.</p>
      </div>
      <ReservationsTable reservations={data ?? []} />
    </div>
  )
}
