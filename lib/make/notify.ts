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
  upfront_amount: number
  balance_due: number
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
  totalAmount?: number
  balanceDue?: number
  currency: string
  customerEmail?: string
  customerName?: string
  vehicleName?: string
  startDate?: string
  endDate?: string
  pickupTime?: string
  returnTime?: string
  pickupLocation?: string
  depositAmount?: number
  status: string
}) {
  const url = process.env.MAKE_WEBHOOK_URL_PAYMENT
  if (!url) return
  await postToMake(url, { event: 'payment.received', ...paymentWording(payload), ...payload })
}

const eur = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`

// Textes du mail de confirmation selon la situation : acompte (solde restant) ou règlement intégral.
function paymentWording(p: { amount: number; totalAmount?: number; balanceDue?: number }) {
  const balance = p.balanceDue ?? (p.totalAmount != null ? Math.max(0, Math.round((p.totalAmount - p.amount) * 100) / 100) : 1)
  const base = 'votre permis de conduire, votre pièce d\u2019identité en cours de validité'
  if (balance > 0) {
    const pct = p.totalAmount ? Math.round((p.amount / p.totalAmount) * 100) : 20
    const total = p.totalAmount != null ? ` (total de la location : ${eur(p.totalAmount)})` : ''
    return {
      paymentType: 'acompte',
      paymentHtml: `<p>Votre acompte de <strong>${eur(p.amount)}</strong> (${pct} %) a bien été reçu par carte.</p><p>Reste à régler le jour de la prise du véhicule : <strong>${eur(balance)}</strong>${total}.</p>`,
      bringList: `${base}, votre carte bancaire et le solde de la location`,
    }
  }
  return {
    paymentType: 'integral',
    paymentHtml: `<p>Votre règlement de <strong>${eur(p.amount)}</strong> a bien été reçu par carte : votre location est réglée en totalité, aucun solde n\u2019est à prévoir.</p>`,
    bringList: `${base} et votre carte bancaire`,
  }
}

// Résumé quotidien d'alertes pour l'administrateur (scénario Make dédié → e-mail).
export async function notifyMakeAdminDigest(payload: { subject: string; html: string; total: number }) {
  const url = process.env.MAKE_WEBHOOK_URL_ALERT
  if (!url) return false
  await postToMake(url, { event: 'admin.daily_alerts', ...payload })
  return true
}
