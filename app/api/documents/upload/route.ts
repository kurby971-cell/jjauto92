import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

import { ALLOWED_TYPES, ALLOWED_DOC_TYPES, MAX_SIZE, extensionFor, matchesSignature } from '@/lib/uploads'

// Limite best-effort par IP (mémoire de l'instance serverless) : freine l'abus
// sans base de données. 12 envois / 10 minutes / IP.
const WINDOW_MS = 10 * 60 * 1000
const MAX_UPLOADS = 12
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_UPLOADS) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k)
  }
  return false
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-nf-client-connection-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'inconnu'
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Trop de fichiers envoyés. Réessayez dans quelques minutes.' }, { status: 429 })
  }

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
  if (!ALLOWED_DOC_TYPES.includes(docType)) {
    return NextResponse.json({ error: 'Type de document invalide' }, { status: 400 })
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

  const ext = extensionFor(file.type)
  const path = `temp/${randomUUID()}/${docType}.${ext}`

  const supabase = createAdminClient()
  const bytes = await file.arrayBuffer()
  if (!matchesSignature(file.type, new Uint8Array(bytes.slice(0, 16)))) {
    return NextResponse.json({ error: 'Le contenu du fichier ne correspond pas à son format.' }, { status: 400 })
  }

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
