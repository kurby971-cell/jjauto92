import { createAdminClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import DocumentsQueue from '@/components/admin/DocumentsQueue'

export const metadata: Metadata = { title: 'Documents — Admin JJ AUTO 92' }

export default async function AdminDocumentsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  // Fetch pending/confirmed reservations whose customer is not yet verified
  const { data } = await db
    .from('reservations')
    .select('id,reservation_number,start_date,total_amount,customers(id,first_name,last_name,email,phone,is_verified)')
    .in('status', ['pending', 'confirmed'])
    .order('start_date', { ascending: true })
    .limit(200)

  type ResRow = {
    id: string
    reservation_number: string
    start_date: string
    total_amount: number
    customers: {
      id: string
      first_name: string
      last_name: string
      email: string
      phone: string
      is_verified: boolean
    } | null
  }

  // Filter: customer not verified
  const pending = (data ?? [])
    .filter((r: ResRow) => r.customers && !r.customers.is_verified)
    .map((r: ResRow) => ({
      customerId: r.customers!.id,
      customerName: `${r.customers!.first_name} ${r.customers!.last_name}`,
      customerEmail: r.customers!.email,
      customerPhone: r.customers!.phone,
      reservationNumber: r.reservation_number,
      reservationId: r.id,
      startDate: r.start_date,
      totalAmount: r.total_amount,
      createdAt: r.start_date,
    }))

  // Deduplicate by customerId (one entry per customer even if multiple reservations)
  const seen = new Set<string>()
  const unique = pending.filter((p: { customerId: string }) => {
    if (seen.has(p.customerId)) return false
    seen.add(p.customerId)
    return true
  })

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-[#0D1B2A]">Validation documents</h1>
          {unique.length > 0 && (
            <span className="bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
              {unique.length}
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mt-1">
          Conducteurs dont les documents n'ont pas encore été vérifiés pour des réservations à venir.
        </p>
      </div>
      <DocumentsQueue items={unique} />
    </div>
  )
}
