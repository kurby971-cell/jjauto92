import { createAdminClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/server'
import { notifyMakeReservationCreated } from '@/lib/make/notify'
import { NextResponse } from 'next/server'

interface CreateBody {
  vehicleId: string
  dateStart: string
  dateEnd: string
  selectedOptionIds: string[]
  driver: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    licenseNumber: string
  }
  documents: {
    licenseRecto: string | null
    licenseVerso: string | null
    idDocument: string | null
    idDocumentType: string | null
  }
}

export async function POST(request: Request) {
  let body: CreateBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { vehicleId, dateStart, dateEnd, selectedOptionIds, driver } = body
  if (!vehicleId || !dateStart || !dateEnd || !driver?.email) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  // 1. Verify availability
  const { data: available } = await db.rpc('is_vehicle_available', {
    p_vehicle_id: vehicleId,
    p_start_date: dateStart,
    p_end_date: dateEnd,
  })
  if (available === false) {
    return NextResponse.json({ error: 'Véhicule non disponible sur ces dates' }, { status: 409 })
  }

  // 2. Fetch vehicle (server-side rate, never trust client)
  const { data: vehicle, error: vErr } = await db
    .from('vehicles')
    .select('daily_rate, deposit_amount')
    .eq('id', vehicleId)
    .single()
  if (vErr || !vehicle) {
    return NextResponse.json({ error: 'Véhicule introuvable' }, { status: 404 })
  }

  // 3. Compute amounts server-side
  const nbDays = Math.max(
    1,
    Math.round((new Date(dateEnd).getTime() - new Date(dateStart).getTime()) / 86_400_000)
  )
  const baseAmount = Number(vehicle.daily_rate) * nbDays
  const depositAmount = Number(vehicle.deposit_amount)

  let optionsAmount = 0
  let optionsCodes: Record<string, boolean> = {}
  if (selectedOptionIds?.length) {
    const { data: opts } = await db
      .from('rental_options')
      .select('id, code, price_per_day, price_fixed')
      .in('id', selectedOptionIds)
    if (opts?.length) {
      optionsAmount = opts.reduce(
        (sum: number, o: { price_per_day: number; price_fixed: number }) =>
          sum + Number(o.price_per_day) * nbDays + Number(o.price_fixed),
        0
      )
      optionsCodes = opts.reduce(
        (acc: Record<string, boolean>, o: { code: string }) => ({ ...acc, [o.code]: true }),
        {}
      )
    }
  }
  const totalAmount = baseAmount + optionsAmount

  // 4. Upsert customer by email
  const emailNorm = driver.email.toLowerCase().trim()
  const { data: existing } = await db.from('customers').select('id').eq('email', emailNorm).maybeSingle()

  let customerId: string
  if (existing) {
    customerId = existing.id
    await db.from('customers').update({
      first_name: driver.firstName,
      last_name: driver.lastName,
      phone: driver.phone,
      driving_license_number: driver.licenseNumber || null,
    }).eq('id', customerId)
  } else {
    const { data: newCust, error: custErr } = await db.from('customers').insert({
      first_name: driver.firstName,
      last_name: driver.lastName,
      email: emailNorm,
      phone: driver.phone,
      date_of_birth: driver.dateOfBirth || null,
      driving_license_number: driver.licenseNumber || null,
      address_country: 'FR',
      is_verified: false,
      is_blacklisted: false,
      marketing_consent: false,
      data_deletion_requested: false,
      total_reservations: 0,
      total_spent: 0,
      rgpd_consent_date: new Date().toISOString(),
    }).select('id').single()
    if (custErr || !newCust) {
      console.error('[reservation/create] customer:', custErr?.message)
      return NextResponse.json({ error: 'Erreur création client' }, { status: 500 })
    }
    customerId = newCust.id
  }

  // 5. Create reservation
  const { data: reservation, error: resErr } = await db
    .from('reservations')
    .insert({
      customer_id: customerId,
      vehicle_id: vehicleId,
      start_date: dateStart,
      end_date: dateEnd,
      pickup_time: '09:00',
      return_time: '18:00',
      status: 'pending',
      source: 'web',
      daily_rate_snapshot: vehicle.daily_rate,
      base_amount: baseAmount,
      options_amount: optionsAmount,
      discount_amount: 0,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      options: optionsCodes,
      pickup_location: '1 Allée de Lorraine, 92000 Nanterre',
      return_location: '1 Allée de Lorraine, 92000 Nanterre',
      excess_mileage_charge: 0,
      fuel_charge: 0,
      damage_charge: 0,
      cancellation_fee: 0,
    })
    .select('id, reservation_number')
    .single()

  if (resErr || !reservation) {
    console.error('[reservation/create] reservation:', resErr?.message)
    return NextResponse.json({ error: 'Erreur création réservation' }, { status: 500 })
  }

  // 6. Create Stripe PaymentIntent
  let paymentIntent
  try {
    paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'eur',
      metadata: {
        reservationId: reservation.id,
        reservationNumber: reservation.reservation_number,
        customerId,
      },
      automatic_payment_methods: { enabled: true },
      description: `Réservation ${reservation.reservation_number} — JJ AUTO 92`,
    })
  } catch (err) {
    console.error('[reservation/create] stripe:', err)
    await db.from('reservations').delete().eq('id', reservation.id)
    return NextResponse.json({ error: 'Erreur initialisation paiement' }, { status: 500 })
  }

  // 7. Create payment record
  await db.from('payments').insert({
    reservation_id: reservation.id,
    customer_id: customerId,
    stripe_payment_intent_id: paymentIntent.id,
    amount: totalAmount,
    currency: 'eur',
    status: 'pending',
    type: 'reservation',
    refund_amount: 0,
    metadata: {},
  })

  // Notify Make.com (fire-and-forget, never blocks the response)
  const { data: vInfo } = await db
    .from('vehicles')
    .select('brand,model')
    .eq('id', vehicleId)
    .single()

  notifyMakeReservationCreated({
    reference: reservation.reservation_number,
    created_at: new Date().toISOString(),
    customer_name: `${driver.firstName} ${driver.lastName}`,
    customer_phone: driver.phone,
    vehicle_name: `${vInfo?.brand ?? ''} ${vInfo?.model ?? ''}`.trim(),
    start_date: dateStart,
    end_date: dateEnd,
    pickup_time: '09:00',
    return_time: '18:00',
    delivery_address: '1 Allée de Lorraine, 92000 Nanterre',
    duration_days: nbDays,
    total_price: totalAmount,
    deposit_amount: depositAmount,
    status: 'pending',
    notes_admin: null,
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    reservationId: reservation.id,
    reservationNumber: reservation.reservation_number,
  })
}
