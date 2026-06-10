import type { Metadata } from 'next'
import Link from 'next/link'
import VehicleForm from '@/components/admin/VehicleForm'

export const metadata: Metadata = { title: 'Nouveau véhicule — Admin JJ AUTO 92' }

export default function NewVehiclePage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/vehicules" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[#0D1B2A] text-xs font-semibold uppercase tracking-widest transition-colors mb-3">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour flotte
        </Link>
        <h1 className="text-2xl font-extrabold text-[#0D1B2A]">Nouveau véhicule</h1>
        <p className="text-gray-500 text-sm mt-1">Remplissez les informations puis ajoutez des photos.</p>
      </div>
      <VehicleForm />
    </div>
  )
}
