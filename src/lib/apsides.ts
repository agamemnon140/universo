/**
 * Orbit shape helpers: where a body sits between its nearest and farthest points, when the
 * next extremes fall, and how fast it is moving (vis-viva). Distances in km, speeds in km/s.
 */
import { moonPosition, planetHeliocentric } from './ephemeris'

export const AU_KM = 149_597_870.7
const GM_SUN = 1.32712440018e11 // km³/s²
const GM_EARTH_MOON = 398_600.4418 + 4_902.8
const MOON_RADIUS_KM = 1737.4

export interface Apsis {
  jd: number
  distanceKm: number
}

export interface OrbitState {
  distanceKm: number
  speedKms: number
  minSpeedKms: number
  maxSpeedKms: number
  /** 0 at the nearest point, 1 at the farthest (by distance, not by time) */
  fraction: number
  nextPeri: Apsis
  nextApo: Apsis
  lastPeri: Apsis
  lastApo: Apsis
  semiMajorKm: number
  eccentricity: number
}

/** Golden-section refinement of an extremum of f on [lo, hi]. */
function refineExtremum(f: (t: number) => number, lo: number, hi: number, max: boolean): number {
  const phi = (Math.sqrt(5) - 1) / 2
  let a = lo
  let b = hi
  let c = b - phi * (b - a)
  let d = a + phi * (b - a)
  for (let i = 0; i < 40; i++) {
    const fc = f(c)
    const fd = f(d)
    const keepLeft = max ? fc > fd : fc < fd
    if (keepLeft) {
      b = d
    } else {
      a = c
    }
    c = b - phi * (b - a)
    d = a + phi * (b - a)
  }
  return (a + b) / 2
}

/** Scan forward/backward in `step`-day increments for the next local min (or max) of f. */
function findExtremum(
  f: (t: number) => number,
  jd: number,
  step: number,
  direction: 1 | -1,
  max: boolean,
  horizonDays: number,
): Apsis {
  let prevPrev = f(jd - direction * step)
  let prev = f(jd)
  for (let k = 1; k * step <= horizonDays; k++) {
    const t = jd + direction * k * step
    const cur = f(t)
    const isExt = max ? prev > prevPrev && prev >= cur : prev < prevPrev && prev <= cur
    if (isExt && k > 1) {
      const centre = t - direction * step
      const lo = Math.min(centre - step, centre + step)
      const hi = Math.max(centre - step, centre + step)
      const best = refineExtremum(f, lo, hi, max)
      return { jd: best, distanceKm: f(best) }
    }
    prevPrev = prev
    prev = cur
  }
  const t = jd + direction * horizonDays
  return { jd: t, distanceKm: f(t) }
}

function visViva(gm: number, r: number, a: number): number {
  return Math.sqrt(gm * (2 / r - 1 / a))
}

function state(
  f: (t: number) => number,
  jd: number,
  gm: number,
  step: number,
  horizon: number,
): OrbitState {
  const nextPeri = findExtremum(f, jd, step, 1, false, horizon)
  const nextApo = findExtremum(f, jd, step, 1, true, horizon)
  const lastPeri = findExtremum(f, jd, step, -1, false, horizon)
  const lastApo = findExtremum(f, jd, step, -1, true, horizon)
  // orbit shape from the bracketing apsides
  const peri = (nextPeri.distanceKm + lastPeri.distanceKm) / 2
  const apo = (nextApo.distanceKm + lastApo.distanceKm) / 2
  const a = (peri + apo) / 2
  const e = (apo - peri) / (apo + peri)
  const distanceKm = f(jd)
  return {
    distanceKm,
    speedKms: visViva(gm, distanceKm, a),
    minSpeedKms: visViva(gm, apo, a),
    maxSpeedKms: visViva(gm, peri, a),
    fraction: Math.max(0, Math.min(1, (distanceKm - peri) / (apo - peri))),
    nextPeri,
    nextApo,
    lastPeri,
    lastApo,
    semiMajorKm: a,
    eccentricity: e,
  }
}

/** Earth around the Sun: perihelion ≈ 3 Jan, aphelion ≈ 4 Jul. */
export function earthOrbitState(jd: number): OrbitState {
  return state((t) => planetHeliocentric('earth', t).rAU * AU_KM, jd, GM_SUN, 2, 400)
}

/** Moon around Earth: perigee and apogee every ~27.55 days. */
export function moonOrbitState(jd: number): OrbitState {
  return state((t) => moonPosition(t).distKm, jd, GM_EARTH_MOON, 0.25, 40)
}

/** Apparent diameter of the Moon in arcminutes at a given distance. */
export function moonApparentDiameterArcmin(distKm: number): number {
  return (2 * Math.asin(MOON_RADIUS_KM / distKm) * 180) / Math.PI * 60
}
