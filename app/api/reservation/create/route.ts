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

function computeBaseAmount(
  nbDays: number,
  dailyRate: number,
  weeklyRate: number | null,
  monthlyRate: number | null,
  weekendRate: number | null,
  dateStart: string,
): number {
  if (nbDays >= 30 && monthlyRate) {
    const months = Math.floor(nbDays / 30)
    const remaining = nbDays % 30
    return months * monthlyRate + remaining * dailyRate
  }
  if (nbDays >= 7 && weeklyRate) {
    const weeks = Math.floor(nbDays / 7)
    const remaining = nbDays % 7
    return weeks * weeklyRate + remaining * dailyRate
  }
  // Weekend rate for 2-3 day rentals starting Friday or Saturday
  if ((nbDays === 2 || nbDays === 3) && weekendRate) {
    const dow = new Date(dateStart + 'T00:00:00').getDay() // 0=Sun,5=Fri,6=Sat
    if (dow === 5 || dow === 6) return weekendRate
  }
  return nbDays * dailyRate
}

export async function POST(request: Request) {
  let body: CreateBody
  try {
    body = await request.json()
  } catch (err) {
    console.error('[reservation/create] parse body:', err)
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { vehicleId, dateStart, dateEnd, selectedOptionIds, driver } = body
  if (!vehicleId || !dateStart || !dateEnd || !driver?.email) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  // 1. Verify availability
  const { data: available, error: availErr } = await db.rpc('is_vehicle_available', {
    p_vehicle_id: vehicleId,
    p_start_date: dateStart,
    p_end_date: dateEnd,
  })
  if (availErr) {
    console.error('[reservation/create] is_vehicle_available:', availErr)
    return NextResponse.json({ error: availErr.message }, { status: 500 })
  }
  if (available === false) {
    return NextResponse.json({ error: 'Véhicule non disponible sur ces dates' }, { status: 409 })
  }

  // 2. Fetch vehicle (server-side rate, never trust client)
  const { data: vehicle, error: vErr } = await db
    .from('vehicles')
    .select('daily_rate, weekend_rate, weekly_rate, monthly_rate, deposit_amount, mileage_included_per_day')
    .eq('id', vehicleId)
    .single()
  if (vErr || !vehicle) {
    console.error('[reservation/create] vehicle fetch:', vErr)
    return NextResponse.json({ error: vErr?.message ?? 'Véhicule introuvable' }, { status: 404 })
  }

  // 3. Compute amounts server-side
  const nbDays = Math.max(
    1,
    Math.round((new Date(dateEnd).getTime() - new Date(dateStart).getTime()) / 86_400_000)
  )

  const baseAmount = computeBaseAmount(
    nbDays,
    Number(vehicle.daily_rate),
    vehicle.weekly_rate ? Number(vehicle.weekly_rate) : null,
    vehicle.monthly_rate ? Number(vehicle.monthly_rate) : null,
    vehicle.weekend_rate ? Number(vehicle.weekend_rate) : null,
    dateStart,
  )
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
  const { data: existing } = await db.from('customers').select('id, is_blacklisted').eq('email', emailNorm).maybeSingle()

  if (existing?.is_blacklisted) {
    return NextResponse.json({ error: 'Réservation non autorisée. Contactez-nous au 07 61 42 21 92.' }, { status: 403 })
  }

  let customerId: string
  if (existing) {
    customerId = existing.id
    await db.from('customers').update({
      first_name: driver.firstName,
      last_name: driver.lastName,
      phone: driver.phone,
      date_of_birth: driver.dateOfBirth || null,
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
      console.error('[reservation/create] customer insert:', custErr)
      return NextResponse.json({ error: custErr?.message ?? 'Erreur création client' }, { status: 500 })
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
    console.error('[reservation/create] reservation insert:', resErr)
    return NextResponse.json({ error: resErr?.message ?? 'Erreur création réservation' }, { status: 500 })
  }

  // 6. Create Stripe PaymentIntent (rental)
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
    console.error('[reservation/create] stripe paymentIntent:', err)
    await db.from('reservations').delete().eq('id', reservation.id)
    const msg = err instanceof Error ? err.message : 'Erreur initialisation paiement'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // 7. Create payment record
  const { error: payErr } = await db.from('payments').insert({
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
  if (payErr) {
    console.error('[reservation/create] payments insert:', payErr)
    await db.from('reservations').delete().eq('id', reservation.id)
    try { await getStripe().paymentIntents.cancel(paymentIntent.id) } catch {}
    return NextResponse.json({ error: payErr.message }, { status: 500 })
  }

  // 8. Create Stripe PaymentIntent for deposit (capture_method: manual = pre-authorization)
  let depositClientSecret: string | null = null
  if (depositAmount > 0) {
    try {
      const depositIntent = await getStripe().paymentIntents.create({
        amount: Math.round(depositAmount * 100),
        currency: 'eur',
        capture_method: 'manual',
        metadata: {
          reservationId: reservation.id,
          reservationNumber: reservation.reservation_number,
          customerId,
          type: 'deposit',
        },
        automatic_payment_methods: { enabled: true },
        description: `Caution ${reservation.reservation_number} — JJ AUTO 92`,
      })
      depositClientSecret = depositIntent.client_secret

      const { error: depErr } = await db.from('deposits').insert({
        reservation_id: reservation.id,
        customer_id: customerId,
        stripe_payment_intent_id: depositIntent.id,
        amount: depositAmount,
        currency: 'eur',
        captured_amount: 0,
        status: 'pending',
      })
      if (depErr) {
        console.error('[reservation/create] deposits insert:', depErr)
      }
    } catch (err) {
      console.error('[reservation/create] stripe deposit paymentIntent:', err)
      // Non-fatal: reservation + rental payment are valid; admin handles deposit manually
    }
  }

  // Notify Make.com — fire-and-forget
  const { data: vInfo } = await db
    .from('vehicles')
    .select('brand,model')
    .eq('id', vehicleId)
    .single()

  const makeUrl = process.env.MAKE_WEBHOOK_URL_RESERVATION ?? '(non définie)'
  const makePayload = {
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
    status: 'pending' as const,
    notes_admin: null,
  }
  console.log('[reservation/create] Make URL :', makeUrl)
  console.log('[reservation/create] Make payload :', JSON.stringify({ event: 'reservation.created', ...makePayload }, null, 2))

  notifyMakeReservationCreated(makePayload)

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    depositClientSecret,
    reservationId: reservation.id,
    reservationNumber: reservation.reservation_number,
  })
}
