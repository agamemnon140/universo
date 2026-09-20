import { useMemo } from 'react'
import { SYNODIC_MONTH_DAYS } from '../../data/orbits'
import { moonPhase } from '../../lib/ephemeris'
import { APOLLO_11, libration, lunarDay } from '../../lib/libration'
import { MoonFace } from './MoonFace'

const W = 700
const H = 300

function hhmm(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.floor((hours - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function MoonFacePanel({ jd }: { jd: number }) {
  const { phase, lib, day } = useMemo(
    () => ({ phase: moonPhase(jd), lib: libration(jd), day: lunarDay(jd) }),
    [jd],
  )
  const localH = day.localHours(APOLLO_11.lon)
  const isDay = localH >= 6 && localH < 18
  const halfDay = SYNODIC_MONTH_DAYS / 2
  // hours since sunrise (6:00) or since sunset (18:00), in Earth days
  const sinceEdge = (((localH - (isDay ? 6 : 18) + 24) % 24) / 24) * SYNODIC_MONTH_DAYS
  const eastWest = lib.lonDeg >= 0 ? 'eastern' : 'western'
  const northSouth = lib.latDeg >= 0 ? 'north' : 'south'

  return (
    <div className="panel diagram">
      <h3>The Moon&apos;s face today — day, night and libration</h3>
      <svg viewBox={`0 0 ${W} ${H}`}>
        <MoonFace cx={170} cy={150} r={122} elongationDeg={phase.elongationDeg} librationLon={lib.lonDeg} librationLat={lib.latDeg} />
        <text x={170} y={16} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
          N
        </text>
        <text x={300} y={154} fill="var(--text-faint)" fontSize="11">
          E
        </text>
        <text x={38} y={154} textAnchor="end" fill="var(--text-faint)" fontSize="11">
          W
        </text>

        {/* legend and readings */}
        <g fontSize="12" fill="var(--text-dim)">
          <line x1={330} y1={52} x2={342} y2={52} stroke="var(--accent-cyan)" />
          <line x1={336} y1={46} x2={336} y2={58} stroke="var(--accent-cyan)" />
          <text x={352} y={56}>
            centre of the disc as seen from Earth today
          </text>
          <circle cx={336} cy={80} r={3} fill="var(--accent-amber)" />
          <text x={352} y={84}>
            mean centre of the near side — the offset is the libration
          </text>
          <circle cx={336} cy={108} r={3.5} fill="none" stroke="var(--status-operating)" strokeWidth="1.4" />
          <text x={352} y={112}>
            Apollo 11 landing site, Mare Tranquillitatis
          </text>
        </g>
        <g fontSize="13" fill="var(--text)">
          <text x={330} y={156} fontWeight="600">
            Libration
          </text>
          <text x={330} y={176} fill="var(--text-dim)" fontSize="12">
            {Math.abs(lib.lonDeg).toFixed(1)}° in longitude → we peek {Math.abs(lib.lonDeg).toFixed(1)}° around
            the {eastWest} limb
          </text>
          <text x={330} y={194} fill="var(--text-dim)" fontSize="12">
            {Math.abs(lib.latDeg).toFixed(1)}° in latitude → we look {Math.abs(lib.latDeg).toFixed(1)}° over
            the {northSouth} pole
          </text>
          <text x={330} y={230} fontWeight="600">
            Local time at Apollo 11: {hhmm(localH)} — {isDay ? 'daytime' : 'night'}
          </text>
          <text x={330} y={250} fill="var(--text-dim)" fontSize="12">
            {isDay ? 'sunrise' : 'sunset'} was {sinceEdge.toFixed(1)} Earth days ago; {isDay ? 'sunset' : 'sunrise'} in{' '}
            {(halfDay - sinceEdge).toFixed(1)} days
          </text>
          <text x={330} y={268} fill="var(--text-dim)" fontSize="12">
            surface there: roughly {isDay ? 'up to +120 °C in the afternoon' : 'down to −130 °C before dawn'}
          </text>
        </g>
      </svg>
      <p className="caption">
        The same face always turns toward Earth, but not rigidly: the Moon&apos;s speed along its
        elliptical orbit varies while its spin does not, and its orbit is tilted, so the face nods
        and rocks by up to about 8° — the <strong>libration</strong>. Over time these wobbles reveal
        59% of the surface. A lunar day (sunrise to sunrise) lasts {SYNODIC_MONTH_DAYS.toFixed(1)} Earth
        days: about two weeks of sunlight followed by two weeks of night, with no air to soften the
        swing from +120 °C to −130 °C. The terminator on the disc is the sunrise or sunset line
        creeping across the near side.
      </p>
    </div>
  )
}
