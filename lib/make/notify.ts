async function postToMake(url: string, payload: object): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // Never fail the main flow if Make is unreachable
  }
}

export async function notifyMakeReservationCreated(payload: {
  reservationId: string
  reservationNumber: string
  vehicleBrand: string
  vehicleModel: string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string
  startDate: string
  endDate: string
  totalAmount: number
  status: string
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
