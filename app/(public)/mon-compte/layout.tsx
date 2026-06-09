import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MonCompteNav from '@/components/mon-compte/MonCompteNav'

export default async function MonCompteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/connexion?next=/mon-compte')
  }

  const meta = user.user_metadata ?? {}
  const firstName: string = meta.first_name ?? ''
  const lastName: string = meta.last_name ?? ''

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)]">
      {/* Banner */}
      <div className="bg-[#0D1B2A] print:hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">
            Espace client
          </p>
          <h1 className="text-white font-extrabold text-xl mt-0.5">
            Bonjour{firstName ? `, ${firstName}` : ''} 👋
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        <MonCompteNav
          firstName={firstName}
          lastName={lastName}
          email={user.email ?? ''}
        />
        <main className="flex-1 min-w-0 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
