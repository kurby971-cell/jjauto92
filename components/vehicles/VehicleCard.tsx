import Link from 'next/link'
import type { Vehicle } from '@/lib/types'

interface Props {
  vehicle: Vehicle
}

const CATEGORY_LABELS: Record<string, string> = {
  economy: 'Économique',
  compact: 'Compacte',
  standard: 'Standard',
  suv: 'SUV',
  premium: 'Premium',
  luxury: 'Luxe',
  utility: 'Utilitaire',
}

const FUEL_LABELS: Record<string, string> = {
  essence: 'Essence',
  diesel: 'Diesel',
  electrique: 'Électrique',
  hybride: 'Hybride',
  hybride_rechargeable: 'Hybride plug-in',
}

export default function VehicleCard({ vehicle }: Props) {
  const primaryPhoto = vehicle.photos?.find((p) => p.is_primary) ?? vehicle.photos?.[0]

  return (
    <Link
      href={`/vehicules/${vehicle.slug ?? vehicle.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      {/* Photo */}
      <div className="relative aspect-video bg-gradient-to-br from-navy-800 to-navy overflow-hidden">
        {primaryPhoto ? (
          <img
            src={primaryPhoto.url}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <svg className="w-14 h-14 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1M13 16l-2 1M13 16V6m0 10h5l2-1V8a1 1 0 00-.44-.82L18 6h-5v10z"/>
            </svg>
            <p className="text-gold-600 text-[10px] tracking-widest uppercase font-semibold">Photo bientôt disponible</p>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-navy text-gold text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
            {CATEGORY_LABELS[vehicle.category] ?? vehicle.category}
          </span>
        </div>

        {/* Availability */}
        {vehicle.status === 'disponible' && (
          <div className="absolute top-3 right-3">
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
              Disponible
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-extrabold text-navy text-lg leading-tight">
          {vehicle.brand} {vehicle.model}
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          {vehicle.year}
          {' · '}
          {FUEL_LABELS[vehicle.fuel_type] ?? vehicle.fuel_type}
          {' · '}
          {vehicle.transmission === 'automatique' ? 'Automatique' : 'Manuelle'}
          {' · '}
          {vehicle.seats} places
        </p>

        {vehicle.features && vehicle.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {vehicle.features.slice(0, 3).map((f) => (
              <span key={f} className="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded-md font-medium">
                {f}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest block">À partir de</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-navy">{vehicle.daily_rate} €</span>
              <span className="text-gray-400 text-sm">/ jour</span>
            </div>
          </div>
          <span className="bg-gold group-hover:bg-gold-400 text-navy font-extrabold text-[11px] px-4 py-2.5 rounded-lg uppercase tracking-widest transition-colors">
            Réserver
          </span>
        </div>
      </div>
    </Link>
  )
}
