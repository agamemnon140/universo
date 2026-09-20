import { useMemo } from 'react'
import { bodyById } from '../../data'
import { EARTH_AXIS, sunDirection } from '../../lib/earthGeometry'
import { dateFromJulianDay, planetHeliocentric, seasonInfo, wrap180 } from '../../lib/ephemeris'
import { formatDate } from '../../lib/format'
import { cameraFrom } from '../../lib/vec3'
import { Globe3D } from './Globe3D'

const W = 700
const H = 360
const CX = W / 2
const CY = H / 2 - 6
const RX = 235 // orbit ellipse, seen at a slant
const RY = 92
const DEG = Math.PI / 180

/**
 * The picture is a real oblique view of the ecliptic: the viewer sits above the plane, in
 * front, tilted down by asin(RY/RX). Screen right is ecliptic longitude 90° — the direction
 * Earth's north pole leans toward — so the axis tilts to the right in every frame.
 */
const ALPHA = Math.asin(RY / RX)
const CAM = cameraFrom([1, 0, 0], [0, Math.sin(ALPHA), Math.cos(ALPHA)])

function orbitPoint(lonDeg: number): { x: number; y: number } {
  return { x: CX + RX * Math.sin(lonDeg * DEG), y: CY - RY * Math.cos(lonDeg * DEG) }
}

const MARKERS = [
  { earthLon: 180, label: 'March equinox' },
  { earthLon: 270, label: 'June solstice' },
  { earthLon: 0, label: 'September equinox' },
  { earthLon: 90, label: 'December solstice' },
]

export function SeasonsDiagram({ jd }: { jd: number }) {
  const sun = bodyById.get('sun')!
  const earth = bodyById.get('earth')!
  const { earthLon, season } = useMemo(
    () => ({ earthLon: planetHeliocentric('earth', jd).lonDeg, season: seasonInfo(jd) }),
    [jd],
  )
  const today = orbitPoint(earthLon)
  const dec = season.declinationDeg
  const daysAway = season.next.daysAway
  const earthColor = earth.gradient?.[0] ?? earth.color

  return (
    <div className="panel diagram">
      <h3>Earth&apos;s tilt and the seasons</h3>
      <svg viewBox={`0 0 ${W} ${H}`}>
        {/* orbit / ecliptic plane */}
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="rgba(120,150,255,0.04)" stroke="var(--line-strong)" strokeDasharray="4 4" />
        <text x={CX} y={CY + RY + 26} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
          Earth&apos;s orbit — the ecliptic plane, seen at a slant · axis tilt and day–night line drawn true, sizes not to scale
        </text>

        {/* Sun */}
        <circle cx={CX} cy={CY} r={22} fill={sun.color} style={{ filter: `drop-shadow(0 0 14px ${sun.color})` }} />

        {/* four reference Earths — skipped when today's Earth would sit on top of one */}
        {MARKERS.map((m) => {
          const p = orbitPoint(m.earthLon)
          const overlapped = Math.abs(wrap180(earthLon - m.earthLon)) < 9
          const above = p.y < CY
          if (overlapped) return null
          return (
            <g key={m.label}>
              <Globe3D cx={p.x} cy={p.y} r={14} sun={sunDirection(m.earthLon)} axis={EARTH_AXIS} cam={CAM} color={earthColor} faded />
              <text x={p.x} y={above ? p.y - 32 : p.y + 42} textAnchor="middle" fill="var(--text-dim)" fontSize="12">
                {m.label}
              </text>
            </g>
          )
        })}

        {/* today's Earth */}
        <line x1={CX} y1={CY} x2={today.x} y2={today.y} stroke={sun.color} strokeOpacity="0.35" />
        <Globe3D cx={today.x} cy={today.y} r={20} sun={sunDirection(earthLon)} axis={EARTH_AXIS} cam={CAM} color={earthColor} />
        <text x={today.x} y={today.y + 40} textAnchor="middle" fill="var(--text)" fontSize="12" fontWeight="600">
          Earth · {formatDate(dateFromJulianDay(jd).toISOString())}
        </text>
      </svg>
      <p className="caption">
        Earth&apos;s axis keeps pointing the same way in space while the planet circles the Sun,
        so each hemisphere takes turns leaning into the sunlight. On this date the{' '}
        <strong>{season.northTiltedToSun ? 'northern' : 'southern'} hemisphere</strong> leans
        toward the Sun and the noon Sun is overhead at latitude{' '}
        <strong>
          {Math.abs(dec).toFixed(1)}° {dec >= 0 ? 'N' : 'S'}
        </strong>
        . The {season.next.name} is{' '}
        <strong>
          {daysAway < 1
            ? 'today'
            : `${Math.round(daysAway)} day${Math.round(daysAway) === 1 ? '' : 's'} away`}
        </strong>{' '}
        ({formatDate(dateFromJulianDay(season.next.jd).toISOString())}); the current season began
        with the {season.current.name} on {formatDate(dateFromJulianDay(season.current.jd).toISOString())}.
        The globes are lit the way the Sun really lights them from this viewpoint: the Earth at the
        back shows mostly its day side, the one in front mostly its night side — the next panel
        explains the day–night line.
      </p>
    </div>
  )
}
