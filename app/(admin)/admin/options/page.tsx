import { createAdminClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import OptionsManager from '@/components/admin/OptionsManager'

export const metadata: Metadata = { title: 'Options — Admin JJ AUTO 92' }

export default async function AdminOptionsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any
  const { data } = await db
    .from('rental_options')
    .select('id, code, name, description, price_per_day, price_fixed, is_active, sort_order')
    .order('sort_order')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0D1B2A]">Options de location</h1>
        <p className="text-gray-500 text-sm mt-1">
          Les options activées sont proposées aux clients lors de la réservation. Désactivez-en une pour la masquer ; les réservations existantes ne sont pas modifiées.
        </p>
      </div>
      <OptionsManager options={data ?? []} />
    </div>
  )
}
