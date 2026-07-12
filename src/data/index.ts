import type { Body, StarSystem, Telescope } from '../types'
import bodiesJson from './bodies.json'
import telescopesJson from './telescopes.json'
import systemsJson from './systems.json'

export const bodies = bodiesJson as Body[]
export const telescopes = telescopesJson as Telescope[]
export const systems = systemsJson as StarSystem[]

export const bodyById = new Map(bodies.map((b) => [b.id, b]))
