import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reservations')
    .select('*, vehicles(*), customers(*), payments(*), deposits(*)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params
  const supabase = await createClient()
  const body = await req.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('reservations')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
