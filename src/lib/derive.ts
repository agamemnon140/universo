import type { Body } from '../types'
import { formatNumber, formatPeriodDays, formatRotationHours, formatRatio } from './format'

export interface MetricRow {
  label: string
  a: string
  b: string
  /** "A = n× B" when a ratio is meaningful; undefined for side-by-side-only metrics. */
  ratio?: string
}

function ratioOf(a: number | null, b: number | null): string | undefined {
  if (a === null || b === null || b === 0 || !isFinite(a / b)) return undefined
  return formatRatio(a / b)
}

/** All comparison metrics between two bodies, ratios where meaningful. */
export function compareBodies(a: Body, b: Body): MetricRow[] {
  return [
    {
      label: 'Mass',
      a: `${formatNumber(a.massEarth)} M⊕`,
      b: `${formatNumber(b.massEarth)} M⊕`,
      ratio: ratioOf(a.massEarth, b.massEarth),
    },
    {
      label: 'Volume',
      a: `${formatNumber(a.volumeEarth)} V⊕`,
      b: `${formatNumber(b.volumeEarth)} V⊕`,
      ratio: ratioOf(a.volumeEarth, b.volumeEarth),
    },
    {
      label: 'Radius',
      a: formatNumber(a.radiusKm, 'km'),
      b: formatNumber(b.radiusKm, 'km'),
      ratio: ratioOf(a.radiusKm, b.radiusKm),
    },
    {
      label: 'Surface gravity',
      a: `${formatNumber(a.surfaceGravityG)} g`,
      b: `${formatNumber(b.surfaceGravityG)} g`,
      ratio: ratioOf(a.surfaceGravityG, b.surfaceGravityG),
    },
    {
      label: 'Density',
      a: formatNumber(a.densityGcm3, 'g/cm³'),
      b: formatNumber(b.densityGcm3, 'g/cm³'),
      ratio: ratioOf(a.densityGcm3, b.densityGcm3),
    },
    {
      label: 'Mean temperature',
      a: `${formatNumber(a.meanTempC)} °C`,
      b: `${formatNumber(b.meanTempC)} °C`,
    },
    {
      label: 'Escape velocity',
      a: formatNumber(a.escapeVelocityKms, 'km/s'),
      b: formatNumber(b.escapeVelocityKms, 'km/s'),
      ratio: ratioOf(a.escapeVelocityKms, b.escapeVelocityKms),
    },
    {
      label: 'Orbital period',
      a: formatPeriodDays(a.orbitalPeriodDays),
      b: formatPeriodDays(b.orbitalPeriodDays),
      ratio: ratioOf(a.orbitalPeriodDays, b.orbitalPeriodDays),
    },
    {
      label: 'Rotation period',
      a: formatRotationHours(a.rotationPeriodHours),
      b: formatRotationHours(b.rotationPeriodHours),
    },
    {
      label: 'Orbit distance',
      a: formatNumber(a.orbitDistanceKm, 'km'),
      b: formatNumber(b.orbitDistanceKm, 'km'),
      ratio: ratioOf(a.orbitDistanceKm, b.orbitDistanceKm),
    },
    {
      label: 'Eccentricity',
      a: formatNumber(a.eccentricity),
      b: formatNumber(b.eccentricity),
    },
    {
      label: 'Inclination',
      a: a.inclinationDeg === null ? '—' : `${formatNumber(a.inclinationDeg)}°`,
      b: b.inclinationDeg === null ? '—' : `${formatNumber(b.inclinationDeg)}°`,
    },
    {
      label: 'Roche limit',
      a: formatNumber(a.rocheLimitKm, 'km'),
      b: formatNumber(b.rocheLimitKm, 'km'),
      ratio: ratioOf(a.rocheLimitKm, b.rocheLimitKm),
    },
    {
      label: 'Hill sphere',
      a: formatNumber(a.hillSphereKm, 'km'),
      b: formatNumber(b.hillSphereKm, 'km'),
      ratio: ratioOf(a.hillSphereKm, b.hillSphereKm),
    },
    {
      label: 'Composition',
      a: a.composition,
      b: b.composition,
    },
  ]
}

/** One-line headline for the compare panel: "Jupiter = 317.8× Earth's mass". */
export function compareHeadline(a: Body, b: Body): string | null {
  if (b.massEarth === 0) return null
  return `${a.name} = ${formatRatio(a.massEarth / b.massEarth)} ${b.name}'s mass`
}
