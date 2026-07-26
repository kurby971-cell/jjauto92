'use client'

import { useEffect } from 'react'

const LS_KEY = 'jjauto92_reservation_draft'

// Monté sur la page de confirmation : une fois la réservation aboutie, le
// brouillon persisté (dates, clientSecret Stripe...) n'a plus de raison
// d'exister — le laisser traîner ferait resurgir cette étape à la prochaine
// visite de /reservation pour le même véhicule.
export default function ClearReservationDraft() {
  useEffect(() => {
    try {
      localStorage.removeItem(LS_KEY)
    } catch {}
  }, [])
  return null
}
