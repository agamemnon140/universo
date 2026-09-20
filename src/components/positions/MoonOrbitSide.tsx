import { useMemo } from 'react'
import { bodyById } from '../../data'
import {
  MOON_AXIS_TILT_ECLIPTIC_DEG,
  MOON_AXIS_TILT_ORBIT_DEG,
  MOON_ORBIT_INCLINATION_DEG,
  OBLIQUITY_DEG,
} from '../../data/orbits'
import { moonPosition, sunPosition, wrap180 } from '../../lib/ephemeris'

const W = 700
const H = 330
const CX = 250
const CY = 165
const R = 190 // orbit radius on screen
const K = 0.16 // how open the orbit disc looks (viewer slightly above the plane)
const EXAGGERATION = 3 // vertical stretch so a 5° tilt is readable
const DEG = Math.PI / 180

/** Angle (degrees) the tilted orbit makes with the plane, after vertical exaggeration. */
const drawnTilt = Math.atan(EXAGGERATION * Math.tan(MOON_ORBIT_INCLINATION_DEG * DEG)) / DEG

export function MoonOrbitSide({ jd }: { jd: number }) {
  const moonBody = bodyById.get('moon')!
  const earth = bodyById.get('earth')!
  const { moon, sun } = useMemo(() => ({ moon: moonPosition(jd), sun: sunPosition(jd) }), [jd])

  // View along the line of nodes: the orbit is a disc tipped by the inclination, the
  // ascending node behind Earth, the descending node in front. In the disc's own frame the
  // Moon sits at (R sin u, -K R cos u); the frame is then rotated by the tilt.
  const u = moon.argLatDeg * DEG
  const dx = R * Math.sin(u)
  const dy = -K * R * Math.cos(u)
  const t = -drawnTilt * DEG // SVG rotate(-tilt): the right-hand end of the disc rises
  const mx = CX + dx * Math.cos(t) - dy * Math.sin(t)
  const my = CY + dx * Math.sin(t) + dy * Math.cos(t)
  const lat = moon.latDeg
  const above = lat >= 0

  // how far the Sun is from the line of nodes: eclipses need it within ~15°
  const sunFromNode = Math.min(
    Math.abs(wrap180(sun.lonDeg - moon.nodeLonDeg)),
    Math.abs(wrap180(sun.lonDeg - moon.nodeLonDeg - 180)),
  )
  const eclipseSeason = sunFromNode < 17

  // tilt comparison inset
  const IX = 590
  const IY = 255
  const L = 100
  const earthAxisEnd = { x: IX + L * Math.sin(OBLIQUITY_DEG * DEG), y: IY - L * Math.cos(OBLIQUITY_DEG * DEG) }
  const moonAxisEnd = {
    x: IX - L * Math.sin(MOON_AXIS_TILT_ECLIPTIC_DEG * DEG),
    y: IY - L * Math.cos(MOON_AXIS_TILT_ECLIPTIC_DEG * DEG),
  }
  const orbitRise = 80 * Math.tan(MOON_ORBIT_INCLINATION_DEG * DEG)

  return (
    <div className="panel diagram">
      <h3>The Moon&apos;s tilted orbit — above and below the ecliptic</h3>
      <svg viewBox={`0 0 ${W} ${H}`}>
        {/* ecliptic plane edge-on */}
        <line x1={20} y1={CY} x2={480} y2={CY} stroke="var(--line-strong)" strokeWidth="1.2" />
        <text x={22} y={CY + 16} fill="var(--text-faint)" fontSize="11">
          ecliptic plane (Earth–Sun plane), edge on
        </text>

        {/* the orbit disc, tipped by the inclination */}
        <g transform={`rotate(${-drawnTilt} ${CX} ${CY})`}>
          <ellipse cx={CX} cy={CY} rx={R} ry={K * R} fill="rgba(196,196,204,0.05)" stroke={moonBody.color} strokeOpacity="0.6" strokeDasharray="5 4" />
          <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke={moonBody.color} strokeOpacity="0.25" />
          <text x={CX} y={CY - K * R - 6} textAnchor="middle" fill="var(--text-dim)" fontSize="11">
            ☊ ascending node (behind)
          </text>
          <text x={CX} y={CY + K * R + 16} textAnchor="middle" fill="var(--text-dim)" fontSize="11">
            ☋ descending node (in front)
          </text>
        </g>

        {/* inclination angle between the plane and the disc */}
        <path
          d={`M ${CX + 110} ${CY} A 110 110 0 0 0 ${CX + 110 * Math.cos(drawnTilt * DEG)} ${CY - 110 * Math.sin(drawnTilt * DEG)}`}
          fill="none"
          stroke="var(--accent-amber)"
          strokeWidth="1.2"
        />
        <text x={CX + 118} y={CY - 8} fill="var(--accent-amber)" fontSize="12">
          {MOON_ORBIT_INCLINATION_DEG.toFixed(1)}° (drawn ×{EXAGGERATION})
        </text>

        {/* Earth */}
        <circle cx={CX} cy={CY} r={12} fill={earth.gradient?.[1] ?? earth.color} />

        {/* Moon, and its height above/below the plane */}
        <line x1={mx} y1={CY} x2={mx} y2={my} stroke="var(--accent-cyan)" strokeDasharray="3 3" />
        <circle cx={mx} cy={my} r={7} fill={moonBody.color} style={{ filter: `drop-shadow(0 0 5px ${moonBody.color})` }} />
        <line x1={mx} y1={my} x2={CX} y2={H - 30} stroke="var(--accent-cyan)" strokeOpacity="0.35" />
        <text x={CX} y={H - 12} textAnchor="middle" fill="var(--accent-cyan)" fontSize="12" fontWeight="600">
          Moon {Math.abs(lat).toFixed(1)}° {above ? 'above' : 'below'} the plane · {moon.ascending ? 'rising ↗' : 'sinking ↘'}
        </text>

        {/* tilts compared */}
        <g>
          <text x={IX} y={IY - L - 26} textAnchor="middle" fill="var(--text-dim)" fontSize="11" letterSpacing="0.08em">
            TILTS COMPARED
          </text>
          <line x1={IX - 85} y1={IY} x2={IX + 85} y2={IY} stroke="var(--line-strong)" />
          <line x1={IX} y1={IY} x2={IX} y2={IY - L} stroke="var(--text-faint)" strokeDasharray="2 3" />
          {/* Earth's axis */}
          <line x1={IX} y1={IY} x2={earthAxisEnd.x} y2={earthAxisEnd.y} stroke="var(--accent-amber)" strokeWidth="2" />
          <text x={earthAxisEnd.x + 2} y={earthAxisEnd.y - 6} textAnchor="middle" fill="var(--accent-amber)" fontSize="11">
            Earth axis {OBLIQUITY_DEG.toFixed(1)}°
          </text>
          {/* Moon's orbit plane */}
          <line x1={IX - 80} y1={IY + orbitRise} x2={IX + 80} y2={IY - orbitRise} stroke={moonBody.color} strokeWidth="1.5" />
          <text x={IX - 80} y={IY + orbitRise + 14} fill="var(--text-dim)" fontSize="11">
            Moon orbit {MOON_ORBIT_INCLINATION_DEG.toFixed(1)}°
          </text>
          {/* Moon's axis: leans the other way from its orbit (Cassini) */}
          <line x1={IX} y1={IY} x2={moonAxisEnd.x} y2={moonAxisEnd.y} stroke="var(--accent-cyan)" strokeWidth="2" />
          <text x={moonAxisEnd.x - 4} y={moonAxisEnd.y - 6} textAnchor="end" fill="var(--accent-cyan)" fontSize="11">
            Moon axis {MOON_AXIS_TILT_ECLIPTIC_DEG.toFixed(1)}°
          </text>
          <text x={IX} y={IY + 34} textAnchor="middle" fill="var(--text-faint)" fontSize="10">
            from the ecliptic · drawn true, no exaggeration
          </text>
        </g>
      </svg>
      <p className="caption">
        The Moon&apos;s orbit is tipped {MOON_ORBIT_INCLINATION_DEG.toFixed(1)}° to the plane Earth
        travels around the Sun, so every month the Moon climbs up to 5° above that plane, crosses
        it at a node, and dips 5° below. Right now it is{' '}
        <strong>
          {Math.abs(lat).toFixed(1)}° {above ? 'above' : 'below'}
        </strong>{' '}
        the plane and {moon.ascending ? 'rising toward' : 'sinking toward'} its next crossing. Eclipses
        need a new or full Moon while the Sun lines up with the nodes; today the Sun is{' '}
        <strong>{sunFromNode.toFixed(0)}° from the line of nodes</strong>
        {eclipseSeason
          ? ' — an eclipse season, so the coming new and full Moons can bring eclipses.'
          : ', so this month’s new and full Moons pass above or below the shadows.'}{' '}
        The Moon&apos;s own spin axis is barely tilted: {MOON_AXIS_TILT_ECLIPTIC_DEG.toFixed(1)}° to
        the ecliptic, leaning the opposite way from its orbit, which makes{' '}
        {MOON_AXIS_TILT_ORBIT_DEG.toFixed(1)}° to its own orbital plane (Cassini&apos;s laws) — the
        Moon has no real seasons.
      </p>
    </div>
  )
}
