import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-guard'
import { NextResponse } from 'next/server'

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error as Response

  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any
  const body = await request.json()

  const { error: upErr } = await db.from('vehicles').update({
    brand: body.brand,
    model: body.model,
    year: Number(body.year),
    license_plate: body.license_plate,
    vin: body.vin || null,
    color: body.color,
    category: body.category,
    fuel_type: body.fuel_type,
    transmission: body.transmission,
    seats: Number(body.seats),
    doors: Number(body.doors),
    daily_rate: Number(body.daily_rate),
    weekly_rate: body.weekly_rate ? Number(body.weekly_rate) : null,
    monthly_rate: body.monthly_rate ? Number(body.monthly_rate) : null,
    deposit_amount: Number(body.deposit_amount),
    mileage_included_per_day: Number(body.mileage_included_per_day),
    excess_mileage_rate: Number(body.excess_mileage_rate),
    status: body.status,
    is_active: body.is_active,
    current_mileage: Number(body.current_mileage),
    location: body.location,
    insurance_policy_number: body.insurance_policy_number || null,
    insurance_expiry: body.insurance_expiry || null,
    technical_inspection_date: body.technical_inspection_date || null,
    description: body.description || null,
    features: body.features || [],
    photos: body.photos || [],
    slug: body.slug || null,
  }).eq('id', id)

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error as Response

  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  // Block deletion if active/confirmed reservations exist
  const { data: activeRes } = await db
    .from('reservations')
    .select('id')
    .eq('vehicle_id', id)
    .in('status', ['confirmed', 'active'])
    .limit(1)

  if (activeRes?.length > 0) {
    return NextResponse.json(
      { error: 'Impossible de supprimer un véhicule avec des réservations actives.' },
      { status: 409 }
    )
  }

  // Delete photos from storage
  const { data: vehicle } = await db
    .from('vehicles')
    .select('photos')
    .eq('id', id)
    .single()

  if (vehicle?.photos?.length) {
    const paths = vehicle.photos
      .map((p: { url: string }) => {
        try { return new URL(p.url).pathname.split('/vehicles/')[1] } catch { return null }
      })
      .filter(Boolean)
    if (paths.length) {
      await db.storage.from('vehicles').remove(paths)
    }
  }

  const { error: delErr } = await db.from('vehicles').delete().eq('id', id)
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
