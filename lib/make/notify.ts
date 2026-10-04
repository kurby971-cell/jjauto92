async function postToMake(url: string, payload: object): Promise<void> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (process.env.MAKE_WEBHOOK_API_KEY) headers['x-make-apikey'] = process.env.MAKE_WEBHOOK_API_KEY
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) console.error(`[Make] webhook en échec — statut ${res.status}`)
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
