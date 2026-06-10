import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/connexion?next=/admin')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  // Primary: app_metadata lu depuis le JWT via l'API Supabase côté serveur
  let isAdmin = user.app_metadata?.role === 'admin'

  // Fallback: lecture directe en base via Admin API si le JWT ne contient pas encore le rôle
  if (!isAdmin) {
    try {
      const { data: { user: dbUser }, error } = await db.auth.admin.getUserById(user.id)
      if (!error && dbUser) {
        isAdmin = dbUser.app_metadata?.role === 'admin'
      }
    } catch {
      // fallback silencieux — accès refusé si les deux méthodes échouent
    }
  }

  if (!isAdmin) {
    // Utilisateur authentifié mais pas admin → home (pas /connexion pour éviter une boucle)
    redirect('/')
  }

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
