/**
 * Keplerian elements for the eight planets — JPL "Approximate Positions of the Planets"
 * (E. M. Standish), Table 1, valid 1800–2050 AD. Values at J2000, rates per Julian century.
 * Angles in degrees, distances in AU. Earth uses the Earth–Moon barycenter (Earth itself
 * sits ~4,700 km from it: negligible at the ~1° accuracy of this table).
 */
export interface OrbitalElements {
  a: number // semi-major axis, AU
  e: number // eccentricity
  i: number // inclination to the ecliptic, deg
  L: number // mean longitude, deg
  longPeri: number // longitude of perihelion ϖ, deg
  longNode: number // longitude of the ascending node Ω, deg
}

export interface PlanetOrbit {
  id: string
  j2000: OrbitalElements
  rate: OrbitalElements // change per Julian century
}

export const PLANET_ORBITS: PlanetOrbit[] = [
  {
    id: 'mercury',
    j2000: { a: 0.38709927, e: 0.20563593, i: 7.00497902, L: 252.2503235, longPeri: 77.45779628, longNode: 48.33076593 },
    rate: { a: 0.00000037, e: 0.00001906, i: -0.00594749, L: 149472.67411175, longPeri: 0.16047689, longNode: -0.12534081 },
  },
  {
    id: 'venus',
    j2000: { a: 0.72333566, e: 0.00677672, i: 3.39467605, L: 181.9790995, longPeri: 131.60246718, longNode: 76.67984255 },
    rate: { a: 0.0000039, e: -0.00004107, i: -0.0007889, L: 58517.81538729, longPeri: 0.00268329, longNode: -0.27769418 },
  },
  {
    id: 'earth',
    j2000: { a: 1.00000261, e: 0.01671123, i: -0.00001531, L: 100.46457166, longPeri: 102.93768193, longNode: 0 },
    rate: { a: 0.00000562, e: -0.00004392, i: -0.01294668, L: 35999.37244981, longPeri: 0.32327364, longNode: 0 },
  },
  {
    id: 'mars',
    j2000: { a: 1.52371034, e: 0.0933941, i: 1.84969142, L: -4.55343205, longPeri: -23.94362959, longNode: 49.55953891 },
    rate: { a: 0.00001847, e: 0.00007882, i: -0.00813131, L: 19140.30268499, longPeri: 0.44441088, longNode: -0.29257343 },
  },
  {
    id: 'jupiter',
    j2000: { a: 5.202887, e: 0.04838624, i: 1.30439695, L: 34.39644051, longPeri: 14.72847983, longNode: 100.47390909 },
    rate: { a: -0.00011607, e: -0.00013253, i: -0.00183714, L: 3034.74612775, longPeri: 0.21252668, longNode: 0.20469106 },
  },
  {
    id: 'saturn',
    j2000: { a: 9.53667594, e: 0.05386179, i: 2.48599187, L: 49.95424423, longPeri: 92.59887831, longNode: 113.66242448 },
    rate: { a: -0.0012506, e: -0.00050991, i: 0.00193609, L: 1222.49362201, longPeri: -0.41897216, longNode: -0.28867794 },
  },
  {
    id: 'uranus',
    j2000: { a: 19.18916464, e: 0.04725744, i: 0.77263783, L: 313.23810451, longPeri: 170.9542763, longNode: 74.01692503 },
    rate: { a: -0.00196176, e: -0.00004397, i: -0.00242939, L: 428.48202785, longPeri: 0.40805281, longNode: 0.04240589 },
  },
  {
    id: 'neptune',
    j2000: { a: 30.06992276, e: 0.00859048, i: 1.77004347, L: -55.12002969, longPeri: 44.96476227, longNode: 131.78422574 },
    rate: { a: 0.00026291, e: 0.00005105, i: 0.00035372, L: 218.45945325, longPeri: -0.32241464, longNode: -0.00508664 },
  },
]

export const PLANET_IDS = PLANET_ORBITS.map((p) => p.id)

/** Earth's axial tilt (obliquity of the ecliptic), degrees, J2000. */
export const OBLIQUITY_DEG = 23.4393
/** Inclination of the Moon's orbit to the ecliptic, degrees. */
export const MOON_ORBIT_INCLINATION_DEG = 5.145
/** Tilt of the Moon's spin axis to the ecliptic (Cassini's laws), degrees. */
export const MOON_AXIS_TILT_ECLIPTIC_DEG = 1.54
/** Tilt of the Moon's spin axis to its own orbital plane, degrees. */
export const MOON_AXIS_TILT_ORBIT_DEG = 6.68
/** Mean synodic month (new Moon to new Moon), days. */
export const SYNODIC_MONTH_DAYS = 29.530589
/** Mean sidereal month (one orbit against the stars), days. */
export const SIDEREAL_MONTH_DAYS = 27.321661
