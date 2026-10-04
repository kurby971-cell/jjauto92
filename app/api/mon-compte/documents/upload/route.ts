import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { ALLOWED_TYPES, ALLOWED_DOC_TYPES, MAX_SIZE, extensionFor, matchesSignature } from '@/lib/uploads'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
  const file = formData.get('file') as File | null
  const docType = formData.get('docType') as string | null
  const customerId = formData.get('customerId') as string | null

  if (!file || !docType || !customerId) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  if (!ALLOWED_DOC_TYPES.includes(docType)) {
    return NextResponse.json({ error: 'Type de document invalide' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Format non accepté. Utilisez JPG, PNG, WEBP ou PDF.' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 400 })
  }
  const bytes = await file.arrayBuffer()
  if (!matchesSignature(file.type, new Uint8Array(bytes.slice(0, 16)))) {
    return NextResponse.json({ error: 'Le contenu du fichier ne correspond pas à son format.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any

  // Verify this customer belongs to the authenticated user
  const { data: customer } = await adminClient
    .from('customers')
    .select('id,auth_user_id')
    .eq('id', customerId)
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!customer) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const ext = extensionFor(file.type)
  const path = `${customerId}/${docType}.${ext}`

  const { error: uploadError } = await adminClient.storage
    .from('documents')
    .upload(path, bytes, { upsert: true, contentType: file.type })

  if (uploadError) {
    console.error('[mon-compte/documents/upload]', uploadError.message)
    return NextResponse.json({ error: 'Erreur upload fichier' }, { status: 500 })
  }

  const { data: signedData } = await adminClient.storage
    .from('documents')
    .createSignedUrl(path, 60 * 60 * 24 * 30)

  return NextResponse.json({
    url: signedData?.signedUrl,
    path,
  })
}
