import type { Metadata } from 'next'
import { getActiveVehicles, getUpcomingReservationPeriods } from '@/lib/supabase/queries'
import VehiclesCatalog from '@/components/vehicles/VehiclesCatalog'
import JsonLd from '@/components/JsonLd'
import { breadcrumbListSchema, SITE_URL } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Nos véhicules — JJ AUTO 92',
  description: 'Catalogue de véhicules disponibles à la location en Île-de-France (92). Assurance incluse, livraison possible, tarifs transparents.',
}

export default async function VehiculesPage() {
  const [vehicles, reservedPeriods] = await Promise.all([
    getActiveVehicles(),
    getUpcomingReservationPeriods(),
  ])

  return (
    <>
      <JsonLd data={breadcrumbListSchema([
        { name: 'Accueil', url: SITE_URL },
        { name: 'Nos véhicules', url: `${SITE_URL}/vehicules` },
      ])} />
      <VehiclesCatalog vehicles={vehicles} reservedPeriods={reservedPeriods} />
    </>
  )
}
