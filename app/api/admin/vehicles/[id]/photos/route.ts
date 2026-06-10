import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin-guard'
import { NextResponse } from 'next/server'

type Params = { params: Promise<{ id: string }> }

// POST — upload new photos
export async function POST(request: Request, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error as Response

  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const formData = await request.formData()
  const files = formData.getAll('files') as File[]
  if (!files.length) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 })

  // Read current photos
  const { data: vehicle } = await db.from('vehicles').select('photos').eq('id', id).single()
  const existing: Array<{ url: string; label: string; is_primary: boolean }> = vehicle?.photos ?? []

  const uploaded: typeof existing = []
  for (const file of files) {
    if (file.size > 8 * 1024 * 1024) continue // skip files > 8 MB
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = `${id}/${filename}`

    const { error: upErr } = await db.storage
      .from('vehicles')
      .upload(path, file, { contentType: file.type, upsert: false })

    if (upErr) continue

    const { data: { publicUrl } } = db.storage.from('vehicles').getPublicUrl(path)
    uploaded.push({ url: publicUrl, label: '', is_primary: false })
  }

  const allPhotos = [...existing, ...uploaded].map((p, i) => ({ ...p, is_primary: i === 0 }))

  await db.from('vehicles').update({ photos: allPhotos }).eq('id', id)
  return NextResponse.json({ photos: allPhotos })
}

// PUT — save updated photos array (reorder / delete)
export async function PUT(request: Request, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error as Response

  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const { photos } = await request.json()
  const normalized = (photos ?? []).map(
    (p: { url: string; label: string; is_primary: boolean }, i: number) => ({
      ...p,
      is_primary: i === 0,
    })
  )

  const { error: upErr } = await db.from('vehicles').update({ photos: normalized }).eq('id', id)
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
  return NextResponse.json({ photos: normalized })
}
