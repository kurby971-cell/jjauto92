import { createAdminClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import ClientsTable from '@/components/admin/ClientsTable'

export const metadata: Metadata = { title: 'Clients — Admin JJ AUTO 92' }

export default async function AdminClientsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const { data } = await db
    .from('customers')
    .select('id,first_name,last_name,email,phone,created_at,is_verified,is_blacklisted,total_reservations,total_spent,admin_notes')
    .order('created_at', { ascending: false })
    .limit(500)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0D1B2A]">Gestion des clients</h1>
        <p className="text-gray-500 text-sm mt-1">
          {(data ?? []).length} client{(data ?? []).length > 1 ? 's' : ''} · Vérifiez les documents, gérez les accès et ajoutez des notes internes.
        </p>
      </div>
      <ClientsTable clients={data ?? []} />
    </div>
  )
}
