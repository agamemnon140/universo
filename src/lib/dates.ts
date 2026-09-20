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

/** "Oct 10, 2026" for a Julian Day. */
export function formatJd(jd: number): string {
  return new Date((jd - 2440587.5) * 86_400_000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** "Oct 10, 2026, 15:50 UTC" for a Julian Day. */
export function formatJdTime(jd: number): string {
  const d = new Date((jd - 2440587.5) * 86_400_000)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${date}, ${hh}:${mm} UTC`
}

/** A Julian Day → the calendar day it falls on, pinned to 12:00 UTC. */
export function dayOfJd(jd: number): Date {
  const d = new Date((jd - 2440587.5) * 86_400_000)
  return clampDate(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12)))
}

/** Days ahead → "in 3 days" / "in 1 day" / "today". */
export function inDays(days: number): string {
  const n = Math.round(days)
  return n === 0 ? 'today' : `in ${n} day${n === 1 ? '' : 's'}`
}

/** Days → "3 days" / "1 day" / "today". */
export function formatDays(days: number): string {
  const n = Math.round(days)
  if (n === 0) return 'today'
  return `${n} day${n === 1 ? '' : 's'}`
}
