// Calcul unique du prix de base d'une location — utilisé par le serveur
// (app/api/reservation/create) ET par les pages d'affichage, pour que le prix
// affiché soit toujours celui qui est facturé.
export interface BaseRates {
  daily_rate: number
  weekend_rate?: number | null
  weekly_rate?: number | null
  monthly_rate?: number | null
}

export type RateKind = 'daily' | 'weekend' | 'weekly' | 'monthly'

export function computeBaseAmount(
  nbDays: number,
  dailyRate: number,
  weeklyRate: number | null,
  monthlyRate: number | null,
  weekendRate: number | null,
  dateStart: string | null,
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
  // Tarif week-end : location de 2 ou 3 jours commençant un vendredi ou un samedi
  if ((nbDays === 2 || nbDays === 3) && weekendRate && dateStart) {
    const dow = new Date(dateStart + 'T00:00:00').getDay() // 0=dim, 5=ven, 6=sam
    if (dow === 5 || dow === 6) return weekendRate
  }
  return nbDays * dailyRate
}

export function computeVehicleBaseAmount(v: BaseRates, nbDays: number, dateStart: string | null): number {
  return computeBaseAmount(
    nbDays,
    Number(v.daily_rate),
    v.weekly_rate ? Number(v.weekly_rate) : null,
    v.monthly_rate ? Number(v.monthly_rate) : null,
    v.weekend_rate ? Number(v.weekend_rate) : null,
    dateStart,
  )
}

// Libellé de la ligne de prix affichée au client
export function describeBaseAmount(v: BaseRates, nbDays: number, dateStart: string | null): string {
  const total = computeVehicleBaseAmount(v, nbDays, dateStart)
  if (total === nbDays * Number(v.daily_rate)) return `${nbDays} jour${nbDays > 1 ? 's' : ''} × ${v.daily_rate} €`
  if (nbDays >= 30 && v.monthly_rate) return `${nbDays} jours · tarif mensuel`
  if (nbDays >= 7 && v.weekly_rate) return `${nbDays} jours · tarif semaine`
  return `${nbDays} jours · tarif week-end`
}

// ── Règlement : acompte par carte + solde en espèces ─────────────────────────
// Acompte de 20 % du prix de la location, payé par carte au plus tard 48 h
// avant la prise du véhicule ; le solde est réglé en espèces à la prise.
export const UPFRONT_RATE = 0.2
export const MIN_HOURS_BEFORE_PICKUP = 48

export function computeUpfrontAmount(total: number): number {
  return Math.round(total * UPFRONT_RATE * 100) / 100
}

export function computeBalanceDue(total: number): number {
  return Math.round((total - computeUpfrontAmount(total)) * 100) / 100
}

// Instant UTC (ms) correspondant à une date + heure murales à Paris.
function parisWallToUtcMs(date: string, time: string): number {
  const guess = Date.parse(`${date}T${time}:00Z`)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris', hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).formatToParts(new Date(guess))
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  const wallAsUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'))
  return guess - (wallAsUtc - guess)
}

export function hoursBeforePickup(dateStart: string, pickupTime: string, nowMs: number): number {
  return (parisWallToUtcMs(dateStart, pickupTime) - nowMs) / 3_600_000
}

export const PICKUP_TOO_SOON_MESSAGE =
  "L'acompte doit être réglé par carte au moins 48 h avant la prise du véhicule. " +
  'Pour une prise en charge plus proche, contactez-nous au 07 61 42 21 92.'
