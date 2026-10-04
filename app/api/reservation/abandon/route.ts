import { createAdminClient } from '@/lib/supabase/server'
import { abandonReservation } from '@/lib/reservations/abandon'
import { NextResponse } from 'next/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Permet au client de revenir en arrière après la création de la réservation
// (étape paiement) : libère les dates et annule les pré-autorisations.
export async function POST(request: Request) {
  let reservationId: unknown
  try {
    reservationId = (await request.json())?.reservationId
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
  if (typeof reservationId !== 'string' || !UUID_RE.test(reservationId)) {
    return NextResponse.json({ error: 'Réservation invalide' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any
  const result = await abandonReservation(db, reservationId, 'Annulée par le client avant paiement')

  if (result === 'paid') {
    return NextResponse.json({ error: 'Un paiement a déjà été effectué pour cette réservation.' }, { status: 409 })
  }
  return NextResponse.json({ result })
}
