import type { Telescope } from '../types'

/** EM spectrum axis: log10(wavelength in meters), gamma → radio. */

export const AXIS_MIN_LOG = -13 // 1e-13 m (hard gamma; shorter is clamped)
export const AXIS_MAX_LOG = 2 // 100 m (long radio)
export const AXIS_DECADES = AXIS_MAX_LOG - AXIS_MIN_LOG

export interface EmBand {
  name: string
  minLog: number
  maxLog: number
  color: string
}

export const EM_BANDS: EmBand[] = [
  { name: 'Gamma', minLog: -13, maxLog: -11, color: '#c084fc' },
  { name: 'X-ray', minLog: -11, maxLog: -8, color: '#818cf8' },
  { name: 'UV', minLog: -8, maxLog: Math.log10(3.8e-7), color: '#60a5fa' },
  { name: 'Visible', minLog: Math.log10(3.8e-7), maxLog: Math.log10(7.5e-7), color: '#facc15' },
  { name: 'Infrared', minLog: Math.log10(7.5e-7), maxLog: -3, color: '#fb923c' },
  { name: 'Microwave', minLog: -3, maxLog: -1, color: '#f87171' },
  { name: 'Radio', minLog: -1, maxLog: 2, color: '#f472b6' },
]

/** Wavelength (m) → fraction 0..1 along the axis, clamped to the domain. */
export function wavelengthToX(wavelengthM: number): number {
  const logValue = Math.log10(wavelengthM)
  const clamped = Math.min(AXIS_MAX_LOG, Math.max(AXIS_MIN_LOG, logValue))
  return (clamped - AXIS_MIN_LOG) / AXIS_DECADES
}

/** Words used in plannedDate to place a target inside its decade. */
const DECADE_OFFSET: Record<string, number> = { early: 2, mid: 5, late: 8 }

/**
 * Year an instrument started (or is expected to start) observing: `launched`
 * when it is known, otherwise a sortable estimate parsed from `plannedDate`
 * ('~2027' → 2027, 'mid-2030s' → 2035). Null when even that is unknown.
 */
export function startYear(telescope: Telescope): number | null {
  if (telescope.launched) return telescope.launched
  const planned = telescope.plannedDate
  if (!planned) return null
  const year = planned.match(/\d{4}/)
  if (!year) return null
  const base = Number(year[0])
  if (!/\d{4}s/.test(planned)) return base
  const modifier = planned.match(/early|mid|late/i)
  return base + (modifier ? DECADE_OFFSET[modifier[0].toLowerCase()] : 5)
}

/** Chronological order; instruments with no known date go last. */
export function byStartYear(a: Telescope, b: Telescope): number {
  const yearA = startYear(a)
  const yearB = startYear(b)
  if (yearA === null) return yearB === null ? 0 : 1
  if (yearB === null) return -1
  return yearA - yearB
}

export const STATUS_COLORS: Record<string, string> = {
  operating: 'var(--status-operating)',
  construction: 'var(--status-construction)',
  planned: 'var(--status-planned)',
  retired: 'var(--status-retired)',
}

export const STATUS_LABELS: Record<string, string> = {
  operating: 'Operating',
  construction: 'Under construction',
  planned: 'Planned / study',
  retired: 'Retired',
}
