import type { UnavailabilityPeriod } from '@/lib/supabase/queries'

// Parse as UTC midnight so toISOString() always returns the same calendar date
// regardless of the browser's local timezone (critical for UTC+ timezones like France).
export function dateFromISO(iso: string): Date {
  return new Date(iso + 'T00:00:00Z')
}

export function addDaysISO(iso: string, n: number): string {
  const d = dateFromISO(iso)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().split('T')[0]
}

export function daysBetweenISO(a: string, b: string): number {
  return Math.round((dateFromISO(b).getTime() - dateFromISO(a).getTime()) / 86_400_000)
}

export function buildBlockedDateSet(periods: UnavailabilityPeriod[]): Set<string> {
  const set = new Set<string>()
  for (const { start_date, end_date } of periods) {
    const cur = dateFromISO(start_date)
    const end = dateFromISO(end_date)
    while (cur <= end) {
      set.add(cur.toISOString().split('T')[0])
      cur.setUTCDate(cur.getUTCDate() + 1)
    }
  }
  return set
}

// Same semantics as the vehicle page's own calendar: only dates strictly
// between start and end are checked, so a new booking's start/end may
// coincide with an existing reservation's boundary day (turnover day).
export function hasBlockedInRange(start: string, end: string, blocked: Set<string>): boolean {
  const cur = dateFromISO(start)
  cur.setUTCDate(cur.getUTCDate() + 1)
  const endDate = dateFromISO(end)
  while (cur < endDate) {
    if (blocked.has(cur.toISOString().split('T')[0])) return true
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return false
}
