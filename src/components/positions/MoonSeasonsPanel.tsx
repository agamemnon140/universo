import { useMemo } from 'react'
import { bodyById } from '../../data'
import { MOON_AXIS_TILT_ECLIPTIC_DEG, OBLIQUITY_DEG } from '../../data/orbits'
import { moonPosition, sunPosition, wrap180 } from '../../lib/ephemeris'

const DEG = Math.PI / 180
/** The Sun returns to the same lunar node every 346.6 days: the length of the Moon's "year". */
const LUNAR_SEASON_YEAR_DAYS = 346.62

function TiltedGlobe({
  cx,
  cy,
  r,
  tiltDeg,
  color,
  label,
}: {
  cx: number
  cy: number
  r: number
  tiltDeg: number
  color: string
  label: string
}) {
  const ax = Math.sin(tiltDeg * DEG) * r * 1.5
  const ay = Math.cos(tiltDeg * DEG) * r * 1.5
  // north pole on the sunward (left) side in "summer"
  const pole = { x: cx - ax, y: cy - ay }
  // sunlight arrives horizontally from the left; at the pole its elevation equals the tilt
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} />
      <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} z`} fill="rgba(2,5,14,0.62)" transform={`rotate(0 ${cx} ${cy})`} />
      <line x1={cx + ax} y1={cy + ay} x2={pole.x} y2={pole.y} stroke="var(--accent-amber)" strokeWidth="1.6" />
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.25} fill="none" stroke="rgba(255,255,255,0.3)" transform={`rotate(${-tiltDeg} ${cx} ${cy})`} />
      {/* horizon at the pole and the Sun's elevation above it */}
      <line
        x1={pole.x - 40 * Math.cos(tiltDeg * DEG)}
        y1={pole.y - 40 * Math.sin(tiltDeg * DEG)}
        x2={pole.x + 40 * Math.cos(tiltDeg * DEG)}
        y2={pole.y + 40 * Math.sin(tiltDeg * DEG)}
        stroke="var(--text-faint)"
        strokeDasharray="3 3"
      />
      <line x1={pole.x} y1={pole.y} x2={pole.x - 46} y2={pole.y} stroke="var(--accent-amber)" strokeOpacity="0.7" />
      <text x={pole.x} y={pole.y - 16} textAnchor="middle" fill="var(--accent-amber)" fontSize="11">
        Sun at most {tiltDeg.toFixed(1)}° above the polar horizon
      </text>
      <text x={cx} y={cy + r * 1.5 + 22} textAnchor="middle" fill="var(--text-dim)" fontSize="12">
        {label}
      </text>
    </g>
  )
}

export function MoonSeasonsPanel({ jd }: { jd: number }) {
  const earth = bodyById.get('earth')!
  const moon = bodyById.get('moon')!
  const { subsolarLat, sunFromNode } = useMemo(() => {
    const sun = sunPosition(jd)
    const m = moonPosition(jd)
    const rel = wrap180(sun.lonDeg - m.nodeLonDeg)
    return { subsolarLat: MOON_AXIS_TILT_ECLIPTIC_DEG * Math.sin(rel * DEG), sunFromNode: rel }
  }, [jd])
  const north = subsolarLat >= 0

  return (
    <div className="panel diagram">
      <h3>Why the Moon has no seasons — and what that does to its poles</h3>
      <svg viewBox="0 0 700 250">
        <text x={20} y={20} fill="var(--text-faint)" fontSize="11">
          sunlight →
        </text>
        <TiltedGlobe cx={200} cy={120} r={40} tiltDeg={OBLIQUITY_DEG} color={earth.gradient?.[0] ?? earth.color} label="Earth at its June solstice: strong seasons" />
        <TiltedGlobe cx={500} cy={120} r={34} tiltDeg={MOON_AXIS_TILT_ECLIPTIC_DEG} color={moon.color} label="the Moon at its best: almost none" />
        {/* polar crater cross-section */}
        <g>
          <path d="M 590 228 L 620 228 L 630 212 L 660 212 L 670 228 L 695 228" fill="none" stroke="var(--text-dim)" strokeWidth="1.4" />
          <path d="M 630 212 L 660 212 L 670 228 L 620 228 z" fill="rgba(77,216,255,0.15)" />
          <line x1={560} y1={210} x2={660} y2={212} stroke="var(--accent-amber)" strokeOpacity="0.7" />
          <text x={642} y={246} textAnchor="middle" fill="var(--text-faint)" fontSize="9">
            polar crater: floor never lit
          </text>
        </g>
      </svg>
      <dl className="kv">
        <dt>Sun over the Moon today</dt>
        <dd>
          {Math.abs(subsolarLat).toFixed(2)}° {north ? 'north' : 'south'} of the lunar equator — the{' '}
          {north ? 'northern' : 'southern'} hemisphere&apos;s faint &ldquo;summer&rdquo;
        </dd>
        <dt>Lunar year</dt>
        <dd>
          the Sun swings between ±{MOON_AXIS_TILT_ECLIPTIC_DEG}° of the lunar equator every{' '}
          {LUNAR_SEASON_YEAR_DAYS} days (it is {Math.abs(sunFromNode).toFixed(0)}° past a node right now)
        </dd>
      </dl>
      <p className="caption">
        Earth&apos;s 23.4° tilt lifts the summer Sun 23° above the horizon at the pole and drops it
        below for the whole winter — that is what seasons are. The Moon&apos;s spin axis leans only{' '}
        {MOON_AXIS_TILT_ECLIPTIC_DEG}°, so the Sun never climbs more than 1.5° above a polar horizon,
        nor sinks more than 1.5° below it. The consequences are extreme: the floors of deep craters
        near the poles (Shackleton, Shoemaker, Haworth) have not seen sunlight for billions of years
        and stay below −200 °C, cold enough to trap water ice — the reason Artemis targets the south
        pole. A few crater rims nearby are lit for 80–90% of the year, the &ldquo;peaks of eternal
        light&rdquo;, prime real estate for solar-powered bases.
      </p>
    </div>
  )
}
