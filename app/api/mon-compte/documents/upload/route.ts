import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const docType = formData.get('docType') as string | null
  const customerId = formData.get('customerId') as string | null

  if (!file || !docType || !customerId) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 10 MB)' }, { status: 400 })
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

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${customerId}/${docType}.${ext}`

  const { error: uploadError } = await adminClient.storage
    .from('documents')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: signedData } = await adminClient.storage
    .from('documents')
    .createSignedUrl(path, 60 * 60 * 24 * 30)

  return NextResponse.json({
    url: signedData?.signedUrl,
    path,
  })
}
