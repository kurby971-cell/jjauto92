async function postToMake(url: string, payload: object): Promise<void> {
  console.log('[Make] → POST', url)
  console.log('[Make] payload', JSON.stringify(payload, null, 2))
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await res.text()
    console.log(`[Make] ${res.status} — ${body}`)
  } catch (err) {
    console.error('[Make] fetch failed:', err)
  }
}

export async function notifyMakeReservationCreated(payload: {
  reference: string
  created_at: string
  customer_name: string
  customer_phone: string
  vehicle_name: string
  start_date: string
  end_date: string
  pickup_time: string
  return_time: string
  delivery_address: string
  duration_days: number
  total_price: number
  deposit_amount: number
  status: string
  notes_admin: string | null
}) {
  const url = process.env.MAKE_WEBHOOK_URL_RESERVATION
  if (!url) return
  await postToMake(url, { event: 'reservation.created', ...payload })
}

export async function notifyMakePaymentReceived(payload: {
  reservationId: string
  reservationNumber?: string
  paymentIntentId: string
  amount: number
  currency: string
  customerEmail?: string
  status: string
}) {
  const url = process.env.MAKE_WEBHOOK_URL_PAYMENT
  if (!url) return
  await postToMake(url, { event: 'payment.received', ...payload })
}
