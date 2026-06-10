import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import VehicleForm from '@/components/admin/VehicleForm'

interface Props { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: 'Modifier véhicule — Admin JJ AUTO 92' }

export default async function EditVehiclePage({ params }: Props) {
  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const { data: vehicle, error } = await db
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !vehicle) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/vehicules" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[#0D1B2A] text-xs font-semibold uppercase tracking-widest transition-colors mb-3">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour flotte
        </Link>
        <h1 className="text-2xl font-extrabold text-[#0D1B2A]">
          Modifier — {vehicle.brand} {vehicle.model} {vehicle.year}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {vehicle.license_plate} · ID&nbsp;
          <code className="font-mono text-xs text-gray-400">{id}</code>
        </p>
      </div>
      <VehicleForm vehicle={vehicle} />
    </div>
  )
}
