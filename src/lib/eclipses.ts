/**
 * Eclipse search and classification, built on the low-precision ephemeris.
 *
 * A syzygy (new or full Moon) becomes an eclipse when the Moon is close enough to the
 * ecliptic. The geometry follows Meeus, *Astronomical Algorithms* ch. 54, with the umbral
 * and penumbral radii computed from the actual Sun and Moon distances. Class boundaries
 * (total / annular / partial, total / partial / penumbral) are right except in borderline
 * cases, which are flagged; where on Earth an eclipse is visible is out of scope.
 */
import { moonPosition, planetHeliocentric, sunPosition, wrap180, wrap360 } from './ephemeris'

const DEG = Math.PI / 180
const EARTH_RADIUS_KM = 6378.14
const MOON_RADIUS_KM = 1737.4
const SUN_RADIUS_KM = 695_700
const AU_KM = 149_597_870.7
/** Earth's shadow is ~2% wider than geometry says, thanks to the atmosphere (Danjon). */
const SHADOW_ENLARGEMENT = 1.02

export type SyzygyKind = 'new' | 'full'

export interface Syzygy {
  kind: SyzygyKind
  jd: number
  moonLatDeg: number // ecliptic latitude at the exact syzygy
  moonDistKm: number
  sunDistKm: number
}

export type EclipseKind = 'solar' | 'lunar'
export type EclipseClass = 'total' | 'annular' | 'hybrid' | 'partial' | 'penumbral'

export interface Eclipse {
  kind: EclipseKind
  cls: EclipseClass
  jd: number
  /** Distance of the shadow axis from the centre of the target, in Earth radii (signed: + north). */
  gamma: number
  moonLatDeg: number
  magnitude: number // fraction of the Sun's diameter covered / of the Moon's diameter in the umbra
  borderline: boolean // within a hair of a class boundary — the class may be off
  /** Shadow radii at the relevant distance, Earth radii (for drawing). */
  umbraRadius: number
  penumbraRadius: number
  moonRadius: number // in Earth radii, for lunar; for solar the Moon's disc vs the Sun's
}

function elongationAt(jd: number): number {
  return wrap360(moonPosition(jd).lonDeg - sunPosition(jd).lonDeg)
}

/** Refine a syzygy inside [lo, hi] where the elongation crosses `target` (0 or 180). */
function refine(lo: number, hi: number, target: number): number {
  for (let it = 0; it < 30; it++) {
    const mid = (lo + hi) / 2
    if (wrap180(elongationAt(mid) - target) < 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

function syzygyAt(jd: number, kind: SyzygyKind): Syzygy {
  const moon = moonPosition(jd)
  const earth = planetHeliocentric('earth', jd)
  return { kind, jd, moonLatDeg: moon.latDeg, moonDistKm: moon.distKm, sunDistKm: earth.rAU * AU_KM }
}

const STEP = 0.25 // 6 h: the elongation moves ~3°, so no crossing can be missed

/** The next (direction +1) or previous (−1) new or full Moon after `jd`. */
export function findSyzygy(jd: number, direction: 1 | -1 = 1, kind?: SyzygyKind): Syzygy {
  const all: { t: number; kind: SyzygyKind }[] = [
    { t: 0, kind: 'new' },
    { t: 180, kind: 'full' },
  ]
  const targets = all.filter((x) => !kind || x.kind === kind)
  let prevT = jd
  let prev = elongationAt(jd)
  for (let k = 1; k < 4 * 40; k++) {
    const t = jd + direction * k * STEP
    const cur = elongationAt(t)
    for (const { t: target, kind: kk } of targets) {
      const a = wrap180(prev - target)
      const b = wrap180(cur - target)
      const crossed = direction === 1 ? a < 0 && b >= 0 : a >= 0 && b < 0
      if (crossed && Math.abs(a) < 45 && Math.abs(b) < 45) {
        const lo = direction === 1 ? prevT : t
        const hi = direction === 1 ? t : prevT
        return syzygyAt(refine(lo, hi, target), kk)
      }
    }
    prev = cur
    prevT = t
  }
  throw new Error('no syzygy found within 40 days')
}

/** Every new and full Moon between two Julian days, in order. */
export function syzygiesBetween(jd0: number, jd1: number): Syzygy[] {
  const out: Syzygy[] = []
  let prevT = jd0
  let prev = elongationAt(jd0)
  for (let t = jd0 + STEP; t <= jd1; t += STEP) {
    const cur = elongationAt(t)
    for (const [target, kind] of [
      [0, 'new'],
      [180, 'full'],
    ] as const) {
      const a = wrap180(prev - target)
      const b = wrap180(cur - target)
      if (a < 0 && b >= 0 && Math.abs(a) < 45 && Math.abs(b) < 45) {
        out.push(syzygyAt(refine(prevT, t, target), kind))
      }
    }
    prev = cur
    prevT = t
  }
  return out
}

/** Shadow geometry for a syzygy, in Earth radii. */
export function shadowGeometry(s: Syzygy) {
  const dm = s.moonDistKm
  const ds = s.sunDistKm
  if (s.kind === 'new') {
    // Moon's shadow cones measured on the fundamental plane through Earth's centre
    const umbraKm = MOON_RADIUS_KM - (dm * (SUN_RADIUS_KM - MOON_RADIUS_KM)) / (ds - dm)
    const penumbraKm = MOON_RADIUS_KM + (dm * (SUN_RADIUS_KM + MOON_RADIUS_KM)) / (ds - dm)
    // shadow axis offset: the Moon's latitude, scaled to Earth's distance
    const gamma = ((dm * Math.sin(s.moonLatDeg * DEG)) / EARTH_RADIUS_KM) * (1 - dm / ds)
    return {
      gamma,
      umbraRadius: umbraKm / EARTH_RADIUS_KM, // negative = umbral cone ends before Earth (annular)
      penumbraRadius: penumbraKm / EARTH_RADIUS_KM,
      moonRadius: MOON_RADIUS_KM / EARTH_RADIUS_KM,
    }
  }
  // Earth's shadow at the Moon's distance
  const umbraKm = (EARTH_RADIUS_KM - (dm * (SUN_RADIUS_KM - EARTH_RADIUS_KM)) / ds) * SHADOW_ENLARGEMENT
  const penumbraKm = (EARTH_RADIUS_KM + (dm * (SUN_RADIUS_KM + EARTH_RADIUS_KM)) / ds) * SHADOW_ENLARGEMENT
  const gamma = (dm * Math.sin(s.moonLatDeg * DEG)) / EARTH_RADIUS_KM
  return {
    gamma,
    umbraRadius: umbraKm / EARTH_RADIUS_KM,
    penumbraRadius: penumbraKm / EARTH_RADIUS_KM,
    moonRadius: MOON_RADIUS_KM / EARTH_RADIUS_KM,
  }
}

const BORDER = 0.03 // Earth radii — roughly the model's uncertainty in gamma

/** Classify a syzygy; null when the shadows miss. */
export function classify(s: Syzygy): Eclipse | null {
  const g = shadowGeometry(s)
  const ag = Math.abs(g.gamma)
  const near = (threshold: number) => Math.abs(ag - threshold) < BORDER
  const base = { jd: s.jd, moonLatDeg: s.moonLatDeg, ...g }

  if (s.kind === 'new') {
    // Meeus: the axis meets Earth's surface for |γ| < 0.9972; partial phases reach out to 1 + penumbra
    const partialLimit = 1 + g.penumbraRadius
    if (ag >= partialLimit) return null
    // umbra radius is signed: u > 0 means the umbral cone still has width at Earth → total;
    // u < 0 means its tip fell short of Earth → annular (Meeus uses the opposite sign)
    const u = g.umbraRadius
    const omega = 0.00464 * Math.sqrt(Math.max(0, 1 - g.gamma * g.gamma))
    let cls: EclipseClass
    if (ag < 0.9972) cls = u > omega ? 'total' : u < -omega ? 'annular' : 'hybrid'
    else cls = 'partial'
    // Meeus 54.2: greatest magnitude of a partial solar eclipse
    const magnitude =
      cls === 'partial'
        ? Math.max(0, Math.min(1, (1.5433 - u - ag) / (0.5461 - 2 * u)))
        : cls === 'annular'
          ? 0.99 // the Moon covers nearly all of the Sun, ring left over
          : 1
    return {
      kind: 'solar',
      cls,
      magnitude,
      borderline: near(partialLimit) || near(0.9972) || (ag < 0.9972 && Math.abs(u) < 2 * omega),
      ...base,
    }
  }

  // full Moon: how deep the Moon's disc dips into Earth's shadow
  const m = g.moonRadius
  if (ag >= g.penumbraRadius + m) return null
  let cls: EclipseClass
  if (ag < g.umbraRadius - m) cls = 'total'
  else if (ag < g.umbraRadius + m) cls = 'partial'
  else cls = 'penumbral'
  const magnitude =
    cls === 'penumbral'
      ? (g.penumbraRadius + m - ag) / (2 * m)
      : Math.min(1.9, (g.umbraRadius + m - ag) / (2 * m))
  return {
    kind: 'lunar',
    cls,
    magnitude,
    borderline: near(g.penumbraRadius + m) || near(g.umbraRadius + m) || near(g.umbraRadius - m),
    ...base,
  }
}

/** Next (or previous) eclipse strictly after (before) `jd`. */
export function nextEclipse(jd: number, direction: 1 | -1 = 1): Eclipse {
  let t = jd
  for (let k = 0; k < 20; k++) {
    const s = findSyzygy(t, direction)
    const e = classify(s)
    if (e) return e
    t = s.jd + direction * 0.5
  }
  throw new Error('no eclipse found')
}

/** All eclipses between two Julian days. Ten years take a few tens of milliseconds. */
export function eclipsesBetween(jd0: number, jd1: number): Eclipse[] {
  return syzygiesBetween(jd0, jd1)
    .map(classify)
    .filter((e): e is Eclipse => e !== null)
}

/** Half-width of the window around each node inside which a syzygy can be an eclipse. */
export const ECLIPSE_WINDOW_DEG = 17
/** Inside this the eclipse is central (solar) or at least partial (lunar), practically always. */
export const ECLIPSE_CORE_DEG = 10

/** Where the Sun sits relative to the nodes: 0 = on a node, up to 90. */
export function sunFromNodeDeg(jd: number): number {
  const sun = sunPosition(jd)
  const n = moonPosition(jd).nodeLonDeg
  return Math.min(Math.abs(wrap180(sun.lonDeg - n)), Math.abs(wrap180(sun.lonDeg - n - 180)))
}

export function eclipseLabel(e: Eclipse): string {
  return `${e.cls} ${e.kind} eclipse`
}
