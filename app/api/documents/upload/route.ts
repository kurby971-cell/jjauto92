import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(request: Request) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const docType = formData.get('type') as string | null

  if (!file || !docType) {
    return NextResponse.json({ error: 'Fichier ou type manquant' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Format non accepté. Utilisez JPG, PNG, WEBP ou PDF.' },
      { status: 400 }
    )
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `temp/${randomUUID()}/${docType}.${ext}`

  const supabase = createAdminClient()
  const bytes = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, bytes, { contentType: file.type, upsert: false })

  if (uploadError) {
    console.error('[documents/upload]', uploadError.message)
    return NextResponse.json({ error: 'Erreur upload fichier' }, { status: 500 })
  }

  // Signed URL valid 7 days (bucket is private)
  const { data: signed } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, 60 * 60 * 24 * 7)

  return NextResponse.json({
    url: signed?.signedUrl ?? null,
    path,
  })
}
