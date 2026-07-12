import type { BlackHole, Body, StarSystem, Telescope } from '../types'
import bodiesJson from './bodies.json'
import telescopesJson from './telescopes.json'
import systemsJson from './systems.json'
import blackholesJson from './blackholes.json'

export const bodies = bodiesJson as Body[]
export const telescopes = telescopesJson as Telescope[]
export const systems = systemsJson as StarSystem[]
export const blackHoles = blackholesJson as BlackHole[]

export const bodyById = new Map(bodies.map((b) => [b.id, b]))
