import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getVehicleBySlug,
  getVehicleUnavailabilities,
  getActiveRentalOptions,
  getAllVehicleSlugs,
} from '@/lib/supabase/queries'
import VehicleGallery from '@/components/vehicles/VehicleGallery'
import VehicleBookingPanel from '@/components/vehicles/VehicleBookingPanel'
import JsonLd from '@/components/JsonLd'
import { vehicleProductSchema, breadcrumbListSchema, SITE_URL } from '@/lib/schema'

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

export async function generateStaticParams() {
  return getAllVehicleSlugs()
}

// ISR: la page est pré-rendue au build (generateStaticParams) mais figée
// sans ce réglage — une réservation confirmée (trigger sync_reservation_to_
// unavailability, vérifié fonctionnel) n'apparaîtrait dans le calendrier
// qu'au prochain déploiement. Le vrai garde-fou anti-double-réservation
// reste côté serveur (is_vehicle_available() dans reservation/create) :
// ceci ne corrige que l'affichage.
export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const vehicle = await getVehicleBySlug(slug)
  if (!vehicle) return { title: 'Véhicule introuvable — JJ AUTO 92' }
  return {
    title: `${vehicle.brand} ${vehicle.model} ${vehicle.year} — Location JJ AUTO 92`,
    description: vehicle.description ?? `Louez la ${vehicle.brand} ${vehicle.model} ${vehicle.year} en Île-de-France. Assurance incluse, ${vehicle.daily_rate}€/jour.`,
  }
}

export default async function VehiculeDetailPage({ params }: Props) {
  const { slug } = await params
  const vehicle = await getVehicleBySlug(slug)
  if (!vehicle) notFound()

  const [unavailabilities, rentalOptions] = await Promise.all([
    getVehicleUnavailabilities(vehicle.id),
    getActiveRentalOptions(),
  ])

  const specs = [
    { label: 'Carburant', value: FUEL_LABELS[vehicle.fuel_type] ?? vehicle.fuel_type },
    { label: 'Boîte de vitesses', value: vehicle.transmission === 'automatique' ? 'Automatique' : 'Manuelle' },
    { label: 'Nombre de places', value: `${vehicle.seats} places` },
    { label: 'Nombre de portes', value: `${vehicle.doors} portes` },
    { label: 'Année', value: vehicle.year.toString() },
    { label: 'Couleur', value: vehicle.color },
    { label: 'Km inclus / jour', value: `${vehicle.mileage_included_per_day.toLocaleString('fr-FR')} km` },
    { label: 'Km supplémentaire', value: `${vehicle.excess_mileage_rate.toLocaleString('fr-FR')} €/km` },
    { label: 'Caution', value: `${vehicle.deposit_amount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €` },
    { label: 'Localisation', value: vehicle.location },
  ]

  const vehicleSlug = vehicle.slug ?? vehicle.id

  return (
    <div className="bg-gray-50 min-h-screen">
      <JsonLd data={vehicleProductSchema(vehicle)} />
      <JsonLd data={breadcrumbListSchema([
        { name: 'Accueil', url: SITE_URL },
        { name: 'Nos véhicules', url: `${SITE_URL}/vehicules` },
        { name: `${vehicle.brand} ${vehicle.model}`, url: `${SITE_URL}/vehicules/${vehicleSlug}` },
      ])} />

      {/* Breadcrumb */}
      <div className="bg-navy border-b border-navy-700">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/vehicules" className="hover:text-gold transition-colors">Nos véhicules</Link>
            <span>/</span>
            <span className="text-gray-300 font-medium truncate max-w-[200px]">
              {vehicle.brand} {vehicle.model}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10 pb-28 lg:pb-10">

        {/* Gallery — full width */}
        <VehicleGallery
          photos={vehicle.photos}
          brand={vehicle.brand}
          model={vehicle.model}
        />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">

          {/* ── Left: vehicle info ── */}
          <div className="lg:col-span-7 space-y-8">

            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-navy text-gold text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  {CATEGORY_LABELS[vehicle.category] ?? vehicle.category}
                </span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Disponible
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-navy leading-tight">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="text-gray-500 mt-1 text-lg">{vehicle.year} · {FUEL_LABELS[vehicle.fuel_type] ?? vehicle.fuel_type} · {vehicle.transmission === 'automatique' ? 'Automatique' : 'Manuelle'}</p>
            </div>

            {/* Description */}
            {vehicle.description && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-navy font-bold text-base mb-3 uppercase tracking-widest text-[11px] text-gold">
                  Présentation
                </h2>
                <p className="text-gray-600 leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            {/* Specs */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-[11px] font-bold text-gold uppercase tracking-widest mb-5">
                Caractéristiques
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x-0">
                {specs.map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-3.5 sm:py-3 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-gray-500 text-sm">{label}</span>
                    <span className="text-navy font-semibold text-sm text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features / équipements */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-[11px] font-bold text-gold uppercase tracking-widest mb-5">
                  Équipements inclus
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {vehicle.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conditions */}
            <div className="bg-navy rounded-2xl p-6">
              <h2 className="text-[11px] font-bold text-gold uppercase tracking-widest mb-4">
                Conditions de location
              </h2>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-gold mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Permis de conduire valide (catégorie B minimum)
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-gold mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Âge minimum : 21 ans (3 ans de permis requis)
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-gold mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Caution {vehicle.deposit_amount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} € — restituée en fin de location
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-gold mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Plein fait à la prise en charge, à restituer plein
                </li>
              </ul>
            </div>

          </div>

          {/* ── Right: booking panel ── */}
          <div className="lg:col-span-5">
            <VehicleBookingPanel
              vehicle={vehicle}
              options={rentalOptions}
              unavailabilities={unavailabilities}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
