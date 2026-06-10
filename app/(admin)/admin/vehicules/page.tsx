import { createAdminClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import FleetGrid from '@/components/admin/FleetGrid'

export const metadata: Metadata = { title: 'Flotte — Admin JJ AUTO 92' }

export default async function AdminVehiculesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const today = new Date().toISOString().split('T')[0]
  const in14 = new Date(Date.now() + 14 * 86_400_000).toISOString().split('T')[0]

  const { data: vehicles } = await db
    .from('vehicles')
    .select('id,brand,model,year,license_plate,status,category,current_mileage,is_active,photos')
    .order('brand', { ascending: true })

  const { data: upcoming } = await db
    .from('reservations')
    .select('vehicle_id,start_date,end_date,reservation_number')
    .in('status', ['confirmed', 'active'])
    .lte('start_date', in14)
    .gte('end_date', today)

  // Group upcoming reservations by vehicle id
  type UpcomingRes = { vehicle_id: string; start_date: string; end_date: string; reservation_number: string }
  const upcomingByVehicle: Record<string, UpcomingRes[]> = {}
  for (const r of upcoming ?? []) {
    if (!upcomingByVehicle[r.vehicle_id]) upcomingByVehicle[r.vehicle_id] = []
    upcomingByVehicle[r.vehicle_id].push(r)
  }

  const vehiclesWithUpcoming = (vehicles ?? []).map((v: { id: string; [key: string]: unknown }) => ({
    ...v,
    upcoming: upcomingByVehicle[v.id] ?? [],
  }))

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1B2A]">Gestion de la flotte</h1>
          <p className="text-gray-500 text-sm mt-1">Statuts en temps réel · Calendrier d'occupation sur 14 jours.</p>
        </div>
        <Link
          href="/admin/vehicules/new"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] text-[#0D1B2A] text-sm font-extrabold rounded-xl hover:bg-[#b8953e] transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau véhicule
        </Link>
      </div>
      <FleetGrid vehicles={vehiclesWithUpcoming} />
    </div>
  )
}
