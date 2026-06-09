import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await request.json()
  const { first_name, last_name, phone, address_line1, address_city, address_postal_code } = body

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  // Find customer by auth_user_id or email
  const { data: customer } = await db
    .from('customers')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const customerId: string | null = customer?.id ?? null

  if (customerId) {
    const { error } = await db
      .from('customers')
      .update({
        first_name: first_name ?? undefined,
        last_name: last_name ?? undefined,
        phone: phone ?? undefined,
        address_line1: address_line1 ?? undefined,
        address_city: address_city ?? undefined,
        address_postal_code: address_postal_code ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Also update auth user metadata
  await supabase.auth.updateUser({
    data: { first_name, last_name, phone },
  })

  return NextResponse.json({ success: true })
}
