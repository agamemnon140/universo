import type { Body } from '../types'
import { bodyById } from '../data'
import { AU_KM, formatLunarDistance, formatNumber } from './format'

export type BodySort = 'size' | 'distance' | 'mass'

export const BODY_SORT_LABELS: Record<BodySort, string> = {
  size: 'Largest first',
  distance: 'Closest orbit first',
  mass: 'Heaviest first',
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
  if (body.orbitDistanceKm === null) return 'centre of the system'
  const parent = body.parent ? bodyById.get(body.parent) : undefined
  if (body.type !== 'moon') return `${formatNumber(body.orbitDistanceAU)} AU`
  if (body.id === 'moon') return `${(body.orbitDistanceKm / AU_KM).toFixed(4)} AU from Earth`
  return `${formatLunarDistance(body.orbitDistanceKm)}${parent ? ` from ${parent.name}` : ''}`
}
