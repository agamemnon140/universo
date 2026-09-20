import { useMemo, useState } from 'react'
import { bodyById } from '../../data'
import { formatJdTime } from '../../lib/dates'
import { classify, findSyzygy, shadowGeometry, type Syzygy, type SyzygyKind } from '../../lib/eclipses'
import { formatNumber } from '../../lib/format'

const W = 700
const H = 320
const CY = 150
const PX_PER_RE = 38 // vertical scale: one Earth radius
const MOON_RE = 1737.4 / 6378.14

type Pick = 'next' | 'new' | 'full'

function SunRays() {
  const sun = bodyById.get('sun')!
  return (
    <g>
      {[-100, -60, -20, 20, 60, 100].map((dy) => (
        <line key={dy} x1={10} y1={CY + dy} x2={70} y2={CY + dy} stroke={sun.color} strokeOpacity="0.45" />
      ))}
      <text x={12} y={CY - 112} fill={sun.color} fillOpacity="0.8" fontSize="11">
        sunlight
      </text>
    </g>
  )
}

export function ShadowGeometry({ jd }: { jd: number }) {
  const [pick, setPick] = useState<Pick>('next')
  const earth = bodyById.get('earth')!
  const moonBody = bodyById.get('moon')!

  const { syzygy, eclipse, geo } = useMemo(() => {
    const kind: SyzygyKind | undefined = pick === 'next' ? undefined : pick
    const s: Syzygy = findSyzygy(jd - 0.5, 1, kind)
    return { syzygy: s, eclipse: classify(s), geo: shadowGeometry(s) }
  }, [jd, pick])

  const solar = syzygy.kind === 'new'
  const gy = CY - geo.gamma * PX_PER_RE // shadow-axis / Moon offset on screen, north up
  const moonPx = MOON_RE * PX_PER_RE

  // solar: Moon at x=250 casts its cones toward Earth at x=540
  // lunar: Earth at x=200 casts its cones toward the Moon at x=560
  const XM = solar ? 250 : 560
  const XE = solar ? 540 : 200

  return (
    <div className="panel diagram">
      <h3>Shadow geometry at the coming {solar ? 'new' : 'full'} Moon</h3>
      <div className="chips" style={{ margin: '0 8px 6px' }}>
        {(
          [
            ['next', 'Next new or full Moon'],
            ['new', 'Next new Moon (solar)'],
            ['full', 'Next full Moon (lunar)'],
          ] as [Pick, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            className={`chip${pick === id ? ' on' : ''}`}
            style={pick === id ? { background: 'var(--accent-cyan)' } : undefined}
            onClick={() => setPick(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`}>
        <SunRays />
        <line x1={80} y1={CY} x2={W - 20} y2={CY} stroke="var(--line)" strokeDasharray="3 5" />
        <text x={W - 22} y={CY - 6} textAnchor="end" fill="var(--text-faint)" fontSize="10">
          ecliptic plane
        </text>

        {solar ? (
          <g>
            {/* penumbra (diverging) and umbra (converging) from the Moon's edges */}
            <polygon
              points={`${XM},${gy - moonPx} ${XE},${gy - geo.penumbraRadius * PX_PER_RE} ${XE},${gy + geo.penumbraRadius * PX_PER_RE} ${XM},${gy + moonPx}`}
              fill="rgba(120,150,255,0.10)"
            />
            <polygon
              points={`${XM},${gy - moonPx} ${XE},${gy - geo.umbraRadius * PX_PER_RE} ${XE},${gy + geo.umbraRadius * PX_PER_RE} ${XM},${gy + moonPx}`}
              fill="rgba(2,5,14,0.75)"
            />
            <circle cx={XM} cy={gy} r={moonPx} fill={moonBody.color} />
            <circle cx={XE} cy={CY} r={PX_PER_RE} fill={earth.gradient?.[1] ?? earth.color} />
            <text x={XM} y={gy - moonPx - 8} textAnchor="middle" fill="var(--text-dim)" fontSize="11">
              Moon
            </text>
            <text x={XE} y={CY + PX_PER_RE + 16} textAnchor="middle" fill="var(--text-dim)" fontSize="11">
              Earth
            </text>
            <text x={(XM + XE) / 2} y={gy - geo.penumbraRadius * PX_PER_RE - 14} textAnchor="middle" fill="var(--text-faint)" fontSize="10">
              penumbra (partial eclipse where it lands)
            </text>
            <text x={(XM + XE) / 2} y={gy + geo.penumbraRadius * PX_PER_RE + 22} textAnchor="middle" fill="var(--text-faint)" fontSize="10">
              umbra: {geo.umbraRadius > 0 ? 'reaches Earth → total' : 'ends short of Earth → annular'}
            </text>
          </g>
        ) : (
          <g>
            <polygon
              points={`${XE},${CY - PX_PER_RE} ${XM},${CY - geo.penumbraRadius * PX_PER_RE} ${XM},${CY + geo.penumbraRadius * PX_PER_RE} ${XE},${CY + PX_PER_RE}`}
              fill="rgba(120,150,255,0.10)"
            />
            <polygon
              points={`${XE},${CY - PX_PER_RE} ${XM},${CY - geo.umbraRadius * PX_PER_RE} ${XM},${CY + geo.umbraRadius * PX_PER_RE} ${XE},${CY + PX_PER_RE}`}
              fill="rgba(2,5,14,0.75)"
            />
            <circle cx={XE} cy={CY} r={PX_PER_RE} fill={earth.gradient?.[1] ?? earth.color} />
            <circle cx={XM} cy={gy} r={moonPx} fill={moonBody.color} style={{ filter: `drop-shadow(0 0 4px ${moonBody.color})` }} />
            <text x={XE} y={CY + PX_PER_RE + 16} textAnchor="middle" fill="var(--text-dim)" fontSize="11">
              Earth
            </text>
            <text x={XM + moonPx + 6} y={gy + 4} fill="var(--text-dim)" fontSize="11">
              Moon
            </text>
            <text x={(XM + XE) / 2} y={CY - geo.penumbraRadius * PX_PER_RE - 24} textAnchor="middle" fill="var(--text-faint)" fontSize="10">
              penumbra
            </text>
            <text x={(XM + XE) / 2} y={CY + 4} textAnchor="middle" fill="var(--text-dim)" fontSize="10">
              umbra
            </text>
          </g>
        )}

        {/* the offset */}
        <line x1={XM + 26} y1={CY} x2={XM + 26} y2={gy} stroke="var(--accent-cyan)" strokeDasharray="3 3" />
        <text x={XM + 32} y={(CY + gy) / 2 + 4} fill="var(--accent-cyan)" fontSize="11">
          γ = {geo.gamma.toFixed(2)} R⊕
        </text>
        <text x={W / 2} y={H - 6} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
          heights to scale (1 Earth radius = {PX_PER_RE} px) · the Earth–Moon distance is squeezed sideways
        </text>
      </svg>
      <p className="caption">
        <strong>{formatJdTime(syzygy.jd)}</strong> — {solar ? 'new' : 'full'} Moon,{' '}
        {Math.abs(syzygy.moonLatDeg).toFixed(2)}° {syzygy.moonLatDeg >= 0 ? 'north' : 'south'} of the ecliptic,{' '}
        {formatNumber(Math.round(syzygy.moonDistKm))} km from Earth.{' '}
        {eclipse ? (
          <>
            The shadow axis passes {Math.abs(eclipse.gamma).toFixed(2)} Earth radii {eclipse.gamma >= 0 ? 'north' : 'south'} of{' '}
            {solar ? "Earth's centre" : "the Moon's centre"}:{' '}
            <strong>
              {eclipse.cls} {eclipse.kind} eclipse
            </strong>
            {eclipse.kind === 'lunar' && eclipse.cls !== 'penumbral' && `, magnitude ${eclipse.magnitude.toFixed(2)}`}
            {eclipse.kind === 'solar' && eclipse.cls === 'partial' && `, up to ${Math.round(eclipse.magnitude * 100)}% of the Sun covered`}
            {eclipse.borderline && ' (close to a class boundary — the exact type may differ)'}.
          </>
        ) : (
          <>
            The shadow misses by {Math.abs(geo.gamma).toFixed(2)} Earth radii — it would need to pass within{' '}
            {(solar ? 1 + geo.penumbraRadius : geo.penumbraRadius + geo.moonRadius).toFixed(2)}. <strong>No eclipse.</strong>
          </>
        )}{' '}
        {solar
          ? 'A solar eclipse is total where the umbra touches the ground and annular where the Moon is too far away for its umbra to reach; the penumbra gives a partial eclipse over a much wider region.'
          : "A lunar eclipse is total when the whole Moon sits in Earth's umbra, partial when only part of it does, and penumbral — a faint dimming — when it only crosses the outer shadow."}
      </p>
    </div>
  )
}
