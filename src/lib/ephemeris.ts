/**
 * Low-precision ephemeris for the Positions tab — pure functions, no React.
 *
 * Planets: Keplerian elements from JPL (src/data/orbits.ts), good to ~1° between 1800 and
 * 2050. Moon and Sun: Paul Schlyter's formulae (stjarnhimlen.se/comp/ppcomp.html) — mean
 * elements plus the main lunar perturbations, good to ~2 arcminutes in longitude.
 * All longitudes are ecliptic, referred to the equinox of date, in degrees — the JPL
 * elements (J2000) are precessed so the Sun, Moon and planets share one reference.
 */
import {
  MOON_ORBIT_INCLINATION_DEG,
  OBLIQUITY_DEG,
  PLANET_ORBITS,
  SYNODIC_MONTH_DAYS,
  type OrbitalElements,
} from '../data/orbits'

const DEG = Math.PI / 180
const RAD = 180 / Math.PI
const EARTH_RADIUS_KM = 6378.14
const J2000_JD = 2451545
/** General precession in ecliptic longitude, degrees per Julian century. */
const PRECESSION_DEG_PER_CENTURY = 1.396971

/** Wrap an angle in degrees into [0, 360). */
export function wrap360(deg: number): number {
  const w = deg % 360
  return w < 0 ? w + 360 : w
}

/** Wrap an angle in degrees into (-180, 180]. */
export function wrap180(deg: number): number {
  const w = wrap360(deg)
  return w > 180 ? w - 360 : w
}

// ---------- Time ----------

/** Julian Day for a JS Date (UTC). */
export function julianDay(date: Date): number {
  return date.getTime() / 86_400_000 + 2440587.5
}

export function dateFromJulianDay(jd: number): Date {
  return new Date((jd - 2440587.5) * 86_400_000)
}

/** Julian centuries since J2000 (the planets' time argument). */
export function centuriesJ2000(jd: number): number {
  return (jd - J2000_JD) / 36525
}

/** Days since 2000-01-00 00:00 UT (Schlyter's time argument for Sun and Moon). */
export function daysJ2000(jd: number): number {
  return jd - 2451543.5
}

// ---------- Kepler ----------

/** Solve Kepler's equation for the eccentric anomaly (degrees in, degrees out). */
function eccentricAnomaly(meanAnomalyDeg: number, e: number): number {
  const M = meanAnomalyDeg * DEG
  let E = M + e * Math.sin(M) * (1 + e * Math.cos(M))
  for (let k = 0; k < 20; k++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E))
    E -= dE
    if (Math.abs(dE) < 1e-8) break
  }
  return E * RAD
}

export interface EclipticVector {
  x: number // toward the vernal equinox ♈
  y: number // 90° along the ecliptic
  z: number // toward the ecliptic north pole
}

/** Heliocentric ecliptic position from Keplerian elements (AU). */
function positionFromElements(el: OrbitalElements): EclipticVector {
  const omega = el.longPeri - el.longNode // argument of perihelion
  const M = wrap180(el.L - el.longPeri)
  const E = eccentricAnomaly(M, el.e) * DEG
  const xp = el.a * (Math.cos(E) - el.e)
  const yp = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E)
  const cw = Math.cos(omega * DEG)
  const sw = Math.sin(omega * DEG)
  const cO = Math.cos(el.longNode * DEG)
  const sO = Math.sin(el.longNode * DEG)
  const ci = Math.cos(el.i * DEG)
  const si = Math.sin(el.i * DEG)
  return {
    x: (cw * cO - sw * sO * ci) * xp + (-sw * cO - cw * sO * ci) * yp,
    y: (cw * sO + sw * cO * ci) * xp + (-sw * sO + cw * cO * ci) * yp,
    z: sw * si * xp + cw * si * yp,
  }
}

function elementsAt(id: string, jd: number): OrbitalElements {
  const orbit = PLANET_ORBITS.find((p) => p.id === id)
  if (!orbit) throw new Error(`No orbital elements for ${id}`)
  const T = centuriesJ2000(jd)
  const { j2000: b, rate: r } = orbit
  const p = PRECESSION_DEG_PER_CENTURY * T // J2000 → equinox of date
  return {
    a: b.a + r.a * T,
    e: b.e + r.e * T,
    i: b.i + r.i * T,
    L: b.L + r.L * T + p,
    longPeri: b.longPeri + r.longPeri * T + p,
    longNode: b.longNode + r.longNode * T + p,
  }
}

export interface HeliocentricPosition extends EclipticVector {
  lonDeg: number // heliocentric ecliptic longitude
  latDeg: number
  rAU: number // distance from the Sun
}

function spherical(v: EclipticVector): { lonDeg: number; latDeg: number; rAU: number } {
  return {
    lonDeg: wrap360(Math.atan2(v.y, v.x) * RAD),
    latDeg: Math.atan2(v.z, Math.hypot(v.x, v.y)) * RAD,
    rAU: Math.hypot(v.x, v.y, v.z),
  }
}

export interface OrbitShape {
  aAU: number
  e: number
  periAU: number // closest approach to the Sun
  apoAU: number // farthest point
  periLonDeg: number
}

/** Size and shape of a planet's orbit on a date. */
export function planetOrbitShape(id: string, jd: number): OrbitShape {
  const el = elementsAt(id, jd)
  return { aAU: el.a, e: el.e, periAU: el.a * (1 - el.e), apoAU: el.a * (1 + el.e), periLonDeg: wrap360(el.longPeri) }
}

/** Ecliptic longitude of a planet's perihelion (equinox of date). */
export function planetPerihelionLongitude(id: string, jd: number): number {
  return wrap360(elementsAt(id, jd).longPeri)
}

export function planetHeliocentric(id: string, jd: number): HeliocentricPosition {
  const v = positionFromElements(elementsAt(id, jd))
  return { ...v, ...spherical(v) }
}

/**
 * Sample a planet's orbit as heliocentric points (AU) for drawing — same elements as the
 * position, so the dot always sits on its own curve.
 */
export function planetOrbitPath(id: string, jd: number, steps = 72): EclipticVector[] {
  const el = elementsAt(id, jd)
  const points: EclipticVector[] = []
  for (let k = 0; k < steps; k++) {
    const M = (k / steps) * 360
    points.push(positionFromElements({ ...el, L: el.longPeri + M }))
  }
  return points
}

// ---------- Geocentric view of the planets ----------

export type SkySide = 'east' | 'west'

export interface GeocentricPosition {
  lonDeg: number // geocentric ecliptic longitude
  distAU: number // distance from Earth
  elongationDeg: number // angle from the Sun as seen from Earth, 0–180
  /** east = trails the Sun, evening sky; west = leads the Sun, morning sky */
  side: SkySide
}

export function planetGeocentric(id: string, jd: number): GeocentricPosition {
  const earth = planetHeliocentric('earth', jd)
  const target = id === 'sun' ? { x: 0, y: 0, z: 0 } : planetHeliocentric(id, jd)
  const rel = { x: target.x - earth.x, y: target.y - earth.y, z: target.z - earth.z }
  const sunDir = { x: -earth.x, y: -earth.y, z: -earth.z }
  const dist = Math.hypot(rel.x, rel.y, rel.z)
  const sunDist = Math.hypot(sunDir.x, sunDir.y, sunDir.z)
  const cosE =
    dist === 0 ? 1 : (rel.x * sunDir.x + rel.y * sunDir.y + rel.z * sunDir.z) / (dist * sunDist)
  const lonDeg = wrap360(Math.atan2(rel.y, rel.x) * RAD)
  const sunLon = wrap360(Math.atan2(sunDir.y, sunDir.x) * RAD)
  return {
    lonDeg,
    distAU: dist,
    elongationDeg: Math.acos(Math.max(-1, Math.min(1, cosE))) * RAD,
    side: wrap180(lonDeg - sunLon) >= 0 ? 'east' : 'west',
  }
}

/** Where a planet is in its synodic cycle, for a one-line visibility hint. */
export function visibilityHint(id: string, geo: GeocentricPosition): string {
  const e = geo.elongationDeg
  const inner = id === 'mercury' || id === 'venus'
  if (e < 10) return inner ? 'near conjunction — lost in the glare' : 'near conjunction — behind the Sun'
  if (!inner && e > 165) return 'near opposition — up all night, closest to Earth'
  if (inner && e > 40) return geo.side === 'east' ? 'evening star, after sunset' : 'morning star, before sunrise'
  return geo.side === 'east' ? 'evening sky, sets after the Sun' : 'morning sky, rises before the Sun'
}

// ---------- Sun (apparent, geocentric) ----------

export interface SunPosition {
  lonDeg: number // apparent ecliptic longitude λ☉ (0 = March equinox)
  meanLonDeg: number // mean longitude, used by the lunar perturbation terms
  declinationDeg: number // latitude where the Sun is overhead at noon
}

export function sunPosition(jd: number): SunPosition {
  const d = daysJ2000(jd)
  const w = 282.9404 + 4.70935e-5 * d
  const e = 0.016709 - 1.151e-9 * d
  const M = wrap360(356.047 + 0.9856002585 * d)
  const E = eccentricAnomaly(M, e) * DEG
  const xv = Math.cos(E) - e
  const yv = Math.sqrt(1 - e * e) * Math.sin(E)
  const v = Math.atan2(yv, xv) * RAD
  const lonDeg = wrap360(v + w)
  const declinationDeg =
    Math.asin(Math.sin(OBLIQUITY_DEG * DEG) * Math.sin(lonDeg * DEG)) * RAD
  return { lonDeg, meanLonDeg: wrap360(w + M), declinationDeg }
}

// ---------- Moon ----------

export interface MoonPosition {
  lonDeg: number // geocentric ecliptic longitude
  latDeg: number // ecliptic latitude, ±5.1°: height above/below the Sun–Earth plane
  distKm: number
  nodeLonDeg: number // longitude of the ascending node ☊
  /** Angle travelled from the ascending node (0 = crossing upward, 180 = crossing downward). */
  argLatDeg: number
  meanArgLatDeg: number // mean argument of latitude F, used by the libration formulae
  meanAnomalyDeg: number // mean anomaly M
  perigeeLonDeg: number // longitude of perigee (N + w): where the orbit's near point currently is
  ascending: boolean // latitude currently increasing
}

export function moonPosition(jd: number): MoonPosition {
  const d = daysJ2000(jd)
  const N = wrap360(125.1228 - 0.0529538083 * d)
  const i = MOON_ORBIT_INCLINATION_DEG
  const w = wrap360(318.0634 + 0.1643573223 * d)
  const a = 60.2666 // Earth radii
  const e = 0.0549
  const M = wrap360(115.3654 + 13.0649929509 * d)

  const E = eccentricAnomaly(M, e) * DEG
  const xv = a * (Math.cos(E) - e)
  const yv = a * Math.sqrt(1 - e * e) * Math.sin(E)
  const v = Math.atan2(yv, xv) * RAD
  const r = Math.hypot(xv, yv)

  const u = (v + w) * DEG // argument of latitude
  const cN = Math.cos(N * DEG)
  const sN = Math.sin(N * DEG)
  const ci = Math.cos(i * DEG)
  const xe = r * (cN * Math.cos(u) - sN * Math.sin(u) * ci)
  const ye = r * (sN * Math.cos(u) + cN * Math.sin(u) * ci)
  const ze = r * Math.sin(u) * Math.sin(i * DEG)
  let lon = Math.atan2(ye, xe) * RAD
  let lat = Math.atan2(ze, Math.hypot(xe, ye)) * RAD
  let dist = r

  // Perturbations (Schlyter): arguments in degrees
  const sun = sunPosition(jd)
  const Ms = wrap360(356.047 + 0.9856002585 * d)
  const Lm = N + w + M // mean longitude of the Moon
  const D = Lm - sun.meanLonDeg // mean elongation
  const F = Lm - N // mean argument of latitude
  const s = (x: number) => Math.sin(x * DEG)
  const c = (x: number) => Math.cos(x * DEG)
  lon +=
    -1.274 * s(M - 2 * D) +
    0.658 * s(2 * D) -
    0.186 * s(Ms) -
    0.059 * s(2 * M - 2 * D) -
    0.057 * s(M - 2 * D + Ms) +
    0.053 * s(M + 2 * D) +
    0.046 * s(2 * D - Ms) +
    0.041 * s(M - Ms) -
    0.035 * s(D) -
    0.031 * s(M + Ms) -
    0.015 * s(2 * F - 2 * D) +
    0.011 * s(M - 4 * D)
  lat +=
    -0.173 * s(F - 2 * D) -
    0.055 * s(M - F - 2 * D) -
    0.046 * s(M + F - 2 * D) +
    0.033 * s(F + 2 * D) +
    0.017 * s(2 * M + F)
  dist += -0.58 * c(M - 2 * D) - 0.46 * c(2 * D)

  const lonDeg = wrap360(lon)
  const argLatDeg = wrap360(lonDeg - N)
  return {
    lonDeg,
    latDeg: lat,
    distKm: dist * EARTH_RADIUS_KM,
    nodeLonDeg: N,
    argLatDeg,
    meanArgLatDeg: wrap360(F),
    meanAnomalyDeg: M,
    perigeeLonDeg: wrap360(N + w),
    ascending: Math.cos(argLatDeg * DEG) > 0,
  }
}

// ---------- Moon phase ----------

export const PHASE_NAMES = [
  'New Moon',
  'Waxing crescent',
  'First quarter',
  'Waxing gibbous',
  'Full Moon',
  'Waning gibbous',
  'Last quarter',
  'Waning crescent',
] as const

export type PhaseName = (typeof PHASE_NAMES)[number]

export interface MoonPhase {
  elongationDeg: number // Moon longitude − Sun longitude, 0 = new, 180 = full
  illuminated: number // 0..1 fraction of the disc lit
  ageDays: number // days since new Moon
  waxing: boolean
  name: PhaseName
}

export function moonPhase(jd: number): MoonPhase {
  const elongationDeg = wrap360(moonPosition(jd).lonDeg - sunPosition(jd).lonDeg)
  const illuminated = (1 - Math.cos(elongationDeg * DEG)) / 2
  const ageDays = (elongationDeg / 360) * SYNODIC_MONTH_DAYS
  const name = PHASE_NAMES[Math.round(elongationDeg / 45) % 8]
  return { elongationDeg, illuminated, ageDays, waxing: elongationDeg < 180, name }
}

export type PrincipalPhase = 'New Moon' | 'First quarter' | 'Full Moon' | 'Last quarter'

export interface UpcomingPhase {
  name: PrincipalPhase
  jd: number
}

const PRINCIPAL: PrincipalPhase[] = ['New Moon', 'First quarter', 'Full Moon', 'Last quarter']

/** The next four principal phases after `jd`: hourly scan, then bisection on each crossing. */
export function nextPhases(jd: number): UpcomingPhase[] {
  const elongAt = (t: number) => wrap360(moonPosition(t).lonDeg - sunPosition(t).lonDeg)
  const out: UpcomingPhase[] = []
  const step = 1 / 24
  let prevT = jd
  let prev = elongAt(jd)
  for (let t = jd + step; t <= jd + 31 && out.length < 4; t += step) {
    const cur = elongAt(t)
    for (let k = 0; k < 4; k++) {
      const target = k * 90
      const a = wrap180(prev - target)
      const b = wrap180(cur - target)
      if (a < 0 && b >= 0 && Math.abs(a) < 45 && Math.abs(b) < 45) {
        let lo = prevT
        let hi = t
        for (let it = 0; it < 25; it++) {
          const mid = (lo + hi) / 2
          if (wrap180(elongAt(mid) - target) < 0) lo = mid
          else hi = mid
        }
        out.push({ name: PRINCIPAL[k], jd: (lo + hi) / 2 })
      }
    }
    prev = cur
    prevT = t
  }
  return out
}

// ---------- Seasons ----------

export interface SeasonInfo {
  sunLonDeg: number
  declinationDeg: number
  /** the coming equinox or solstice */
  next: { name: string; jd: number; daysAway: number }
  /** the most recent one, i.e. the start of the current season */
  current: { name: string; jd: number }
  northTiltedToSun: boolean
}

export const SEASON_MARKS = [
  { lon: 0, name: 'March equinox' },
  { lon: 90, name: 'June solstice' },
  { lon: 180, name: 'September equinox' },
  { lon: 270, name: 'December solstice' },
] as const

/** Instant when the Sun's longitude crosses `target`, next after `jd` or last before it. */
function sunLongitudeCrossing(jd: number, target: number, backward: boolean): number {
  const lon = sunPosition(jd).lonDeg
  const delta = backward ? wrap360(lon - target) : wrap360(target - lon)
  const guess = jd + (backward ? -delta : delta) / 0.9856
  let lo = guess - 3
  let hi = guess + 3
  for (let it = 0; it < 30; it++) {
    const mid = (lo + hi) / 2
    if (wrap180(sunPosition(mid).lonDeg - target) < 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export function seasonInfo(jd: number): SeasonInfo {
  const sun = sunPosition(jd)
  const idx = Math.floor(sun.lonDeg / 90)
  const currentMark = SEASON_MARKS[idx]
  const nextMark = SEASON_MARKS[(idx + 1) % 4]
  const nextJd = sunLongitudeCrossing(jd, nextMark.lon, false)
  const currentJd = sunLongitudeCrossing(jd, currentMark.lon, true)
  return {
    sunLonDeg: sun.lonDeg,
    declinationDeg: sun.declinationDeg,
    next: { name: nextMark.name, jd: nextJd, daysAway: nextJd - jd },
    current: { name: currentMark.name, jd: currentJd },
    northTiltedToSun: sun.declinationDeg > 0,
  }
}
