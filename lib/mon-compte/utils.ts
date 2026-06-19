import { createAdminClient } from '@/lib/supabase/server'

export async function getCustomerByUser(userId: string, userEmail: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const { data: customer } = await db
    .from('customers')
    .select('id,first_name,last_name,email,phone,address_street,address_city,address_postal_code,address_country,driving_license_number,driving_license_expiry,is_verified,is_blacklisted,total_reservations,total_spent,auth_user_id,admin_notes')
    .eq('auth_user_id', userId)
    .maybeSingle()

  if (customer) return customer

  // Link existing customer by email
  const { data: byEmail } = await db
    .from('customers')
    .select('id,first_name,last_name,email,phone,address_street,address_city,address_postal_code,address_country,driving_license_number,driving_license_expiry,is_verified,is_blacklisted,total_reservations,total_spent,auth_user_id,admin_notes')
    .eq('email', userEmail)
    .maybeSingle()

  if (byEmail) {
    await db.from('customers').update({ auth_user_id: userId }).eq('id', byEmail.id)
    return { ...byEmail, auth_user_id: userId }
  }

  return null
}
