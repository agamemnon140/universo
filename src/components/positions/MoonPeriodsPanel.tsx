import { useMemo } from 'react'
import { bodyById } from '../../data'
import { SIDEREAL_MONTH_DAYS, SYNODIC_MONTH_DAYS } from '../../data/orbits'
import { moonPhase } from '../../lib/ephemeris'

const DEG = Math.PI / 180

const MONTHS = [
  { name: 'Sidereal month', days: 27.321661, what: 'one orbit measured against the stars — and one full rotation of the Moon' },
  { name: 'Synodic month', days: 29.530589, what: 'new Moon to new Moon: the cycle of phases, and one lunar day' },
  { name: 'Anomalistic month', days: 27.554550, what: 'perigee to perigee: the rhythm of supermoons and strong tides' },
  { name: 'Draconic month', days: 27.212221, what: 'node to node: the rhythm that eclipses follow' },
  { name: 'Tropical month', days: 27.321582, what: 'equinox to equinox: a hair shorter than sidereal, thanks to precession' },
]

export function MoonPeriodsPanel({ jd }: { jd: number }) {
  const earth = bodyById.get('earth')!
  const moon = bodyById.get('moon')!
  const sun = bodyById.get('sun')!
  const phase = useMemo(() => moonPhase(jd), [jd])
  // where the date sits in the synodic cycle
  const cycle = phase.elongationDeg / 360

  // sidereal vs synodic figure
  const SX = 70
  const SY = 205
  const R_E = 260 // Earth's orbit radius on screen
  const ORB = 42 // Moon's orbit radius on screen
  const step = (SIDEREAL_MONTH_DAYS / 365.25) * 360 // how far Earth moves in a sidereal month, ~27°
  const e1 = { x: SX + R_E, y: SY }
  const e2 = { x: SX + R_E * Math.cos(step * DEG), y: SY - R_E * Math.sin(step * DEG) }
  const toSun2 = { x: (SX - e2.x) / R_E, y: (SY - e2.y) / R_E }
  const moonStar2 = { x: e2.x - ORB, y: e2.y } // same star direction as at e1
  const moonNew2 = { x: e2.x + ORB * toSun2.x, y: e2.y + ORB * toSun2.y }
  const arcPath = (() => {
    const pts: string[] = []
    for (let k = 0; k <= 20; k++) {
      const a = -6 + ((step + 12) * k) / 20
      pts.push(`${k === 0 ? 'M' : 'L'} ${(SX + R_E * Math.cos(a * DEG)).toFixed(1)} ${(SY - R_E * Math.sin(a * DEG)).toFixed(1)}`)
    }
    return pts.join(' ')
  })()

  return (
    <div className="panel diagram">
      <h3>Months, days and the locked spin</h3>
      <svg viewBox="0 0 700 330">
        <text x={350} y={18} textAnchor="middle" fill="var(--text-dim)" fontSize="12">
          Why the phases take 29.5 days when one orbit takes 27.3
        </text>
        <circle cx={SX} cy={SY} r={16} fill={sun.color} style={{ filter: `drop-shadow(0 0 8px ${sun.color})` }} />
        <path d={arcPath} fill="none" stroke="var(--line-strong)" strokeDasharray="4 4" />
        {/* position 1: new Moon */}
        <circle cx={e1.x} cy={e1.y} r={ORB} fill="none" stroke="var(--line)" />
        <circle cx={e1.x} cy={e1.y} r={9} fill={earth.color} />
        <circle cx={e1.x - ORB} cy={e1.y} r={5} fill={moon.color} />
        <line x1={e1.x - ORB - 10} y1={e1.y} x2={e1.x - ORB - 60} y2={e1.y} stroke="var(--text-faint)" markerEnd="url(#star-arrow)" />
        <text x={e1.x + 30} y={e1.y + ORB + 18} textAnchor="middle" fill="var(--text-dim)" fontSize="11">
          day 0 · new Moon, in line with the Sun
        </text>
        <text x={e1.x - ORB - 62} y={e1.y - 6} textAnchor="end" fill="var(--text-faint)" fontSize="10">
          to a distant star
        </text>
        {/* position 2 */}
        <circle cx={e2.x} cy={e2.y} r={ORB} fill="none" stroke="var(--line)" />
        <circle cx={e2.x} cy={e2.y} r={9} fill={earth.color} />
        <circle cx={moonStar2.x} cy={moonStar2.y} r={5} fill={moon.color} opacity="0.5" />
        <line x1={moonStar2.x - 10} y1={moonStar2.y} x2={moonStar2.x - 60} y2={moonStar2.y} stroke="var(--text-faint)" markerEnd="url(#star-arrow)" />
        <circle cx={moonNew2.x} cy={moonNew2.y} r={5} fill={moon.color} />
        <line x1={e2.x} y1={e2.y} x2={SX} y2={SY} stroke={sun.color} strokeOpacity="0.25" strokeDasharray="3 3" />
        <path
          d={`M ${moonStar2.x} ${moonStar2.y} A ${ORB} ${ORB} 0 0 1 ${moonNew2.x} ${moonNew2.y}`}
          fill="none"
          stroke="var(--accent-amber)"
          strokeWidth="1.6"
        />
        <text x={e2.x + ORB + 18} y={e2.y - 12} fill="var(--text-dim)" fontSize="11">
          day 27.3 · Moon back in the same star direction (sidereal month done)
        </text>
        <text x={e2.x + ORB + 18} y={e2.y + 6} fill="var(--accent-amber)" fontSize="11">
          +{step.toFixed(0)}° more, 2.2 days, to line up with the Sun again → day 29.5
        </text>
        <defs>
          <marker id="star-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-faint)" />
          </marker>
        </defs>
        {/* today's place in the synodic cycle */}
        <rect x={60} y={290} width={580} height={8} rx={4} fill="var(--line)" />
        <rect x={60} y={290} width={580 * cycle} height={8} rx={4} fill="var(--accent-cyan)" />
        <text x={60} y={282} fill="var(--text-faint)" fontSize="10">
          new Moon
        </text>
        <text x={350} y={282} textAnchor="middle" fill="var(--text-faint)" fontSize="10">
          full Moon
        </text>
        <text x={640} y={282} textAnchor="end" fill="var(--text-faint)" fontSize="10">
          new Moon
        </text>
        <text x={350} y={318} textAnchor="middle" fill="var(--text-dim)" fontSize="11">
          today: day {phase.ageDays.toFixed(1)} of {SYNODIC_MONTH_DAYS.toFixed(1)} · {phase.name}
        </text>
      </svg>

      <svg viewBox="0 0 700 230">
        {[
          { cx: 180, title: 'tidally locked: spins once per orbit', locked: true },
          { cx: 520, title: 'if the Moon did not spin at all', locked: false },
        ].map((sys) => (
          <g key={sys.title}>
            <text x={sys.cx} y={18} textAnchor="middle" fill="var(--text-dim)" fontSize="12">
              {sys.title}
            </text>
            <circle cx={sys.cx} cy={125} r={70} fill="none" stroke="var(--line-strong)" strokeDasharray="3 4" />
            <circle cx={sys.cx} cy={125} r={12} fill={earth.color} />
            {[0, 90, 180, 270].map((a) => {
              const mx = sys.cx + 70 * Math.cos(a * DEG)
              const my = 125 - 70 * Math.sin(a * DEG)
              // the marked spot sits on the Earth-facing side when locked; fixed direction otherwise
              const dir = sys.locked ? { x: -Math.cos(a * DEG), y: Math.sin(a * DEG) } : { x: -1, y: 0 }
              return (
                <g key={a}>
                  <circle cx={mx} cy={my} r={14} fill={moon.color} />
                  <circle cx={mx + 9 * dir.x} cy={my + 9 * dir.y} r={3.5} fill="#d1603d" />
                </g>
              )
            })}
            <text x={sys.cx} y={218} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
              {sys.locked ? 'the red spot always faces Earth — we never see the far side' : 'the spot would face Earth only once per orbit'}
            </text>
          </g>
        ))}
      </svg>

      <div className="table-scroll">
        <table className="planet-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Days</th>
              <th>Hours</th>
              <th>What it measures</th>
            </tr>
          </thead>
          <tbody>
            {MONTHS.map((m) => (
              <tr key={m.name}>
                <td>{m.name}</td>
                <td>{m.days.toFixed(3)}</td>
                <td>{(m.days * 24).toFixed(1)}</td>
                <td style={{ color: 'var(--text-dim)' }}>{m.what}</td>
              </tr>
            ))}
            <tr>
              <td>Lunar rotation</td>
              <td>{SIDEREAL_MONTH_DAYS.toFixed(3)}</td>
              <td>{(SIDEREAL_MONTH_DAYS * 24).toFixed(1)}</td>
              <td style={{ color: 'var(--text-dim)' }}>one turn on its axis — identical to the sidereal month (Earth: 23.9 h)</td>
            </tr>
            <tr>
              <td>Lunar solar day</td>
              <td>{SYNODIC_MONTH_DAYS.toFixed(3)}</td>
              <td>{(SYNODIC_MONTH_DAYS * 24).toFixed(1)}</td>
              <td style={{ color: 'var(--text-dim)' }}>noon to noon anywhere on the Moon (Earth: 24.0 h)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="caption">
        Earth&apos;s tides braked the Moon&apos;s spin long ago until one rotation took exactly one
        orbit, {SIDEREAL_MONTH_DAYS.toFixed(2)} days. Because Earth keeps moving around the Sun, the Moon
        needs an extra 2.2 days after each orbit to catch up with the Sun&apos;s direction, so the
        phases — and the lunar day — repeat every {SYNODIC_MONTH_DAYS.toFixed(2)} days. The other months
        differ by fractions of a day because the perigee drifts forward and the nodes drift backward.
      </p>
    </div>
  )
}
