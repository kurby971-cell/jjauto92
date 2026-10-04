import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-guard'
import { NextResponse } from 'next/server'

// Active ou désactive une option de location (visible ou non pour les clients)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error as Response

  const { id } = await params
  let body: { is_active?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }
  if (typeof body.is_active !== 'boolean') {
    return NextResponse.json({ error: 'is_active (booléen) requis' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any
  const { data, error: upErr } = await db
    .from('rental_options')
    .update({ is_active: body.is_active })
    .eq('id', id)
    .select('id, is_active')
    .maybeSingle()
  if (upErr) {
    console.error('[admin/options]', upErr.message)
    return NextResponse.json({ error: 'Erreur de mise à jour' }, { status: 500 })
  }
  if (!data) return NextResponse.json({ error: 'Option introuvable' }, { status: 404 })
  return NextResponse.json(data)
}
