/** Format a ratio like 317.8×, 0.012×, or 3.2e-5× for extreme values. */
export function formatRatio(value: number): string {
  if (!isFinite(value)) return '—'
  if (value >= 10000 || (value > 0 && value < 0.001)) {
    return `${value.toExponential(1).replace('e+', 'e')}×`
  }
  if (value >= 1000) return `${Math.round(value).toLocaleString('en-US')}×`
  if (value >= 10) return `${value.toFixed(1)}×`
  if (value >= 1) return `${value.toFixed(2)}×`
  return `${value.toPrecision(2)}×`
}

/** Format a number with thousands separators, trimming needless decimals. */
export function formatNumber(value: number | null | undefined, unit = ''): string {
  if (value === null || value === undefined || !isFinite(value)) return '—'
  const abs = Math.abs(value)
  let text: string
  if (abs !== 0 && (abs >= 1e7 || abs < 0.001)) {
    text = value.toExponential(2).replace('e+', 'e')
  } else if (abs >= 1000) {
    text = value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  } else if (abs >= 1) {
    text = value.toLocaleString('en-US', { maximumFractionDigits: 2 })
  } else {
    text = value.toPrecision(3)
  }
  return unit ? `${text} ${unit}` : text
}

/** Earth–Sun distance, the astronomical unit, in km. */
export const AU_KM = 149_597_870.7
/** Earth–Moon distance ("lunar distance"), in km — the yardstick for moon orbits. */
export const LUNAR_DISTANCE_KM = 384_400

/**
 * Kilometres → lunar distances: "0.02 LD" for the innermost moons, "33.7 LD"
 * for the outermost. Two decimals below 1 LD keeps Phobos legible; one above,
 * since the extra digit says nothing at that range.
 */
export function formatLunarDistance(km: number): string {
  const ld = km / LUNAR_DISTANCE_KM
  return `${ld < 1 ? ld.toFixed(2) : ld.toFixed(1)} LD`
}

/** Days → human span: "365.3 days" / "11.9 years". */
export function formatPeriodDays(days: number | null): string {
  if (days === null || !isFinite(days)) return '—'
  if (days >= 1000) return `${(days / 365.25).toFixed(1)} years (${formatNumber(days)} days)`
  return `${formatNumber(days)} days`
}

/** Hours → "23.9 h" / "243.0 days (retrograde)". */
export function formatRotationHours(hours: number | null): string {
  if (hours === null || !isFinite(hours)) return '—'
  const abs = Math.abs(hours)
  const retro = hours < 0 ? ' (retrograde)' : ''
  if (abs >= 96) return `${(abs / 24).toFixed(1)} days${retro}`
  return `${abs.toFixed(1)} h${retro}`
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
