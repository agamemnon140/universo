/**
 * Sky position → top-down galactic-plane map coordinates.
 * RA/Dec (J2000, degrees) → galactic longitude l → planar (x, y) with the Sun
 * at the origin. Galactic latitude is ignored (top-down projection).
 */

const DEG = Math.PI / 180

// J2000 north galactic pole and galactic center direction
const NGP_RA = 192.85948 * DEG
const NGP_DEC = 27.12825 * DEG
const L_NCP = 122.93192 * DEG // galactic longitude of the north celestial pole

export function galacticLongitude(raDeg: number, decDeg: number): number {
  const ra = raDeg * DEG
  const dec = decDeg * DEG
  const y = Math.cos(dec) * Math.sin(ra - NGP_RA)
  const x =
    Math.cos(NGP_DEC) * Math.sin(dec) -
    Math.sin(NGP_DEC) * Math.cos(dec) * Math.cos(ra - NGP_RA)
  let l = L_NCP - Math.atan2(y, x)
  if (l < 0) l += 2 * Math.PI
  return l // radians
}

export interface MapPoint {
  x: number // toward galactic center = +x
  y: number // direction of galactic rotation = +y
}

/**
 * Project onto the galactic plane at true distance (light-years).
 * Callers apply their own radial scaling (e.g. log) before rendering.
 */
export function projectToPlane(raDeg: number, decDeg: number, distanceLy: number): MapPoint {
  const l = galacticLongitude(raDeg, decDeg)
  return { x: distanceLy * Math.cos(l), y: distanceLy * Math.sin(l) }
}

/**
 * Log radial scale: distance → fraction 0..1 of the map radius.
 * Keeps sub-ly separation visible while fitting the zoom level's max distance.
 */
export function logRadial(distanceLy: number, maxLy: number): number {
  const minLy = 1 // inner 1 ly collapses to center
  if (distanceLy <= minLy) return 0.04
  const f = Math.log10(distanceLy / minLy) / Math.log10(maxLy / minLy)
  return Math.min(1, 0.04 + f * 0.96)
}
