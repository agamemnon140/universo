import { useMemo } from 'react'
import { bodyById } from '../../data'
import { OBLIQUITY_DEG } from '../../data/orbits'
import { dateFromJulianDay, planetHeliocentric, seasonInfo, wrap180 } from '../../lib/ephemeris'
import { formatDate } from '../../lib/format'

const W = 700
const H = 360
const CX = W / 2
const CY = H / 2 - 6
const RX = 235 // orbit ellipse, seen at a slant
const RY = 92
const DEG = Math.PI / 180

/**
 * Screen position of Earth at heliocentric longitude θ. The layout is rotated so the
 * direction Earth's north pole leans toward (ecliptic longitude 90°) points to the right:
 * the axis then tilts to the right in every frame, and the December-solstice Earth sits on
 * the right, the June-solstice Earth on the left, the equinoxes at back (top) and front.
 */
function orbitPoint(lonDeg: number): { x: number; y: number } {
  return { x: CX + RX * Math.sin(lonDeg * DEG), y: CY - RY * Math.cos(lonDeg * DEG) }
}

const MARKERS = [
  { earthLon: 180, label: 'March equinox' },
  { earthLon: 270, label: 'June solstice' },
  { earthLon: 0, label: 'September equinox' },
  { earthLon: 90, label: 'December solstice' },
]

function TiltedEarth({
  x,
  y,
  r,
  faded,
  showAngle,
}: {
  x: number
  y: number
  r: number
  faded: boolean
  showAngle: boolean
}) {
  const earth = bodyById.get('earth')!
  const axis = r * 1.7
  const tilt = OBLIQUITY_DEG
  const ax = Math.sin(tilt * DEG) * axis
  const ay = Math.cos(tilt * DEG) * axis
  // the dark half faces away from the Sun (at the centre of the picture)
  const away = (Math.atan2(y - CY, x - CX) / DEG) - 90
  return (
    <g opacity={faded ? 0.45 : 1}>
      <circle cx={x} cy={y} r={r} fill={earth.gradient?.[0] ?? earth.color} />
      <path
        d={`M ${x - r} ${y} a ${r} ${r} 0 0 0 ${2 * r} 0 z`}
        transform={`rotate(${away} ${x} ${y})`}
        fill="rgba(2, 5, 14, 0.62)"
      />
      {/* equator, as a hint of the spin */}
      <ellipse
        cx={x}
        cy={y}
        rx={r}
        ry={r * 0.28}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        transform={`rotate(${tilt} ${x} ${y})`}
      />
      {showAngle && (
        <>
          <line x1={x} y1={y - axis} x2={x} y2={y + axis} stroke="var(--text-faint)" strokeDasharray="3 3" />
          <path
            d={`M ${x} ${y - axis * 0.8} A ${axis * 0.8} ${axis * 0.8} 0 0 1 ${x + Math.sin(tilt * DEG) * axis * 0.8} ${y - Math.cos(tilt * DEG) * axis * 0.8}`}
            fill="none"
            stroke="var(--accent-amber)"
            strokeWidth="1.2"
          />
          <text x={x - 6} y={y - axis * 0.95} textAnchor="end" fill="var(--accent-amber)" fontSize="12">
            {tilt.toFixed(1)}°
          </text>
        </>
      )}
      <line x1={x - ax} y1={y + ay} x2={x + ax} y2={y - ay} stroke="var(--accent-amber)" strokeWidth="1.6" />
      <text x={x + ax + 3} y={y - ay - 2} fill="var(--accent-amber)" fontSize="10">
        N
      </text>
    </g>
  )
}

export function SeasonsDiagram({ jd }: { jd: number }) {
  const sun = bodyById.get('sun')!
  const { earthLon, season } = useMemo(
    () => ({ earthLon: planetHeliocentric('earth', jd).lonDeg, season: seasonInfo(jd) }),
    [jd],
  )
  const today = orbitPoint(earthLon)
  const dec = season.declinationDeg
  const daysAway = season.next.daysAway

  return (
    <div className="panel diagram">
      <h3>Earth&apos;s tilt and the seasons</h3>
      <svg viewBox={`0 0 ${W} ${H}`}>
        {/* orbit / ecliptic plane */}
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="rgba(120,150,255,0.04)" stroke="var(--line-strong)" strokeDasharray="4 4" />
        <text x={CX} y={CY + RY + 26} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
          Earth&apos;s orbit — the ecliptic plane, seen at a slant · axis tilt drawn true, sizes not to scale
        </text>

        {/* Sun */}
        <circle cx={CX} cy={CY} r={22} fill={sun.color} style={{ filter: `drop-shadow(0 0 14px ${sun.color})` }} />

        {/* four reference Earths — skipped when today's Earth would sit on top of one */}
        {MARKERS.map((m) => {
          const p = orbitPoint(m.earthLon)
          const overlapped = Math.abs(wrap180(earthLon - m.earthLon)) < 9
          const above = p.y < CY
          return (
            <g key={m.label}>
              {!overlapped && <TiltedEarth x={p.x} y={p.y} r={13} faded showAngle={false} />}
              {!overlapped && (
                <text
                  x={p.x}
                  y={above ? p.y - 30 : p.y + 40}
                  textAnchor="middle"
                  fill="var(--text-dim)"
                  fontSize="12"
                >
                  {m.label}
                </text>
              )}
            </g>
          )
        })}

        {/* today's Earth */}
        <line x1={CX} y1={CY} x2={today.x} y2={today.y} stroke={sun.color} strokeOpacity="0.35" />
        <TiltedEarth x={today.x} y={today.y} r={18} faded={false} showAngle />
        <text x={today.x} y={today.y + 36} textAnchor="middle" fill="var(--text)" fontSize="12" fontWeight="600">
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
      </p>
    </div>
  )
}
