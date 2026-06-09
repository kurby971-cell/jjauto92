import { createClient } from '@/lib/supabase/server'
import VehicleCard from '@/components/vehicles/VehicleCard'
import Link from 'next/link'
import type { Vehicle } from '@/lib/types'

export default async function FleetSection() {
  let vehicles: Vehicle[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('is_active', true)
      .order('daily_rate', { ascending: true })
      .limit(6)

    vehicles = (data as Vehicle[]) ?? []
  } catch {
    // Supabase non configuré ou erreur réseau — affiche état vide
  }

  return (
    <section id="flotte" className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-gold text-[11px] font-bold uppercase tracking-[0.2em]">Notre flotte</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy mt-3 leading-tight">
            Un véhicule pour chaque besoin
          </h2>
          <div className="w-14 h-1 bg-gold mx-auto mt-5" />
          <p className="text-gray-500 mt-6 max-w-xl mx-auto text-lg">
            Du citadin économique à la berline premium — tous nos véhicules sont contrôlés,
            assurés et prêts à partir.
          </p>
        </div>

        {/* Grid */}
        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1M13 16l-2 1M13 16V6m0 10h5l2-1V8a1 1 0 00-.44-.82L18 6h-5v10z"/>
              </svg>
            </div>
            <p className="font-bold text-navy text-lg">Aucun véhicule disponible</p>
            <p className="text-gray-400 text-sm mt-1">Contactez-nous pour connaître nos disponibilités</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/vehicules"
            className="inline-flex items-center gap-3 bg-navy hover:bg-navy-800 text-white font-bold px-8 py-4 rounded-xl uppercase tracking-widest text-xs transition-colors"
          >
            Voir toute la flotte
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
