import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Vehicle, RentalOption } from '@/lib/types'

export type ReservedPeriod = {
  vehicle_id: string
  start_date: string
  end_date: string
}

export async function getActiveVehicles(): Promise<Vehicle[]> {
  try {
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
  } catch (err) {
    console.error('[getActiveVehicles] fetch error:', err instanceof Error ? err.message : err)
    return []
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  try {
    const supabase = await createClient()
    const filter = UUID_RE.test(slug)
      ? `slug.eq.${slug},id.eq.${slug}`
      : `slug.eq.${slug}`
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('is_active', true)
      .or(filter)
      .single()

    if (error) return null
    return data
  } catch (err) {
    console.error('[getVehicleBySlug] fetch error:', err instanceof Error ? err.message : err)
    return null
  }
}

export type UnavailabilityPeriod = {
  start_date: string
  end_date: string
  reason: string
}

export async function getVehicleUnavailabilities(vehicleId: string): Promise<UnavailabilityPeriod[]> {
  try {
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
  } catch (err) {
    console.error('[getVehicleUnavailabilities] fetch error:', err instanceof Error ? err.message : err)
    return []
  }
}

export async function getActiveRentalOptions(): Promise<RentalOption[]> {
  try {
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
  } catch (err) {
    console.error('[getActiveRentalOptions] fetch error:', err instanceof Error ? err.message : err)
    return []
  }
}

export async function getAllVehicleSlugs(): Promise<{ slug: string }[]> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('vehicles')
      .select('id, slug')
      .eq('is_active', true)

    if (!data) return []
    return data.map(v => ({ slug: v.slug ?? v.id }))
  } catch (err) {
    console.error('[getAllVehicleSlugs] fetch error:', err instanceof Error ? err.message : err)
    return []
  }
}

export async function getUpcomingReservationPeriods(): Promise<ReservedPeriod[]> {
  try {
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
  } catch (err) {
    console.error('[getUpcomingReservationPeriods] fetch error:', err instanceof Error ? err.message : err)
    return []
  }
}
