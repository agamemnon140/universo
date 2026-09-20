/** Calendar-day helpers for the Positions tab: every day is evaluated at 12:00 UTC. */

/** The JPL planetary elements are fitted for 1800–2050; keep dates inside that window. */
export const MIN_DATE = '1800-01-01'
export const MAX_DATE = '2050-12-31'

/** Today's calendar date (local), pinned to 12:00 UTC so the whole day reads the same. */
export function todayNoon(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12))
}

export function clampDate(d: Date): Date {
  const min = new Date(`${MIN_DATE}T12:00:00Z`)
  const max = new Date(`${MAX_DATE}T12:00:00Z`)
  if (d < min) return min
  if (d > max) return max
  return d
}

export function addDays(d: Date, days: number): Date {
  return clampDate(new Date(d.getTime() + days * 86_400_000))
}
