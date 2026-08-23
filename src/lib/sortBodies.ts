import type { Body } from '../types'
import { bodyById } from '../data'
import { AU_KM, formatLunarDistance, formatNumber, formatRatio } from './format'

export type BodySort = 'size' | 'distance' | 'mass' | 'grip'

export const BODY_SORT_LABELS: Record<BodySort, string> = {
  size: 'Largest first',
  distance: 'Closest orbit first',
  mass: 'Heaviest first',
  grip: 'Strongest tidal grip first',
}

/**
 * Tidal grip: how strongly a body's gravity kneads the thing it orbits —
 * (m/M_parent) · (R_parent/d)³, its mass relative to the parent's, weighted by
 * closeness. The cube is the tidal scaling: tides come from the *difference*
 * in pull across the parent, which falls off with distance cubed, so a nearby
 * middleweight beats a distant giant. Null for the Sun, which orbits nothing.
 */
export function tidalGrip(body: Body): number | null {
  if (!body.parent || body.orbitDistanceKm === null) return null
  const parent = bodyById.get(body.parent)
  if (!parent) return null
  return (body.massEarth / parent.massEarth) * (parent.radiusKm / body.orbitDistanceKm) ** 3
}

/**
 * Tidal grip against the everyday yardstick — the Moon's grip on Earth, the
 * pull behind our ocean tides, as 1. Charon lands near 480: it kneads Pluto
 * hard enough to have locked the pair face-to-face.
 */
export function tidalGripVsMoon(body: Body): number | null {
  const grip = tidalGrip(body)
  if (grip === null) return null
  return grip / tidalGrip(bodyById.get('moon')!)!
}

/**
 * Order a list of bodies. Distance means orbit distance from whatever a body
 * orbits — the Sun for planets, the planet for moons — so a mixed list stays
 * meaningful as long as its members share a parent.
 */
export function sortBodies(list: Body[], sort: BodySort): Body[] {
  const copy = list.slice()
  switch (sort) {
    case 'distance':
      // the Sun orbits nothing, so it leads the list as the centre of the system
      return copy.sort((a, b) => (a.orbitDistanceKm ?? -1) - (b.orbitDistanceKm ?? -1))
    case 'mass':
      return copy.sort((a, b) => b.massEarth - a.massEarth)
    case 'grip':
      // the Sun grips nothing above it, so it closes the list
      return copy.sort((a, b) => (tidalGrip(b) ?? -1) - (tidalGrip(a) ?? -1))
    default:
      return copy.sort((a, b) => b.radiusEarth - a.radiusEarth)
  }
}

/**
 * The value a list is sorted by, for the caption under each card.
 *
 * Orbit distances pick their unit by what a body orbits, so every card in a
 * group shares one scale: bodies going around the Sun read in AU, moons in
 * lunar distances (0.02 LD for Phobos up to 33.7 LD for Phoebe — a range AU
 * would squash and km would spread over four orders of magnitude). Our own
 * Moon is the exception, keeping the AU figure it is usually quoted with
 * rather than measuring itself against itself.
 */
export function sortCaption(body: Body, sort: BodySort): string | undefined {
  if (sort === 'size') return undefined
  if (sort === 'mass') return `${formatNumber(body.massEarth)} M⊕`
  if (sort === 'grip') {
    const rel = tidalGripVsMoon(body)
    if (rel === null) return 'centre of the system'
    if (body.id === 'moon') return 'the yardstick — our ocean tides'
    return `${formatRatio(rel)} the Moon's grip`
  }
  if (body.orbitDistanceKm === null) return 'centre of the system'
  const parent = body.parent ? bodyById.get(body.parent) : undefined
  if (body.type !== 'moon') return `${formatNumber(body.orbitDistanceAU)} AU`
  if (body.id === 'moon') return `${(body.orbitDistanceKm / AU_KM).toFixed(4)} AU from Earth`
  return `${formatLunarDistance(body.orbitDistanceKm)}${parent ? ` from ${parent.name}` : ''}`
}
