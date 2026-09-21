import { useMemo, useState } from 'react'
import { MOON_ORBIT_INCLINATION_DEG } from '../../data/orbits'
import { formatJd } from '../../lib/dates'
import { classify, shadowGeometry, syzygiesBetween, type Syzygy } from '../../lib/eclipses'
import { moonPosition, sunPosition } from '../../lib/ephemeris'

const DEG = Math.PI / 180
const W = 700
const H = 340
const X0 = 54
const X1 = 676
const Y_MID = 160
const Y_SCALE = 24 // px per Earth radius
const YEARS_BEFORE = 1
const YEARS_AFTER = 4
/** Mean Earth–Moon distance in Earth radii: turns ecliptic latitude into an offset from the axis. */
const MEAN_DIST_RE = 60.27
/** Typical shadow limits at the Moon's distance, Earth radii (the exact ones vary a little). */
const LUNAR_UMBRAL = 1.01 // umbra radius + Moon radius
const LUNAR_PENUMBRAL = 1.56
const SOLAR_CENTRAL = 0.9972
const SOLAR_PARTIAL = 1.55

type Kind = 'full' | 'new'

interface Point {
  s: Syzygy
  gamma: number
  cls: string | null
}

export function EclipseCyclePanel({ jd, onJump }: { jd: number; onJump: (jd: number) => void }) {
  const [kind, setKind] = useState<Kind>('full')
  const t0 = jd - YEARS_BEFORE * 365.25
  const t1 = jd + YEARS_AFTER * 365.25
  const xOf = (t: number) => X0 + ((t - t0) / (t1 - t0)) * (X1 - X0)
  const yOf = (gamma: number) => Y_MID - gamma * Y_SCALE

  const { points, curve } = useMemo(() => {
    const points: Point[] = syzygiesBetween(t0, t1)
      .filter((s) => s.kind === kind)
      .map((s) => {
        const e = classify(s)
        return { s, gamma: shadowGeometry(s).gamma, cls: e ? e.cls : null }
      })
    // the offset the Moon would have if it were full (or new) at each instant: a slow sine
    // with the eclipse-year period, which the actual syzygies sample every 29.5 days
    const steps = 400
    const pts: string[] = []
    for (let k = 0; k <= steps; k++) {
      const t = t0 + ((t1 - t0) * k) / steps
      const sunLon = sunPosition(t).lonDeg
      const node = moonPosition(t).nodeLonDeg
      const lonAtSyzygy = kind === 'full' ? sunLon + 180 : sunLon
      const lat = MOON_ORBIT_INCLINATION_DEG * Math.sin((lonAtSyzygy - node) * DEG)
      const gamma = MEAN_DIST_RE * Math.sin(lat * DEG)
      pts.push(`${k === 0 ? 'M' : 'L'} ${xOf(t).toFixed(1)} ${yOf(gamma).toFixed(1)}`)
    }
    return { points, curve: pts.join(' ') }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.floor(jd / 30.44), kind])

  const yearOf = (t: number) => new Date((t - 2440587.5) * 86_400_000).getUTCFullYear()
  const yearTicks: number[] = []
  for (let y = yearOf(t0) + 1; y <= yearOf(t1); y++) yearTicks.push(Date.UTC(y, 0, 1) / 86_400_000 + 2440587.5)

  const inner = kind === 'full' ? LUNAR_UMBRAL : SOLAR_CENTRAL
  const outer = kind === 'full' ? LUNAR_PENUMBRAL : SOLAR_PARTIAL
  const color = kind === 'full' ? 'var(--accent-cyan)' : 'var(--accent-amber)'
  const eclipses = points.filter((p) => p.cls)

  return (
    <div className="panel diagram">
      <h3>How the Moon drifts in and out of the shadow&apos;s reach</h3>
      <div className="chips" style={{ margin: '0 8px 6px' }}>
        {(
          [
            ['full', '☾ full Moons → lunar eclipses'],
            ['new', '☉ new Moons → solar eclipses'],
          ] as [Kind, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            className={`chip${kind === id ? ' on' : ''}`}
            style={kind === id ? { background: id === 'full' ? 'var(--accent-cyan)' : 'var(--accent-amber)' } : undefined}
            onClick={() => setKind(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`}>
        {/* shadow bands */}
        <rect x={X0} y={yOf(outer)} width={X1 - X0} height={2 * outer * Y_SCALE} fill="rgba(120,150,255,0.10)" />
        <rect x={X0} y={yOf(inner)} width={X1 - X0} height={2 * inner * Y_SCALE} fill="rgba(2,5,14,0.6)" />
        {[
          { y: yOf(inner) + 12, text: kind === 'full' ? 'umbra: partial or total lunar eclipse' : 'central: total or annular solar eclipse', fill: 'var(--text-dim)' },
          { y: yOf(-outer) - 4, text: kind === 'full' ? 'penumbra: faint lunar eclipse' : 'penumbra: partial solar eclipse somewhere on Earth', fill: 'var(--text-faint)' },
        ].map((l) => (
          <g key={l.text}>
            <rect x={X1 - 8 - l.text.length * 5.2} y={l.y - 10} width={l.text.length * 5.2 + 8} height={14} rx={3} fill="var(--panel)" opacity="0.9" />
            <text x={X1 - 4} y={l.y} textAnchor="end" fill={l.fill} fontSize="10">
              {l.text}
            </text>
          </g>
        ))}
        {/* axis and grid */}
        <line x1={X0} y1={Y_MID} x2={X1} y2={Y_MID} stroke="var(--line-strong)" />
        {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((g) => (
          <g key={g}>
            <line x1={X0 - 4} y1={yOf(g)} x2={X0} y2={yOf(g)} stroke="var(--line-strong)" />
            <text x={X0 - 8} y={yOf(g) + 4} textAnchor="end" fill="var(--text-faint)" fontSize="10">
              {g > 0 ? `+${g}` : g}
            </text>
          </g>
        ))}
        <text x={X0 - 8} y={Y_MID + 4} textAnchor="end" fill="var(--text-dim)" fontSize="10">
          axis
        </text>
        <text x={14} y={Y_MID - 5 * Y_SCALE - 14} fill="var(--text-dim)" fontSize="11">
          north ↑ Earth radii from the shadow axis
        </text>
        {yearTicks.map((t) => (
          <g key={t}>
            <line x1={xOf(t)} y1={yOf(5.5)} x2={xOf(t)} y2={yOf(-5.5)} stroke="var(--line)" />
            <text x={xOf(t) + 3} y={yOf(-5.5) + 14} fill="var(--text-faint)" fontSize="10">
              {yearOf(t)}
            </text>
          </g>
        ))}
        {/* today */}
        <line x1={xOf(jd)} y1={yOf(5.5)} x2={xOf(jd)} y2={yOf(-5.5)} stroke="var(--accent-cyan)" strokeDasharray="3 3" />
        <text x={xOf(jd) + 4} y={yOf(5.5) + 10} fill="var(--accent-cyan)" fontSize="10">
          today
        </text>
        {/* the slow sine and the sampled syzygies */}
        <path d={curve} fill="none" stroke={color} strokeOpacity="0.45" strokeWidth="1.2" />
        {points.map((p) => (
          <g key={p.s.jd} className="map-star" onClick={() => onJump(p.s.jd)}>
            <circle
              cx={xOf(p.s.jd)}
              cy={yOf(p.gamma)}
              r={p.cls ? 5 : 3}
              fill={p.cls ? color : 'var(--bg-raised)'}
              stroke={color}
              strokeWidth={p.cls ? 0 : 1.2}
            />
            <circle cx={xOf(p.s.jd)} cy={yOf(p.gamma)} r={8} fill="transparent">
              <title>{`${formatJd(p.s.jd)} — ${kind} Moon, ${Math.abs(p.gamma).toFixed(2)} R⊕ ${p.gamma >= 0 ? 'north' : 'south'}${p.cls ? ` · ${p.cls} eclipse` : ''}`}</title>
            </circle>
          </g>
        ))}
        <text x={W / 2} y={H - 6} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
          each dot is one {kind} Moon (filled = eclipse) · the pale curve is where a {kind} Moon would fall at any instant · 1 R⊕ = 6,378 km
        </text>
      </svg>
      <p className="caption">
        The Moon crosses the ecliptic twice a month, but what matters is how far from the plane it is at
        the moment it is {kind === 'full' ? 'full' : 'new'}. Because the nodes drift, that offset follows
        a slow wave: it sweeps from about 5 Earth radii north to 5 south and back every{' '}
        <strong>346.6 days</strong> (the eclipse year), and each {kind} Moon samples the wave once every
        29.5 days. Twice per wave the samples fall inside the shadow band —{' '}
        {kind === 'full'
          ? 'the Moon enters Earth’s shadow and we get a lunar eclipse'
          : 'the Moon’s shadow reaches Earth and we get a solar eclipse'}
        ; the rest of the time it passes clear above or below.{' '}
        {eclipses.length > 0 && (
          <>
            In this window: {eclipses.length} {kind === 'full' ? 'lunar' : 'solar'} eclipses, the next on{' '}
            <strong>{formatJd((eclipses.find((p) => p.s.jd >= jd) ?? eclipses[eclipses.length - 1]).s.jd)}</strong>.
          </>
        )}{' '}
        Tap a dot to jump to that date.
      </p>
    </div>
  )
}
