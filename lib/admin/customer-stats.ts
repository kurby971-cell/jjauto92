// Les colonnes customers.total_reservations / total_spent ne sont jamais mises à jour :
// on les recalcule à la lecture à partir des réservations et des paiements réels.
export async function withCustomerStats<T extends { id: string }>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  customers: T[],
): Promise<Array<T & { total_reservations: number; total_spent: number }>> {
  const ids = customers.map((c) => c.id)
  if (ids.length === 0) return []

  const [{ data: reservations }, { data: payments }] = await Promise.all([
    db.from('reservations').select('customer_id,status').in('customer_id', ids).in('status', ['pending', 'confirmed', 'active', 'completed']),
    db.from('payments').select('customer_id,amount,refund_amount,status').in('customer_id', ids).in('status', ['succeeded', 'partially_refunded']),
  ])

  const counts = new Map<string, number>()
  for (const r of (reservations ?? []) as Array<{ customer_id: string; status: string }>) {
    if (r.status === 'pending') continue // non payée : pas encore une vraie réservation
    counts.set(r.customer_id, (counts.get(r.customer_id) ?? 0) + 1)
  }
  const spent = new Map<string, number>()
  for (const p of (payments ?? []) as Array<{ customer_id: string; amount: number; refund_amount: number | null }>) {
    spent.set(p.customer_id, (spent.get(p.customer_id) ?? 0) + Number(p.amount) - Number(p.refund_amount ?? 0))
  }

  return customers.map((c) => ({
    ...c,
    total_reservations: counts.get(c.id) ?? 0,
    total_spent: Math.round((spent.get(c.id) ?? 0) * 100) / 100,
  }))
}
