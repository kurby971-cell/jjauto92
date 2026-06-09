import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-guard'
import { NextResponse } from 'next/server'

type Action = 'confirm' | 'cancel' | 'start' | 'complete'

interface ActionBody {
  action: Action
  mileage_start?: number
  fuel_level_start?: string
  mileage_end?: number
  fuel_level_end?: string
  fuel_charge?: number
  damage_charge?: number
  cancellation_reason?: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error as Response

  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  let body: ActionBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const { action } = body
  const now = new Date().toISOString()

  // Fetch current reservation
  const { data: res, error: fetchErr } = await db
    .from('reservations')
    .select('id, status, vehicle_id')
    .eq('id', id)
    .single()

  if (fetchErr || !res) {
    return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
  }

  if (action === 'confirm') {
    if (res.status !== 'pending') {
      return NextResponse.json({ error: 'Seules les réservations pending peuvent être confirmées' }, { status: 409 })
    }
    const { error: upErr } = await db
      .from('reservations')
      .update({ status: 'confirmed', confirmed_at: now })
      .eq('id', id)
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'cancel') {
    if (['completed', 'cancelled'].includes(res.status)) {
      return NextResponse.json({ error: 'Cette réservation ne peut plus être annulée' }, { status: 409 })
    }
    const { error: upErr } = await db
      .from('reservations')
      .update({
        status: 'cancelled',
        cancelled_at: now,
        cancellation_reason: body.cancellation_reason ?? null,
      })
      .eq('id', id)
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

    // Free vehicle if it was in rental
    if (res.status === 'active') {
      await db.from('vehicles').update({ status: 'disponible' }).eq('id', res.vehicle_id)
    }
    return NextResponse.json({ success: true })
  }

  if (action === 'start') {
    if (res.status !== 'confirmed') {
      return NextResponse.json({ error: 'Seules les réservations confirmées peuvent démarrer' }, { status: 409 })
    }
    const update: Record<string, unknown> = { status: 'active' }
    if (body.mileage_start !== undefined) update.mileage_start = body.mileage_start
    if (body.fuel_level_start) update.fuel_level_start = body.fuel_level_start

    const { error: upErr } = await db.from('reservations').update(update).eq('id', id)
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

    // Mark vehicle as en_location
    await db.from('vehicles').update({ status: 'en_location' }).eq('id', res.vehicle_id)
    return NextResponse.json({ success: true })
  }

  if (action === 'complete') {
    if (res.status !== 'active') {
      return NextResponse.json({ error: 'Seules les réservations actives peuvent être clôturées' }, { status: 409 })
    }
    const update: Record<string, unknown> = {
      status: 'completed',
      completed_at: now,
    }
    if (body.mileage_end !== undefined) update.mileage_end = body.mileage_end
    if (body.fuel_level_end) update.fuel_level_end = body.fuel_level_end
    if (body.fuel_charge !== undefined) update.fuel_charge = body.fuel_charge
    if (body.damage_charge !== undefined) update.damage_charge = body.damage_charge

    const { error: upErr } = await db.from('reservations').update(update).eq('id', id)
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

    // Mark vehicle as disponible and update mileage
    const vehicleUpdate: Record<string, unknown> = { status: 'disponible' }
    if (body.mileage_end !== undefined) vehicleUpdate.current_mileage = body.mileage_end
    await db.from('vehicles').update(vehicleUpdate).eq('id', res.vehicle_id)

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}
