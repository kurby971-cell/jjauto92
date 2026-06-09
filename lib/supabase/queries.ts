import { createClient } from '@/lib/supabase/server'
import type { Vehicle, RentalOption } from '@/lib/types'

export type ReservedPeriod = {
  vehicle_id: string
  start_date: string
  end_date: string
}

export async function getActiveVehicles(): Promise<Vehicle[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('is_active', true)
    .eq('status', 'disponible')
    .order('daily_rate', { ascending: true })

  if (error) {
    console.error('[getActiveVehicles]', error.message)
    return []
  }
  return data ?? []
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('is_active', true)
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .single()

  if (error) return null
  return data
}

export type UnavailabilityPeriod = {
  start_date: string
  end_date: string
  reason: string
}

export async function getVehicleUnavailabilities(vehicleId: string): Promise<UnavailabilityPeriod[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('vehicle_unavailability')
    .select('start_date, end_date, reason')
    .eq('vehicle_id', vehicleId)
    .gte('end_date', today)
    .order('start_date')

  if (error) {
    console.error('[getVehicleUnavailabilities]', error.message)
    return []
  }
  return data ?? []
}

export async function getActiveRentalOptions(): Promise<RentalOption[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rental_options')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    console.error('[getActiveRentalOptions]', error.message)
    return []
  }
  return data ?? []
}

export async function getUpcomingReservationPeriods(): Promise<ReservedPeriod[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('reservations')
    .select('vehicle_id, start_date, end_date')
    .in('status', ['pending', 'confirmed', 'active'])
    .gte('end_date', today)

  if (error) {
    console.error('[getUpcomingReservationPeriods]', error.message)
    return []
  }
  return data ?? []
}
