import type { Mission, MissionLane, MissionLead, MissionStatus } from '../types'

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  operating: 'Flying',
  development: 'In development',
  proposed: 'Proposed',
  ended: 'Ended',
}

/** Same four status colours as the Telescopes tab. */
export const MISSION_STATUS_COLORS: Record<MissionStatus, string> = {
  operating: 'var(--status-operating)',
  development: 'var(--status-construction)',
  proposed: 'var(--status-planned)',
  ended: 'var(--status-retired)',
}

export const MISSION_STATUSES: MissionStatus[] = ['operating', 'development', 'proposed', 'ended']

export const MISSION_LANES: { id: MissionLane; label: string }[] = [
  { id: 'sun', label: 'Sun' },
  { id: 'inner', label: 'Mercury & Venus' },
  { id: 'moon', label: 'Moon' },
  { id: 'mars', label: 'Mars' },
  { id: 'small-bodies', label: 'Asteroids, comets & dwarf planets' },
  { id: 'giants', label: 'Jupiter & Saturn' },
  { id: 'outer', label: 'Uranus, Kuiper belt & beyond' },
  { id: 'observatories', label: 'Flagship observatories' },
]

export const MISSION_LEADS: { id: MissionLead; label: string }[] = [
  { id: 'NASA', label: 'NASA' },
  { id: 'ESA', label: 'ESA' },
  { id: 'CNSA', label: 'China' },
  { id: 'JAXA', label: 'Japan' },
]

/**
 * US fiscal-2027 budget snapshot. Hand-maintained: update `asOf` and the
 * `budget` fields in missions.json when a bill moves.
 */
export const FY2027 = {
  asOf: '2026-11-22T12:00:00Z', // noon UTC, so every time zone shows the same day
  science: { fy26: '7,250', request: '3,894', house: '6,000', senate: '7,430' },
}

/** The timeline's year axis. Earlier launches and later plans are pinned to its edges. */
export const AXIS_START = 2000
export const AXIS_END = 2040

/** 'YYYY-MM' → the middle of that month; 'YYYY' → the middle of that year. */
export function decimalYear(date: string): number {
  const [year, month] = date.split('-').map(Number)
  return month ? year + (month - 0.5) / 12 : year + 0.5
}

export function decimalYearOf(date: Date): number {
  const year = date.getUTCFullYear()
  const start = Date.UTC(year, 0, 1)
  const end = Date.UTC(year + 1, 0, 1)
  return year + (date.getTime() - start) / (end - start)
}

/** Position along the axis as a fraction 0–1, clamped to its ends. */
export function axisFraction(year: number): number {
  return Math.min(1, Math.max(0, (year - AXIS_START) / (AXIS_END - AXIS_START)))
}

export interface TimelineSegment {
  from: number
  to: number
  /** cruise = flown, on the way; active = flown, at work; planned = still ahead. */
  kind: 'cruise' | 'active' | 'planned'
}

export interface TimelineMarker {
  at: number
  kind: 'launch' | 'arrival'
  done: boolean
}

export interface MissionTimelineShape {
  segments: TimelineSegment[]
  markers: TimelineMarker[]
  /** The launch predates the axis / the plan lies beyond it. */
  clippedStart: boolean
  clippedEnd: boolean
}

/**
 * What to draw for one mission, in decimal years. Missions that have flown get
 * a solid bar from launch to today (or to their end), fainter while en route;
 * anything still ahead — a future arrival, or the whole mission — is "planned".
 */
export function missionTimeline(mission: Mission, now: number): MissionTimelineShape {
  const shape: MissionTimelineShape = {
    segments: [],
    markers: [],
    clippedStart: false,
    clippedEnd: false,
  }
  if (!mission.launch) return shape

  const launch = decimalYear(mission.launch)
  const arrival = mission.arrival ? decimalYear(mission.arrival) : null
  const hasFlown = mission.status === 'operating' || mission.status === 'ended'

  if (hasFlown) {
    const stop = mission.end ? decimalYear(mission.end) : now
    if (arrival === null) {
      shape.segments.push({ from: launch, to: stop, kind: 'active' })
    } else {
      shape.segments.push({ from: launch, to: Math.min(arrival, stop), kind: 'cruise' })
      if (arrival < stop) shape.segments.push({ from: arrival, to: stop, kind: 'active' })
      else if (arrival > stop) shape.segments.push({ from: stop, to: arrival, kind: 'planned' })
      shape.markers.push({ at: arrival, kind: 'arrival', done: arrival <= stop })
    }
  } else {
    if (arrival !== null && arrival > launch) {
      shape.segments.push({ from: launch, to: arrival, kind: 'planned' })
      shape.markers.push({ at: arrival, kind: 'arrival', done: false })
    }
    shape.markers.push({ at: launch, kind: 'launch', done: false })
  }

  shape.clippedStart = launch < AXIS_START
  shape.clippedEnd = shape.markers.some((m) => m.at > AXIS_END) || launch > AXIS_END
  shape.segments = shape.segments.filter((s) => s.to > AXIS_START && s.from < AXIS_END)
  shape.markers = shape.markers.filter((m) => m.at >= AXIS_START && m.at <= AXIS_END)
  return shape
}

/** Short launch text for the timeline's year column: '1977', '2028?', '2030s', '—'. */
export function launchYearLabel(mission: Mission): string {
  if (mission.launchShort) return mission.launchShort
  if (!mission.launch) return '—'
  const year = mission.launch.slice(0, 4)
  const isTarget = mission.status === 'development' || mission.status === 'proposed'
  return isTarget ? `${year}?` : year
}

export function sortByLaunch(list: Mission[]): Mission[] {
  return [...list].sort((a, b) => {
    if (!a.launch) return 1
    if (!b.launch) return -1
    return decimalYear(a.launch) - decimalYear(b.launch)
  })
}
