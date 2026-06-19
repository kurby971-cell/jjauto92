import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const { data: customer, error: fetchErr } = await db
    .from('customers')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (fetchErr) {
    console.error('[supprimer-donnees] fetch customer:', fetchErr)
    return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  }

  if (!customer) {
    return NextResponse.json({ success: true })
  }

  // Anonymize all personal data
  const { error: upErr } = await db
    .from('customers')
    .update({
      first_name: 'Anonymisé',
      last_name: 'Anonymisé',
      email: `anon-${customer.id}@deleted.local`,
      phone: '0000000000',
      date_of_birth: null,
      address_street: null,
      address_city: null,
      address_postal_code: null,
      driving_license_number: null,
      driving_license_expiry: null,
      driving_license_country: null,
      driving_license_category: null,
      id_document_type: null,
      id_document_number: null,
      id_document_expiry: null,
      stripe_customer_id: null,
      admin_notes: null,
      data_deletion_requested: true,
    })
    .eq('id', customer.id)

  if (upErr) {
    console.error('[supprimer-donnees] update:', upErr)
    return NextResponse.json({ error: upErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
