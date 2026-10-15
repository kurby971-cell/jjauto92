// Calcule le résumé quotidien d'alertes pour l'administrateur (retards, cautions à traiter, documents, départs).
const esc = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const TZ = 'Europe/Paris'
const parisDay = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d)
const fmtDay = (iso: string) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ })
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: TZ })
const money = (n: number) => `${Math.round(n * 100) / 100} €`

type Obj = Record<string, unknown>
const one = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null))
const name = (c: Obj | null) => (c ? `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() : '—')

export type DailyAlerts = {
  total: number
  subject: string
  html: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildDailyAlerts(db: any, now = new Date()): Promise<DailyAlerts> {
  const today = parisDay(now)
  const in2Days = parisDay(new Date(now.getTime() + 2 * 86400000))
  const limit48h = new Date(now.getTime() + 48 * 3600000).toISOString()

  const [late, deposits, depart] = await Promise.all([
    db.from('reservations')
      .select('reservation_number,end_date,customers(first_name,last_name,phone),vehicles(brand,model)')
      .eq('status', 'active')
      .lt('end_date', today)
      .order('end_date'),
    db.from('deposits')
      .select('amount,status,authorization_expiry,reservations!inner(reservation_number,status,end_date,customers(first_name,last_name,phone))')
      .in('status', ['authorized', 'partially_captured']),
    db.from('reservations')
      .select('reservation_number,start_date,pickup_time,total_amount,customers(first_name,last_name,phone,is_verified),vehicles(brand,model),payments(amount,status)')
      .eq('status', 'confirmed')
      .gte('start_date', today)
      .lte('start_date', in2Days)
      .order('start_date'),
  ])

  const sections: string[] = []
  let total = 0

  // 1. Retours en retard
  const lateRows = (late.data ?? []) as Obj[]
  if (lateRows.length) {
    total += lateRows.length
    sections.push(
      `<h3>Retours en retard (${lateRows.length})</h3><ul>` +
        lateRows.map((r) => {
          const c = one(r.customers as Obj | Obj[])
          const v = one(r.vehicles as Obj | Obj[])
          return `<li><strong>${esc(r.reservation_number)}</strong> — ${esc(name(c))}${c?.phone ? ` (${esc(c.phone)})` : ''} — ${esc(v ? `${v.brand} ${v.model}` : '')} — retour prévu le ${esc(fmtDay(String(r.end_date)))}</li>`
        }).join('') + '</ul>',
    )
  }

  // 2. Cautions encore bloquées alors que la location est terminée
  const depRows = (deposits.data ?? []) as Obj[]
  const toHandle = depRows.filter((d) => {
    const r = one(d.reservations as Obj | Obj[])
    return r && (r.status === 'completed' || (r.status !== 'cancelled' && String(r.end_date) < today))
  })
  if (toHandle.length) {
    total += toHandle.length
    sections.push(
      `<h3>Cautions à libérer ou à prélever (${toHandle.length})</h3><p>Location terminée, caution toujours bloquée. Après contrôle du véhicule : libérer, ou prélever le montant du devis (Admin &rarr; Cautions).</p><ul>` +
        toHandle.map((d) => {
          const r = one(d.reservations as Obj | Obj[]) as Obj
          const c = one(r.customers as Obj | Obj[])
          const exp = d.authorization_expiry ? ` — blocage valable jusqu'au <strong>${esc(fmtDateTime(String(d.authorization_expiry)))}</strong>` : ''
          return `<li><strong>${esc(r.reservation_number)}</strong> — ${esc(name(c))} — ${esc(money(Number(d.amount)))}${exp}</li>`
        }).join('') + '</ul>',
    )
  }

  // 3. Cautions qui expirent sous 48 h
  const expiring = depRows.filter((d) => d.status === 'authorized' && d.authorization_expiry && String(d.authorization_expiry) <= limit48h)
  if (expiring.length) {
    total += expiring.length
    sections.push(
      `<h3>Cautions expirant sous 48 h (${expiring.length})</h3><ul>` +
        expiring.map((d) => {
          const r = one(d.reservations as Obj | Obj[]) as Obj
          return `<li><strong>${esc(r.reservation_number)}</strong> — ${esc(money(Number(d.amount)))} — expire le ${esc(fmtDateTime(String(d.authorization_expiry)))}</li>`
        }).join('') + '</ul>',
    )
  }

  // 4. Départs dans les 48 h (solde à encaisser, documents à vérifier)
  type Pay = { amount: number; status: string }
  const dep = (depart.data ?? []) as Obj[]
  const unverified = dep.filter((r) => !one(r.customers as Obj | Obj[])?.is_verified)
  total += unverified.length
  if (dep.length) {
    sections.push(
      `<h3>Départs dans les 48 h (${dep.length})</h3><ul>` +
        dep.map((r) => {
          const c = one(r.customers as Obj | Obj[])
          const v = one(r.vehicles as Obj | Obj[])
          const paid = ([] as Pay[]).concat((r.payments as Pay[]) ?? []).filter((p) => p.status === 'succeeded').reduce((s, p) => s + Number(p.amount), 0)
          const balance = Math.max(0, Math.round((Number(r.total_amount) - paid) * 100) / 100)
          const docs = c?.is_verified ? '' : ' — <strong style="color:#b45309">documents à vérifier</strong>'
          const t = r.pickup_time ? ` à ${esc(String(r.pickup_time).slice(0, 5))}` : ''
          return `<li><strong>${esc(r.reservation_number)}</strong> — ${esc(name(c))}${c?.phone ? ` (${esc(c.phone)})` : ''} — ${esc(v ? `${v.brand} ${v.model}` : '')} — ${esc(fmtDay(String(r.start_date)))}${t} — solde ${esc(money(balance))}${docs}</li>`
        }).join('') + '</ul>',
    )
  }

  const subject = total > 0
    ? `JJ AUTO 92 — ${total} point(s) à traiter aujourd'hui`
    : `JJ AUTO 92 — départs des 48 prochaines heures`

  const html = sections.length
    ? `<div style="font-family:Arial,sans-serif;font-size:14px;color:#0D1B2A"><p>Bonjour, voici le point du jour.</p>${sections.join('')}<p><a href="https://jjautomobiles.fr/admin">Ouvrir l'administration</a></p></div>`
    : ''

  return { total: sections.length ? total : 0, subject, html }
}
