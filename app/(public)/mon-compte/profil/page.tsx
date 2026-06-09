import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCustomerByUser } from '@/lib/mon-compte/utils'
import ProfilForm from '@/components/mon-compte/ProfilForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mon profil — JJ AUTO 92' }

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion?next=/mon-compte/profil')

  const customer = await getCustomerByUser(user.id, user.email ?? '')

  return (
    <div>
      <h1 className="text-xl font-extrabold text-[#0D1B2A] mb-6">Mon profil</h1>
      <ProfilForm customer={customer} userEmail={user.email ?? ''} />
    </div>
  )
}
