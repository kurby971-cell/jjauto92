import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-guard'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error as Response

  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const body = await request.json()
  const update: Record<string, unknown> = {}

  if ('is_verified' in body) {
    update.is_verified = Boolean(body.is_verified)
    if (body.is_verified) update.verified_at = new Date().toISOString()
  }
  if ('is_blacklisted' in body) {
    update.is_blacklisted = Boolean(body.is_blacklisted)
    if (body.is_blacklisted) update.blacklist_reason = body.blacklist_reason ?? 'Bloqué par admin'
  }
  if ('admin_notes' in body) {
    update.admin_notes = body.admin_notes
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 })
  }

  const { error: upErr } = await db.from('customers').update(update).eq('id', id)
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
