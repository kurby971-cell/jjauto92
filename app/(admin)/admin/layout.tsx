import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/connexion?next=/admin')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const [{ count: pendingCount }, { count: docsCount }] = await Promise.all([
    db.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('customers').select('*', { count: 'exact', head: true }).eq('is_verified', false),
  ])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        pendingCount={pendingCount ?? 0}
        docsCount={docsCount ?? 0}
        userEmail={user.email ?? ''}
      />
      <div className="flex-1 min-w-0 overflow-auto">
        <main className="p-6 lg:p-8 min-h-screen">{children}</main>
      </div>
    </div>
  )
}
