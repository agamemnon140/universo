/**
 * How the Moon presents itself: optical libration (the slow nod and wobble that lets us see
 * 59% of the surface over time), the sub-solar point (day and night on the near side), and
 * the 18.6-year nodal cycle that swings the Moon's path across our sky.
 */
import { MOON_ORBIT_INCLINATION_DEG, OBLIQUITY_DEG } from '../data/orbits'
import { moonPosition, sunPosition, wrap180, wrap360 } from './ephemeris'

const DEG = Math.PI / 180
const RAD = 180 / Math.PI
/** Inclination of the Moon's equator to the ecliptic (Cassini). */
const MOON_EQUATOR_TILT_DEG = 1.54242
/** Regression rate of the lunar nodes, degrees per day (one lap in 18.61 years). */
const NODE_RATE_DEG_PER_DAY = 0.0529538083

/** Tranquility Base — a familiar near-side landmark for local time. */
export const APOLLO_11 = { name: 'Apollo 11', lat: 0.67, lon: 23.47 }

export interface Libration {
  lonDeg: number // + : we see farther around the eastern limb (Mare Crisium side)
  latDeg: number // + : we see over the north pole
}

/** Optical libration (Meeus ch. 53, without the tiny physical term). */
export function libration(jd: number): Libration {
  const m = moonPosition(jd)
  const I = MOON_EQUATOR_TILT_DEG * DEG
  const W = (m.lonDeg - m.nodeLonDeg) * DEG
  const beta = m.latDeg * DEG
  const A = Math.atan2(
    Math.sin(W) * Math.cos(beta) * Math.cos(I) - Math.sin(beta) * Math.sin(I),
    Math.cos(W) * Math.cos(beta),
  )
  const lonDeg = wrap180(A * RAD - m.meanArgLatDeg)
  const latDeg = Math.asin(-Math.sin(W) * Math.cos(beta) * Math.sin(I) - Math.sin(beta) * Math.cos(I)) * RAD
  return { lonDeg, latDeg }
}

export interface LunarDay {
  /** Selenographic longitude of the point under the Sun, east positive. */
  subsolarLonDeg: number
  /** Local solar time at a given near-side longitude, hours 0–24 (12 = noon). */
  localHours: (lonDeg: number) => number
  /** Fraction of the 29.53-day lunar day elapsed at a given longitude. */
  dayFraction: (lonDeg: number) => number
}

/**
 * Day and night on the Moon follow the phase: at new Moon the near side's centre is at
 * midnight, at full Moon at noon. The Sun rises on the eastern limb first.
 */
export function lunarDay(jd: number): LunarDay {
  const elongation = wrap360(moonPosition(jd).lonDeg - sunPosition(jd).lonDeg)
  const subsolarLonDeg = wrap180(180 - elongation)
  const localHours = (lonDeg: number) => wrap360(((lonDeg - subsolarLonDeg) / 15 + 12) * 15) / 15
  return {
    subsolarLonDeg,
    localHours,
    dayFraction: (lonDeg) => wrap360(lonDeg - subsolarLonDeg + 90) / 360,
  }
}

export interface NodalCycle {
  nodeLonDeg: number
  /** Inclination of the Moon's path to Earth's equator right now (18.3°–28.6°). */
  pathTiltDeg: number
  /** 0 = major standstill (widest swing), 1 = minor standstill (narrowest). */
  fraction: number
  nextMajor: { jd: number; yearsAway: number }
  nextMinor: { jd: number; yearsAway: number }
  lastMajor: { jd: number }
}

/** The 18.6-year cycle: as the nodes regress, the Moon's monthly swing across the sky changes. */
export function nodalCycle(jd: number): NodalCycle {
  const N = moonPosition(jd).nodeLonDeg
  const eps = OBLIQUITY_DEG * DEG
  const i = MOON_ORBIT_INCLINATION_DEG * DEG
  const cosTilt = Math.cos(eps) * Math.cos(i) - Math.sin(eps) * Math.sin(i) * Math.cos(N * DEG)
  const pathTiltDeg = Math.acos(cosTilt) * RAD
  const daysToMajor = wrap360(N) / NODE_RATE_DEG_PER_DAY // N counts down to 0
  const daysToMinor = wrap360(N - 180) / NODE_RATE_DEG_PER_DAY
  const daysSinceMajor = wrap360(-N) / NODE_RATE_DEG_PER_DAY
  const tiltMin = OBLIQUITY_DEG - MOON_ORBIT_INCLINATION_DEG
  const tiltMax = OBLIQUITY_DEG + MOON_ORBIT_INCLINATION_DEG
  return {
    nodeLonDeg: N,
    pathTiltDeg,
    fraction: (tiltMax - pathTiltDeg) / (tiltMax - tiltMin),
    nextMajor: { jd: jd + daysToMajor, yearsAway: daysToMajor / 365.25 },
    nextMinor: { jd: jd + daysToMinor, yearsAway: daysToMinor / 365.25 },
    lastMajor: { jd: jd - daysSinceMajor },
  }
}
