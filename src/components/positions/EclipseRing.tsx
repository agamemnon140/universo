import { useMemo } from 'react'
import { bodyById } from '../../data'
import { formatDays, formatJd } from '../../lib/dates'
import { ECLIPSE_CORE_DEG, ECLIPSE_WINDOW_DEG } from '../../lib/eclipses'
import { moonPhase, moonPosition, sunPosition, wrap360 } from '../../lib/ephemeris'

const W = 700
const H = 420
const CX = 350
const CY = 205
const R = 165
const DEG = Math.PI / 180
/** The Sun gains on the regressing node at this rate, degrees per day. */
const SUN_VS_NODE_DEG_PER_DAY = 0.9856 + 0.0529538
/** Eclipse year: the Sun returns to the same node every 346.62 days. */
const ECLIPSE_YEAR_DAYS = 346.62

function pt(lonDeg: number, r: number) {
  return { x: CX + r * Math.cos(lonDeg * DEG), y: CY - r * Math.sin(lonDeg * DEG) }
}

function sector(lonCentre: number, halfWidth: number, r: number): string {
  const a = pt(lonCentre - halfWidth, r)
  const b = pt(lonCentre + halfWidth, r)
  return `M ${CX} ${CY} L ${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${r} ${r} 0 0 0 ${b.x.toFixed(1)} ${b.y.toFixed(1)} z`
}

export function EclipseRing({ jd }: { jd: number }) {
  const sunBody = bodyById.get('sun')!
  const moonBody = bodyById.get('moon')!
  const { sun, moon, phase } = useMemo(
    () => ({ sun: sunPosition(jd), moon: moonPosition(jd), phase: moonPhase(jd) }),
    [jd],
  )
  const N = moon.nodeLonDeg
  const x = wrap360(sun.lonDeg - N) // Sun's angle past the ascending node
  const inWindow = (a: number) => a <= ECLIPSE_WINDOW_DEG || a >= 360 - ECLIPSE_WINDOW_DEG
  const inSeason = inWindow(x) || inWindow(wrap360(x - 180))
  // when does the current season end / the next one start?
  const rel = inWindow(x) ? x : wrap360(x - 180)
  const seasonEndsIn = inSeason ? (ECLIPSE_WINDOW_DEG - (rel > 180 ? rel - 360 : rel)) / SUN_VS_NODE_DEG_PER_DAY : 0
  const nextStartAngle = x < 180 - ECLIPSE_WINDOW_DEG ? 180 - ECLIPSE_WINDOW_DEG : x < 360 - ECLIPSE_WINDOW_DEG ? 360 - ECLIPSE_WINDOW_DEG : 540 - ECLIPSE_WINDOW_DEG
  const nextStartIn = inSeason ? seasonEndsIn + (180 - 2 * ECLIPSE_WINDOW_DEG) / SUN_VS_NODE_DEG_PER_DAY : (nextStartAngle - x) / SUN_VS_NODE_DEG_PER_DAY

  const sunP = pt(sun.lonDeg, R)
  const moonP = pt(moon.lonDeg, R - 34)
  const newP = pt(sun.lonDeg, R - 34)
  const fullP = pt(sun.lonDeg + 180, R - 34)
  const asc = pt(N, R + 14)
  const desc = pt(N + 180, R + 14)

  return (
    <div className="panel diagram">
      <h3>Eclipse seasons — the Sun and the line of nodes</h3>
      <svg viewBox={`0 0 ${W} ${H}`}>
        {/* eclipse windows around both nodes */}
        {[N, N + 180].map((c, k) => (
          <g key={k}>
            <path d={sector(c, ECLIPSE_WINDOW_DEG, R + 6)} fill="rgba(255,184,77,0.10)" />
            <path d={sector(c, ECLIPSE_CORE_DEG, R + 6)} fill="rgba(255,184,77,0.14)" />
          </g>
        ))}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--line-strong)" />
        <circle cx={CX} cy={CY} r={R - 34} fill="none" stroke="var(--line)" strokeDasharray="3 5" />
        {/* line of nodes */}
        <line x1={asc.x} y1={asc.y} x2={desc.x} y2={desc.y} stroke="var(--accent-amber)" strokeOpacity="0.6" strokeDasharray="6 4" />
        <text x={pt(N, R + 30).x} y={pt(N, R + 30).y + 4} textAnchor="middle" fill="var(--accent-amber)" fontSize="13">
          ☊
        </text>
        <text x={pt(N + 180, R + 30).x} y={pt(N + 180, R + 30).y + 4} textAnchor="middle" fill="var(--accent-amber)" fontSize="13">
          ☋
        </text>
        {/* Earth */}
        <circle cx={CX} cy={CY} r={10} fill={bodyById.get('earth')!.color} />
        {/* Sun and its opposite point */}
        <line x1={CX} y1={CY} x2={sunP.x} y2={sunP.y} stroke={sunBody.color} strokeOpacity="0.35" />
        <circle cx={sunP.x} cy={sunP.y} r={11} fill={sunBody.color} style={{ filter: `drop-shadow(0 0 8px ${sunBody.color})` }} />
        <text x={pt(sun.lonDeg, R + 32).x} y={pt(sun.lonDeg, R + 32).y + 4} textAnchor="middle" fill="var(--text-dim)" fontSize="11">
          Sun {Math.round(sun.lonDeg)}°
        </text>
        <circle cx={newP.x} cy={newP.y} r={5} fill="none" stroke="var(--text-faint)" strokeDasharray="2 2" />
        <circle cx={fullP.x} cy={fullP.y} r={5} fill="none" stroke="var(--text-faint)" strokeDasharray="2 2" />
        <text x={fullP.x} y={fullP.y + 18} textAnchor="middle" fill="var(--text-faint)" fontSize="10">
          full Moon spot
        </text>
        <text x={newP.x} y={newP.y + 18} textAnchor="middle" fill="var(--text-faint)" fontSize="10">
          new Moon spot
        </text>
        {/* Moon */}
        <circle cx={moonP.x} cy={moonP.y} r={6} fill={moonBody.color} style={{ filter: `drop-shadow(0 0 4px ${moonBody.color})` }} />
        <text x={moonP.x} y={moonP.y + 18} textAnchor="middle" fill="var(--text-dim)" fontSize="11">
          Moon · {phase.name.toLowerCase()}
        </text>
        {/* reference */}
        <text x={CX + R + 40} y={CY + 4} fill="var(--text-faint)" fontSize="10">
          ♈ 0°
        </text>
        <text x={CX} y={H - 8} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
          seen from ecliptic north · amber wedges: a new or full Moon here can be an eclipse (inner wedge: almost certainly)
        </text>
      </svg>
      <dl className="kv">
        <dt>Right now</dt>
        <dd>
          the Sun is {Math.min(x, 360 - x, Math.abs(x - 180)).toFixed(0)}° from the nearest node —{' '}
          {inSeason ? (
            <>
              <strong>eclipse season</strong>, ending in {formatDays(seasonEndsIn)} (
              {formatJd(jd + seasonEndsIn)})
            </>
          ) : (
            <>
              not eclipse season; the next one opens in {formatDays(nextStartIn)} ({formatJd(jd + nextStartIn)})
            </>
          )}
        </dd>
        <dt>Rhythm</dt>
        <dd>
          the Sun passes a node every {ECLIPSE_YEAR_DAYS / 2} days — two eclipse seasons a year, each about
          34 days long; the nodes drift backward, so seasons come ~19 days earlier each year
        </dd>
      </dl>
      <p className="caption">
        Press play and watch: the Sun circles the ring once a year while the line of nodes turns slowly the
        other way. Eclipses happen only when a new Moon (solar) or a full Moon (lunar) falls while the Sun
        sits inside an amber wedge — otherwise the Moon passes above or below the shadows, as the tilted-orbit
        view shows. Every eclipse season brings at least one solar and usually one lunar eclipse, about two
        weeks apart.
      </p>
    </div>
  )
}
