/** Earth's spin axis and the Sun's direction, in ecliptic coordinates (x → ♈, z → north). */
import { OBLIQUITY_DEG } from '../data/orbits'
import type { Vec3 } from './vec3'

const DEG = Math.PI / 180

/** Earth's spin axis: leaning 23.4° toward ecliptic longitude 90° (fixed in space, ignoring precession). */
export const EARTH_AXIS: Vec3 = [Math.sin(OBLIQUITY_DEG * DEG), 0, Math.cos(OBLIQUITY_DEG * DEG)]

/** Unit vector from Earth toward the Sun when Earth's heliocentric longitude is θ. */
export function sunDirection(earthLonDeg: number): Vec3 {
  return [-Math.sin(earthLonDeg * DEG), -Math.cos(earthLonDeg * DEG), 0]
}
