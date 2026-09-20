import { useMemo } from 'react'
import { MOON_ORBIT_INCLINATION_DEG, OBLIQUITY_DEG } from '../../data/orbits'
import { formatJd } from '../../lib/dates'
import { nodalCycle } from '../../lib/libration'

const DEG = Math.PI / 180
const CYCLE_YEARS = 18.61
const W = 700
const H = 250
const X0 = 60
const X1 = 640
const Y_TOP = 40
const Y_BOT = 190

function tiltAtNode(nDeg: number): number {
  const eps = OBLIQUITY_DEG * DEG
  const i = MOON_ORBIT_INCLINATION_DEG * DEG
  return Math.acos(Math.cos(eps) * Math.cos(i) - Math.sin(eps) * Math.sin(i) * Math.cos(nDeg * DEG)) / DEG
}

export function MoonNodalPanel({ jd }: { jd: number }) {
  const cycle = useMemo(() => nodalCycle(jd), [jd])
  const tMin = OBLIQUITY_DEG - MOON_ORBIT_INCLINATION_DEG
  const tMax = OBLIQUITY_DEG + MOON_ORBIT_INCLINATION_DEG
  const yOf = (tilt: number) => Y_BOT - ((tilt - tMin) / (tMax - tMin)) * (Y_BOT - Y_TOP)
  // one full cycle, starting one year before the last major standstill
  const start = cycle.lastMajor.jd - 365.25
  const span = (CYCLE_YEARS + 2) * 365.25
  const xOf = (t: number) => X0 + ((t - start) / span) * (X1 - X0)
  const curve = Array.from({ length: 121 }, (_, k) => {
    const t = start + (span * k) / 120
    const n = cycle.nodeLonDeg - 0.0529538083 * (t - jd)
    return `${k === 0 ? 'M' : 'L'} ${xOf(t).toFixed(1)} ${yOf(tiltAtNode(n)).toFixed(1)}`
  }).join(' ')
  const yearOf = (t: number) => new Date((t - 2440587.5) * 86_400_000).getUTCFullYear()
  const nextMajor2 = cycle.nextMajor.jd
  const ticks = Array.from({ length: 6 }, (_, k) => start + (span * k) / 5)

  return (
    <div className="panel diagram">
      <h3>The 18.6-year swing — where the Moon rises and sets</h3>
      <svg viewBox={`0 0 ${W} ${H}`}>
        {[tMin, OBLIQUITY_DEG, tMax].map((t) => (
          <g key={t}>
            <line x1={X0} y1={yOf(t)} x2={X1} y2={yOf(t)} stroke="var(--line)" strokeDasharray="3 4" />
            <text x={X0 - 6} y={yOf(t) + 4} textAnchor="end" fill="var(--text-faint)" fontSize="10">
              ±{t.toFixed(1)}°
            </text>
          </g>
        ))}
        <text x={X1} y={yOf(tMax) - 8} textAnchor="end" fill="var(--accent-amber)" fontSize="11">
          major standstill — widest swing ({yearOf(cycle.lastMajor.jd)}, {yearOf(nextMajor2)})
        </text>
        <text x={X1} y={yOf(tMin) + 16} textAnchor="end" fill="var(--accent-cyan)" fontSize="11">
          minor standstill — narrowest swing ({yearOf(cycle.nextMinor.jd)})
        </text>
        <path d={curve} fill="none" stroke="var(--text-dim)" strokeWidth="1.6" />
        {ticks.map((t) => (
          <text key={t} x={xOf(t)} y={Y_BOT + 26} textAnchor="middle" fill="var(--text-faint)" fontSize="10">
            {yearOf(t)}
          </text>
        ))}
        {/* today */}
        <line x1={xOf(jd)} y1={Y_TOP - 6} x2={xOf(jd)} y2={Y_BOT + 6} stroke="var(--accent-cyan)" strokeDasharray="3 3" />
        <circle cx={xOf(jd)} cy={yOf(cycle.pathTiltDeg)} r={5} fill="var(--accent-cyan)" />
        <text x={xOf(jd) + 8} y={yOf(cycle.pathTiltDeg) - 8} fill="var(--accent-cyan)" fontSize="12" fontWeight="600">
          today: ±{cycle.pathTiltDeg.toFixed(1)}°
        </text>
        <text x={W / 2} y={H - 4} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
          how far north and south of the celestial equator the Moon ranges each month
        </text>
      </svg>
      <p className="caption">
        The Sun ranges ±23.4° from the celestial equator over a year. The Moon follows the same
        ecliptic path but 5.1° off it, and which way that 5.1° points depends on the nodes, which
        drift all the way round every {CYCLE_YEARS} years. When the ascending node lines up with the
        March equinox the tilts add: the Moon swings ±{tMax.toFixed(1)}°, rising and setting farther
        north and south than the Sun ever does — a <strong>major lunar standstill</strong>, last
        seen around {formatJd(cycle.lastMajor.jd)}. Nine years later they subtract, ±{tMin.toFixed(1)}°,
        the <strong>minor standstill</strong> due {formatJd(cycle.nextMinor.jd)}. The next major
        standstill comes {formatJd(cycle.nextMajor.jd)}. Stone-age astronomers marked these extremes
        at sites like Callanish and Stonehenge.
      </p>
    </div>
  )
}
