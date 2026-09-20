import { useMemo } from 'react'
import { formatJd } from '../../lib/dates'
import { eclipsesBetween, type Eclipse } from '../../lib/eclipses'

const YEARS = 20
/** One saros: 223 synodic months = 6585.32 days = 18 y 11 d 8 h. */
const SAROS_DAYS = 6585.3211
const W = 700
const H = 310
const X0 = 46
const X1 = 676
const Y_SOLAR = 96
const Y_LUNAR = 190

function markerStyle(e: Eclipse): { r: number; fill: string; opacity: number } {
  const amber = 'var(--accent-amber)'
  const cyan = 'var(--accent-cyan)'
  const c = e.kind === 'solar' ? amber : cyan
  if (e.cls === 'total') return { r: 6, fill: c, opacity: 1 }
  if (e.cls === 'annular' || e.cls === 'hybrid') return { r: 5.5, fill: c, opacity: 0.75 }
  if (e.cls === 'partial') return { r: 4.5, fill: c, opacity: 0.55 }
  return { r: 3, fill: c, opacity: 0.35 }
}

export function EclipseRhythmPanel({ jd, onJump }: { jd: number; onJump: (jd: number) => void }) {
  const bucket = Math.floor(jd / 30.44)
  const list = useMemo(() => eclipsesBetween(bucket * 30.44, bucket * 30.44 + YEARS * 365.25), [bucket])
  const start = bucket * 30.44
  const xOf = (t: number) => X0 + ((t - start) / (YEARS * 365.25)) * (X1 - X0)
  const yearOf = (t: number) => new Date((t - 2440587.5) * 86_400_000).getUTCFullYear()

  const lunar = list.filter((e) => e.kind === 'lunar')
  const solar = list.filter((e) => e.kind === 'solar')
  const umbral = lunar.filter((e) => e.cls !== 'penumbral')
  const totalLunar = lunar.filter((e) => e.cls === 'total')

  // saros partners: the first eclipse of each kind and its repeat one saros later
  const partner = (e: Eclipse | undefined) =>
    e ? list.find((x) => x.kind === e.kind && Math.abs(x.jd - (e.jd + SAROS_DAYS)) < 1.5) : undefined
  const firstLunar = lunar.find((e) => e.jd >= jd)
  const firstSolar = solar.find((e) => e.jd >= jd)
  const lunarNext = partner(firstLunar)
  const solarNext = partner(firstSolar)

  // the ~6-month beat: gaps between the first few lunar eclipses after the date
  const upcomingLunar = lunar.filter((e) => e.jd >= jd).slice(0, 4)
  const gaps = upcomingLunar.slice(1).map((e, k) => ({ a: upcomingLunar[k], b: e, days: e.jd - upcomingLunar[k].jd }))

  const yearTicks: number[] = []
  for (let y = yearOf(start) + 1; y <= yearOf(start + YEARS * 365.25); y += 2) {
    yearTicks.push(Date.UTC(y, 0, 1) / 86_400_000 + 2440587.5)
  }

  const link = (a: Eclipse | undefined, b: Eclipse | undefined, y: number, dir: 1 | -1, label: string) => {
    if (!a || !b) return null
    const xa = xOf(a.jd)
    const xb = xOf(b.jd)
    const yc = y + dir * 60
    return (
      <g>
        <path d={`M ${xa} ${y + dir * 8} Q ${(xa + xb) / 2} ${yc} ${xb} ${y + dir * 8}`} fill="none" stroke="var(--text-dim)" strokeDasharray="4 3" />
        <text x={(xa + xb) / 2} y={y + dir * 38 + (dir === 1 ? 4 : 0)} textAnchor="middle" fill="var(--text-dim)" fontSize="11">
          {label}
        </text>
      </g>
    )
  }

  return (
    <div className="panel diagram">
      <h3>The rhythm of eclipses — a 6-month beat and an 18-year echo</h3>
      <svg viewBox={`0 0 ${W} ${H}`}>
        {yearTicks.map((t) => (
          <g key={t}>
            <line x1={xOf(t)} y1={Y_SOLAR - 14} x2={xOf(t)} y2={Y_LUNAR + 14} stroke="var(--line)" />
            <text x={xOf(t)} y={(Y_SOLAR + Y_LUNAR) / 2 + 4} textAnchor="middle" fill="var(--text-faint)" fontSize="10">
              {yearOf(t)}
            </text>
          </g>
        ))}
        <line x1={X0} y1={Y_SOLAR} x2={X1} y2={Y_SOLAR} stroke="var(--line-strong)" />
        <line x1={X0} y1={Y_LUNAR} x2={X1} y2={Y_LUNAR} stroke="var(--line-strong)" />
        <text x={X0} y={16} fill="var(--accent-amber)" fontSize="11">
          ☉ solar eclipses (new Moon)
        </text>
        <text x={X0} y={H - 8} fill="var(--accent-cyan)" fontSize="11">
          ☾ lunar eclipses (full Moon) · big dot = total, medium = partial / annular, small = penumbral · tap a dot to jump there
        </text>
        {/* today */}
        <line x1={xOf(jd)} y1={Y_SOLAR - 14} x2={xOf(jd)} y2={Y_LUNAR + 14} stroke="var(--accent-cyan)" strokeDasharray="3 3" />
        {list.map((e) => {
          const s = markerStyle(e)
          const y = e.kind === 'solar' ? Y_SOLAR : Y_LUNAR
          return (
            <g key={e.jd} className="map-star" onClick={() => onJump(e.jd)}>
              <circle cx={xOf(e.jd)} cy={y} r={s.r} fill={s.fill} opacity={s.opacity} />
              <circle cx={xOf(e.jd)} cy={y} r={9} fill="transparent">
                <title>{`${formatJd(e.jd)} — ${e.cls} ${e.kind}`}</title>
              </circle>
            </g>
          )
        })}
        {/* six-month beat */}
        {gaps.map((g, k) => (
          <path
            key={k}
            d={`M ${xOf(g.a.jd)} ${Y_LUNAR - 8} Q ${(xOf(g.a.jd) + xOf(g.b.jd)) / 2} ${Y_LUNAR - 30} ${xOf(g.b.jd)} ${Y_LUNAR - 8}`}
            fill="none"
            stroke="var(--accent-cyan)"
            strokeOpacity="0.7"
          />
        ))}
        {gaps.length > 0 && (
          <text x={xOf(gaps[gaps.length - 1].b.jd) + 10} y={Y_LUNAR - 22} fill="var(--accent-cyan)" fontSize="10">
            next gaps: {gaps.map((g) => Math.round(g.days)).join(' · ')} days
          </text>
        )}
        {/* saros links */}
        {link(firstSolar, solarNext, Y_SOLAR, -1, `one saros later: ${solarNext ? formatJd(solarNext.jd) : ''} — same geometry, 8 h later in the day`)}
        {link(firstLunar, lunarNext, Y_LUNAR, 1, `one saros later: ${lunarNext ? formatJd(lunarNext.jd) : ''}`)}
      </svg>
      <dl className="kv">
        <dt>In these {YEARS} years</dt>
        <dd>
          {lunar.length} lunar eclipses ({umbral.length} reach the umbra, {totalLunar.length} total) and {solar.length} solar —
          on average {(lunar.length / YEARS).toFixed(1)} lunar and {(solar.length / YEARS).toFixed(1)} solar per year
        </dd>
        <dt>The 6-month beat</dt>
        <dd>
          the Sun meets a node every 173.3 days, so eclipses come in seasons about 6 months apart — a full Moon
          inside a season enters Earth&apos;s shadow (at least the penumbra); the gaps between lunar eclipses are
          therefore 148 or 177 days, occasionally a season is skipped and the gap is a year
        </dd>
        <dt>The saros</dt>
        <dd>
          18 years 11 days 8 hours: 223 lunar months, 242 node-to-node months and 239 perigee-to-perigee months
          all fit into it, so Sun, Moon, node and distance line up again and the eclipse repeats almost exactly,
          shifted a third of the way round the globe by the extra 8 hours
        </dd>
      </dl>
      <p className="caption">
        Tap a dot to jump to that eclipse. A lunar eclipse is visible from the whole night side of Earth,
        which is why most people see several in a lifetime; a total solar eclipse touches a strip a few
        hundred kilometres wide, so from any one place they recur only every ~375 years. Each saros series
        lasts 12–15 centuries and 70-odd eclipses, drifting slowly from penumbral to total and back out.
      </p>
    </div>
  )
}
