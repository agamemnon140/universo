// ---------- Tab 1: Solar System ----------
export type BodyType = 'star' | 'planet' | 'dwarf-planet' | 'moon'

export interface Body {
  id: string // 'jupiter', 'ganymede'
  name: string
  type: BodyType
  parent?: string // body id for moons; planets orbit 'sun'
  color: string
  gradient?: [string, string]

  // Relative to Earth = 1 (user's spreadsheet values)
  massEarth: number
  volumeEarth: number
  radiusEarth: number

  // Absolute / physical
  radiusKm: number
  surfaceGravityG: number // Earth = 1
  densityGcm3: number
  meanTempC: number
  escapeVelocityKms: number

  // Orbital
  orbitDistanceKm: number | null // semi-major axis; moons: around parent; sun: null
  orbitDistanceAU: number | null
  orbitalPeriodDays: number | null
  rotationPeriodHours: number | null // negative = retrograde
  eccentricity: number | null
  inclinationDeg: number | null
  rocheLimitKm: number | null
  hillSphereKm: number | null

  // Curiosities
  atmosphere: string
  moonCount: number
  rings: boolean
  discovery: { year: number | null; by: string } // null year = known since antiquity
  missions: string[]
  facts: string[]
}

// ---------- Tab 2: Telescopes ----------
export type TelescopeStatus = 'operating' | 'construction' | 'planned' | 'retired'
export type TelescopeKind = 'em' | 'gravitational-wave' | 'neutrino'

export interface Telescope {
  id: string
  name: string // 'JWST'
  fullName?: string // 'James Webb Space Telescope'
  kind: TelescopeKind
  domain: 'space' | 'ground'
  status: TelescopeStatus
  agency: string // 'NASA/ESA/CSA', 'CAS (China)'

  // EM coverage (kind === 'em'): bar endpoints in meters
  wavelengthMinM?: number
  wavelengthMaxM?: number
  bands: string[] // human-readable chips: ['near-IR', 'mid-IR']
  signalLabel?: string // GW/neutrino: 'GW 10–1000 Hz', 'ν TeV–PeV'

  aperture: string // '6.5 m segmented', '2×4 km arms'
  fieldOfView?: string
  limitingMagnitude?: string
  location: string // 'Sun–Earth L2', 'Cerro Pachón, Chile'
  launched?: number // launch or first-light year
  retired?: number
  plannedDate?: string // '~2027', '2040s'
  objectives: string[]
  instruments: string[]
  url?: string
}

// ---------- Tab 3: Neighborhood ----------
export interface Exoplanet {
  name: string // 'Proxima b', 'TRAPPIST-1e'
  massEarth?: number
  radiusEarth?: number
  orbitAU?: number
  periodDays?: number
  discoveryYear: number
  method: string // 'radial velocity', 'transit'
  inHabitableZone: boolean
  note?: string
}

export interface StarInSystem {
  name: string // 'Alpha Centauri A'
  spectralClass: string // 'G2V', 'M5.5V', 'DA2'
  radiusSun: number
  massSun?: number
  tempK?: number
}

export interface StarSystem {
  id: string
  name: string
  distanceLy: number
  ra: number // degrees J2000
  dec: number // degrees J2000
  stars: StarInSystem[]
  planets: Exoplanet[]
  habitableZone?: { innerAU: number; outerAU: number }
  note?: string
}

// ---------- News ----------
export type NewsTheme = 'solar-system' | 'telescopes' | 'exoplanets'

export interface NewsItem {
  id: string
  title: string
  link: string
  date: string // ISO 8601
  summary: string
  themes: NewsTheme[]
}

export interface NewsFeed {
  generatedAt: string // ISO 8601
  source: string
  items: NewsItem[]
}
