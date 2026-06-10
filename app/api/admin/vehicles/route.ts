import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-guard'
import { NextResponse } from 'next/server'

function toSlug(brand: string, model: string, year: string | number) {
  return `${brand}-${model}-${year}`
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function POST(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error as Response

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any
  const body = await request.json()

  const required = ['brand', 'model', 'year', 'license_plate', 'color', 'category', 'fuel_type', 'daily_rate']
  for (const f of required) {
    if (!body[f]) return NextResponse.json({ error: `Champ obligatoire : ${f}` }, { status: 400 })
  }

  const slug = body.slug?.trim() || toSlug(body.brand, body.model, body.year)

  const { data, error: insertErr } = await db.from('vehicles').insert({
    brand: body.brand,
    model: body.model,
    year: Number(body.year),
    license_plate: body.license_plate,
    vin: body.vin || null,
    color: body.color,
    category: body.category,
    fuel_type: body.fuel_type,
    transmission: body.transmission || 'automatique',
    seats: Number(body.seats) || 5,
    doors: Number(body.doors) || 5,
    daily_rate: Number(body.daily_rate),
    weekly_rate: body.weekly_rate ? Number(body.weekly_rate) : null,
    monthly_rate: body.monthly_rate ? Number(body.monthly_rate) : null,
    deposit_amount: Number(body.deposit_amount) || 500,
    mileage_included_per_day: Number(body.mileage_included_per_day) || 200,
    excess_mileage_rate: Number(body.excess_mileage_rate) || 0.25,
    status: body.status || 'disponible',
    current_mileage: Number(body.current_mileage) || 0,
    is_active: body.is_active !== false,
    photos: body.photos || [],
    features: body.features || [],
    description: body.description || null,
    slug,
    location: body.location || 'Nanterre',
    insurance_policy_number: body.insurance_policy_number || null,
    insurance_expiry: body.insurance_expiry || null,
    technical_inspection_date: body.technical_inspection_date || null,
  }).select('id').single()

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })
  return NextResponse.json({ id: data.id }, { status: 201 })
}
