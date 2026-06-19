import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type Ctx = { params: Promise<{ id: string }> }

// Fields a logged-in customer is allowed to update on their own reservation
const CUSTOMER_ALLOWED_FIELDS = ['notes'] as const

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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  // Only allow safe fields
  const safeBody: Partial<Record<typeof CUSTOMER_ALLOWED_FIELDS[number], unknown>> = {}
  for (const key of CUSTOMER_ALLOWED_FIELDS) {
    if (key in body) safeBody[key] = body[key]
  }

  if (Object.keys(safeBody).length === 0) {
    return NextResponse.json({ error: 'Aucun champ modifiable' }, { status: 400 })
  }

  // RLS on supabase client ensures the reservation belongs to this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('reservations')
    .update(safeBody)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
