import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const vehicleId = searchParams.get('vehicleId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (!vehicleId || !startDate || !endDate) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('is_vehicle_available', {
    p_vehicle_id: vehicleId,
    p_start_date: startDate,
    p_end_date: endDate,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ available: data })
}
