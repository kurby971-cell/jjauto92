import { createAdminClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
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
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0D1B2A]">Gestion de la flotte</h1>
        <p className="text-gray-500 text-sm mt-1">Statuts en temps réel · Calendrier d'occupation sur 14 jours.</p>
      </div>
      <FleetGrid vehicles={vehiclesWithUpcoming} />
    </div>
  )
}
