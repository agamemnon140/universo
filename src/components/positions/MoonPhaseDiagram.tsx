import { useMemo } from 'react'
import { bodyById } from '../../data'
import { dateFromJulianDay, moonPhase, moonPosition, nextPhases } from '../../lib/ephemeris'
import { formatNumber } from '../../lib/format'

const W = 700
const H = 340
const EX = 250 // Earth, top-down panel
const EY = 170
const ORBIT_R = 108
const DX = 560 // big phase disc
const DY = 170
const DISC_R = 88
const DEG = Math.PI / 180

/**
 * A moon lit from screen-left (parallel sunlight), as seen from above the orbit.
 * `angleDeg` is the Moon's elongation from the Sun: 0 = between Earth and Sun (new).
 */
function LitMoon({ x, y, r, color, current }: { x: number; y: number; r: number; color: string; current: boolean }) {
  return (
    <g opacity={current ? 1 : 0.35}>
      <circle cx={x} cy={y} r={r} fill="rgba(2, 5, 14, 0.9)" stroke={current ? 'var(--accent-cyan)' : 'none'} strokeWidth="1.5" />
      {/* lit half faces the Sun on the left */}
      <path d={`M ${x} ${y - r} A ${r} ${r} 0 0 0 ${x} ${y + r} z`} fill={color} />
    </g>
  )
}

/**
 * The phase disc as seen from Earth (northern hemisphere, north up): lit limb on the right
 * while waxing, on the left while waning; the terminator is a half-ellipse.
 */
function PhaseDisc({ elongationDeg, color }: { elongationDeg: number; color: string }) {
  const waxing = elongationDeg < 180
  const gibbous = elongationDeg > 90 && elongationDeg < 270
  const rx = Math.max(0.01, DISC_R * Math.abs(Math.cos(elongationDeg * DEG)))
  const top = `${DX} ${DY - DISC_R}`
  const bottom = `${DX} ${DY + DISC_R}`
  // outer limb: waxing → down the right side (sweep 1); waning → down the left (sweep 0)
  const limb = `A ${DISC_R} ${DISC_R} 0 0 ${waxing ? 1 : 0} ${bottom}`
  // terminator back to the top: bulges toward the dark side when gibbous
  const sweep = waxing ? (gibbous ? 1 : 0) : gibbous ? 0 : 1
  const terminator = `A ${rx} ${DISC_R} 0 0 ${sweep} ${top}`
  return (
    <g>
      <circle cx={DX} cy={DY} r={DISC_R} fill="rgba(2, 5, 14, 0.9)" stroke="var(--line-strong)" />
      <path d={`M ${top} ${limb} ${terminator} z`} fill={color} />
    </g>
  )
}

export function MoonPhaseDiagram({ jd }: { jd: number }) {
  const moonBody = bodyById.get('moon')!
  const earth = bodyById.get('earth')!
  const sun = bodyById.get('sun')!
  const { phase, moon, upcoming } = useMemo(
    () => ({ phase: moonPhase(jd), moon: moonPosition(jd), upcoming: nextPhases(jd) }),
    [jd],
  )
  // top-down: Sun to the left; the Moon runs counter-clockwise (seen from north) from the Sun direction
  const angle = (180 + phase.elongationDeg) * DEG
  const mx = EX + ORBIT_R * Math.cos(angle)
  const my = EY - ORBIT_R * Math.sin(angle)

  return (
    <div className="panel diagram">
      <h3>Moon phase — Sun, Earth and Moon from above</h3>
      <svg viewBox={`0 0 ${W} ${H}`}>
        {/* sunlight */}
        {[-70, -35, 0, 35, 70].map((dy) => (
          <line key={dy} x1={18} y1={EY + dy} x2={100} y2={EY + dy} stroke={sun.color} strokeOpacity="0.5" strokeWidth="1.2" markerEnd="url(#sun-arrow)" />
        ))}
        <defs>
          <marker id="sun-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={sun.color} fillOpacity="0.6" />
          </marker>
        </defs>
        <text x={18} y={EY - 84} fill={sun.color} fillOpacity="0.8" fontSize="11">
          sunlight
        </text>

        {/* orbit and the eight reference phases */}
        <circle cx={EX} cy={EY} r={ORBIT_R} fill="none" stroke="var(--line-strong)" strokeDasharray="3 5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((e) => {
          const a = (180 + e) * DEG
          return (
            <LitMoon
              key={e}
              x={EX + ORBIT_R * Math.cos(a)}
              y={EY - ORBIT_R * Math.sin(a)}
              r={8}
              color={moonBody.color}
              current={false}
            />
          )
        })}
        {/* Earth with its night side */}
        <circle cx={EX} cy={EY} r={16} fill={earth.gradient?.[0] ?? earth.color} />
        <path d={`M ${EX} ${EY - 16} A 16 16 0 0 1 ${EX} ${EY + 16} z`} fill="rgba(2, 5, 14, 0.62)" />
        {/* the Moon today */}
        <line x1={EX} y1={EY} x2={mx} y2={my} stroke="var(--accent-cyan)" strokeOpacity="0.5" strokeDasharray="3 3" />
        <LitMoon x={mx} y={my} r={11} color={moonBody.color} current />
        <text x={EX} y={EY + ORBIT_R + 34} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
          Moon {Math.round(phase.elongationDeg)}° round from the Sun direction · counter-clockwise, seen from north
        </text>

        {/* as seen from Earth */}
        <PhaseDisc elongationDeg={phase.elongationDeg} color={moonBody.color} />
        <text x={DX} y={DY - DISC_R - 14} textAnchor="middle" fill="var(--text-dim)" fontSize="12">
          seen from Earth (north up)
        </text>
        <text x={DX} y={DY + DISC_R + 22} textAnchor="middle" fill="var(--text)" fontSize="13" fontWeight="600">
          {phase.name}
        </text>
        <text x={DX} y={DY + DISC_R + 40} textAnchor="middle" fill="var(--text-dim)" fontSize="11">
          {Math.round(phase.illuminated * 100)}% lit · {phase.ageDays.toFixed(1)} days old
        </text>
      </svg>
      <p className="caption">
        The Sun always lights half of the Moon; the phase is how much of that lit half faces
        Earth. Today the Moon is{' '}
        <strong>{formatNumber(Math.round(moon.distKm))} km</strong> away,{' '}
        <strong>{Math.round(phase.illuminated * 100)}% illuminated</strong> and{' '}
        {phase.waxing ? 'waxing' : 'waning'}. Coming up:{' '}
        {upcoming.map((p, i) => (
          <span key={p.name}>
            {i > 0 && ' · '}
            {p.name.toLowerCase()}{' '}
            <strong>
              {dateFromJulianDay(p.jd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
            </strong>
          </span>
        ))}
        . From the southern hemisphere the disc appears upside down, lit on the other side.
      </p>
    </div>
  )
}
