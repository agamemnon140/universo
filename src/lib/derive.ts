import type { Body } from '../types'
import { bodyById } from '../data'
import { formatNumber, formatPeriodDays, formatRotationHours, formatRatio } from './format'

export const EARTH_SURFACE_AREA_KM2 = 4 * Math.PI * 6371 ** 2

/** Surface area of a sphere of the body's mean radius, in km². */
export function surfaceAreaKm2(body: Body): number {
  return 4 * Math.PI * body.radiusKm ** 2
}

/**
 * Solar day (noon to noon) in hours, derived from the sidereal rotation.
 *
 * A body also travels along its orbit while it spins, so it must turn a little
 * further than one full sidereal rotation to point back at the Sun — which is
 * why Earth's 23.93 h sidereal day makes a 24.0 h solar day. Retrograde
 * rotation (negative sidereal period) makes the solar day *shorter*, as on Venus.
 * For a moon the relevant orbit is its planet's orbit around the Sun.
 */
export function solarDayHours(body: Body): number | null {
  const sidereal = body.rotationPeriodHours
  if (sidereal === null || sidereal === 0) return null
  const orbitHost = body.parent === 'sun' || !body.parent ? body : bodyById.get(body.parent)
  const yearDays = orbitHost?.orbitalPeriodDays
  if (!yearDays) return null
  const rate = 1 / sidereal - 1 / (yearDays * 24) // turns per hour, relative to the Sun
  if (rate === 0 || !isFinite(rate)) return null
  return Math.abs(1 / rate)
}

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
      label: 'Surface area',
      a: `${formatNumber(surfaceAreaKm2(a), 'km²')} (${formatNumber(surfaceAreaKm2(a) / EARTH_SURFACE_AREA_KM2)} × Earth)`,
      b: `${formatNumber(surfaceAreaKm2(b), 'km²')} (${formatNumber(surfaceAreaKm2(b) / EARTH_SURFACE_AREA_KM2)} × Earth)`,
      ratio: ratioOf(surfaceAreaKm2(a), surfaceAreaKm2(b)),
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
      label: 'Rotation (sidereal)',
      a: formatRotationHours(a.rotationPeriodHours),
      b: formatRotationHours(b.rotationPeriodHours),
    },
    {
      label: 'Solar day (noon to noon)',
      a: formatRotationHours(solarDayHours(a)),
      b: formatRotationHours(solarDayHours(b)),
      ratio: ratioOf(solarDayHours(a), solarDayHours(b)),
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
      label: 'Surface composition',
      a: a.composition.surface,
      b: b.composition.surface,
    },
    {
      label: 'Core & interior',
      a: a.composition.core,
      b: b.composition.core,
    },
  ]
}

/** One-line headline for the compare panel: "Jupiter = 317.8× Earth's mass". */
export function compareHeadline(a: Body, b: Body): string | null {
  if (b.massEarth === 0) return null
  return `${a.name} = ${formatRatio(a.massEarth / b.massEarth)} ${b.name}'s mass`
}
