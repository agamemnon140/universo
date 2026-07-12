import { useState } from 'react'
import { systems } from '../../data'
import { spectralColor, spectralLabel } from '../../lib/spectral'
import { formatNumber, formatRatio } from '../../lib/format'

interface ComparableStar {
  id: string
  name: string
  spectralClass: string
  radiusSun: number
  massSun?: number
  tempK?: number
  distanceLy: number
  systemName: string
  planetCount: number
}

const STARS: ComparableStar[] = [
  {
    id: 'sun',
    name: 'Sun',
    spectralClass: 'G2V',
    radiusSun: 1,
    massSun: 1,
    tempK: 5772,
    distanceLy: 0,
    systemName: 'Solar System',
    planetCount: 8,
  },
  ...systems.flatMap((system) =>
    system.stars.map((star, i) => ({
      id: `${system.id}-${i}`,
      name: star.name,
      spectralClass: star.spectralClass,
      radiusSun: star.radiusSun,
      massSun: star.massSun,
      tempK: star.tempK,
      distanceLy: system.distanceLy,
      systemName: system.name,
      planetCount: system.planets.length,
    })),
  ),
].sort((a, b) => a.distanceLy - b.distanceLy)

const byId = new Map(STARS.map((s) => [s.id, s]))

/** L/L☉ ≈ (R/R☉)² (T/T☉)⁴ — Stefan–Boltzmann estimate. */
function luminositySun(star: ComparableStar): number | null {
  if (!star.tempK) return null
  return star.radiusSun ** 2 * (star.tempK / 5772) ** 4
}

const MAX_R = 110
const MIN_R = 2.5

export function StarCompare() {
  const [aId, setAId] = useState('sun')
  const [bId, setBId] = useState('alpha-centauri-0')
  const a = byId.get(aId)
  const b = byId.get(bId)

  const picker = (value: string, onChange: (id: string) => void) => (
    <select className="telescope-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {STARS.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name} ({s.spectralClass}
          {s.distanceLy > 0 ? ` · ${formatNumber(s.distanceLy)} ly` : ''})
        </option>
      ))}
    </select>
  )

  if (!a || !b) return null

  const larger = a.radiusSun >= b.radiusSun ? a : b
  const smaller = a.radiusSun >= b.radiusSun ? b : a
  const sizeRatio = larger.radiusSun / smaller.radiusSun
  const rLarge = MAX_R
  const rSmallTrue = MAX_R / sizeRatio
  const rSmall = Math.max(MIN_R, rSmallTrue)
  const notToScale = rSmallTrue < MIN_R

  const width = 640
  const height = MAX_R * 2 + 60
  const cy = MAX_R + 14

  const lumA = luminositySun(a)
  const lumB = luminositySun(b)

  const rows = [
    {
      label: 'Spectral class',
      a: `${a.spectralClass} (${spectralLabel(a.spectralClass)})`,
      b: `${b.spectralClass} (${spectralLabel(b.spectralClass)})`,
      ratio: undefined as string | undefined,
    },
    {
      label: 'Radius',
      a: `${formatNumber(a.radiusSun)} R☉`,
      b: `${formatNumber(b.radiusSun)} R☉`,
      ratio: formatRatio(a.radiusSun / b.radiusSun),
    },
    {
      label: 'Mass',
      a: a.massSun !== undefined ? `${formatNumber(a.massSun)} M☉` : '—',
      b: b.massSun !== undefined ? `${formatNumber(b.massSun)} M☉` : '—',
      ratio:
        a.massSun !== undefined && b.massSun !== undefined
          ? formatRatio(a.massSun / b.massSun)
          : undefined,
    },
    {
      label: 'Temperature',
      a: a.tempK !== undefined ? `${formatNumber(a.tempK)} K` : '—',
      b: b.tempK !== undefined ? `${formatNumber(b.tempK)} K` : '—',
      ratio:
        a.tempK !== undefined && b.tempK !== undefined
          ? formatRatio(a.tempK / b.tempK)
          : undefined,
    },
    {
      label: 'Luminosity (est.)',
      a: lumA !== null ? `${formatNumber(lumA)} L☉` : '—',
      b: lumB !== null ? `${formatNumber(lumB)} L☉` : '—',
      ratio: lumA !== null && lumB !== null ? formatRatio(lumA / lumB) : undefined,
    },
    {
      label: 'Distance',
      a: a.distanceLy === 0 ? 'here' : `${formatNumber(a.distanceLy)} ly`,
      b: b.distanceLy === 0 ? 'here' : `${formatNumber(b.distanceLy)} ly`,
      ratio: undefined,
    },
    { label: 'System', a: a.systemName, b: b.systemName, ratio: undefined },
    {
      label: 'Known planets',
      a: String(a.planetCount),
      b: String(b.planetCount),
      ratio: undefined,
    },
  ]

  const circle = (star: ComparableStar, cx: number, r: number) => (
    <>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={spectralColor(star.spectralClass)}
        style={{ filter: `drop-shadow(0 0 ${Math.max(6, r / 5)}px ${spectralColor(star.spectralClass)}66)` }}
      />
      <text
        x={cx}
        y={cy + Math.max(r, 12) + 22}
        textAnchor="middle"
        fill="var(--text)"
        fontSize="14"
        fontWeight="600"
      >
        {star.name}
      </text>
    </>
  )

  return (
    <section className="section">
      <h2>Compare two stars</h2>
      <div className="compare-pickers">
        {picker(aId, setAId)}
        <span className="hint" style={{ margin: 0 }}>
          vs
        </span>
        {picker(bId, setBId)}
      </div>
      <div className="panel">
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
          {circle(larger, width * 0.32, rLarge)}
          {circle(smaller, width * 0.78, rSmall)}
        </svg>
        {notToScale && (
          <p className="not-to-scale">
            Size difference too extreme to draw to scale — {smaller.name} is shown enlarged
            (true diameter ratio: {formatNumber(sizeRatio)}×).
          </p>
        )}
        <div style={{ overflowX: 'auto' }}>
          <table className="ratio-table">
            <thead>
              <tr>
                <th></th>
                <th>{a.name}</th>
                <th>{b.name}</th>
                <th>
                  {a.name} / {b.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td className="num">{row.a}</td>
                  <td className="num">{row.b}</td>
                  <td className="num ratio">{row.ratio ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
