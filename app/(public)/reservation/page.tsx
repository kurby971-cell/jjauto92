import type { Metadata } from 'next'
import { getVehicleBySlug, getActiveRentalOptions } from '@/lib/supabase/queries'
import ReservationTunnel from '@/components/reservation/ReservationTunnel'

export const metadata: Metadata = {
  title: 'Réservation — JJ AUTO 92',
  description: 'Réservez votre véhicule en ligne en 3 étapes simples.',
}

interface Props {
  searchParams: Promise<{
    vehicle?: string
    from?: string
    to?: string
  }>
}

export default async function ReservationPage({ searchParams }: Props) {
  const { vehicle: vehicleSlug, from, to } = await searchParams

  const [vehicle, rentalOptions] = await Promise.all([
    vehicleSlug ? getVehicleBySlug(vehicleSlug) : Promise.resolve(null),
    getActiveRentalOptions(),
  ])

  return (
    <ReservationTunnel
      vehicle={vehicle}
      rentalOptions={rentalOptions}
      initialDateStart={from ?? null}
      initialDateEnd={to ?? null}
    />
  )
}
