import type { Telescope } from '../../types'
import { telescopes } from '../../data'
import { STATUS_LABELS } from '../../lib/spectrum'
import { formatNumber, formatRatio } from '../../lib/format'

const byId = new Map(telescopes.map((t) => [t.id, t]))

function wavelengthLabel(t: Telescope): string {
  if (t.kind !== 'em') return t.signalLabel ?? '—'
  const fmt = (m: number) => {
    if (m >= 1) return `${m} m`
    if (m >= 1e-3) return `${(m * 1e3).toPrecision(3)} mm`
    if (m >= 1e-6) return `${(m * 1e6).toPrecision(3)} µm`
    if (m >= 1e-9) return `${(m * 1e9).toPrecision(3)} nm`
    return `${(m * 1e12).toPrecision(3)} pm`
  }
  return `${fmt(t.wavelengthMinM!)} – ${fmt(t.wavelengthMaxM!)}`
}

/** Wavelength coverage breadth in decades (orders of magnitude). */
function coverageDecades(t: Telescope): number | null {
  if (t.kind !== 'em' || !t.wavelengthMinM || !t.wavelengthMaxM) return null
  return Math.log10(t.wavelengthMaxM / t.wavelengthMinM)
}

function collectingAreaM2(t: Telescope): number | null {
  if (t.apertureM === undefined) return null
  return Math.PI * (t.apertureM / 2) ** 2
}

interface CompareRow {
  label: string
  a: string
  b: string
  ratio?: string
}

function buildRows(a: Telescope, b: Telescope): CompareRow[] {
  const ratioOf = (x: number | null, y: number | null) =>
    x !== null && y !== null && y !== 0 ? formatRatio(x / y) : undefined

  const areaA = collectingAreaM2(a)
  const areaB = collectingAreaM2(b)
  const decA = coverageDecades(a)
  const decB = coverageDecades(b)

  return [
    { label: 'Country', a: a.flag ?? '—', b: b.flag ?? '—' },
    { label: 'Status', a: STATUS_LABELS[a.status], b: STATUS_LABELS[b.status] },
    {
      label: 'Space / ground',
      a: a.domain === 'space' ? 'Space' : 'Ground',
      b: b.domain === 'space' ? 'Space' : 'Ground',
    },
    { label: 'Agency', a: a.agency, b: b.agency },
    { label: 'Spectral bands', a: a.bands.join(', '), b: b.bands.join(', ') },
    { label: 'Wavelength / signal', a: wavelengthLabel(a), b: wavelengthLabel(b) },
    {
      label: 'Aperture',
      a: a.aperture,
      b: b.aperture,
      ratio: ratioOf(a.apertureM ?? null, b.apertureM ?? null),
    },
    {
      label: 'Collecting area',
      a: areaA !== null ? `≈ ${formatNumber(areaA, 'm²')}` : '—',
      b: areaB !== null ? `≈ ${formatNumber(areaB, 'm²')}` : '—',
      ratio: ratioOf(areaA, areaB),
    },
    {
      label: 'Spectral coverage',
      a: decA !== null ? `${decA.toFixed(1)} decades` : '—',
      b: decB !== null ? `${decB.toFixed(1)} decades` : '—',
      ratio: ratioOf(decA, decB),
    },
    {
      label: 'Field of view',
      a: a.fieldOfView ?? '—',
      b: b.fieldOfView ?? '—',
      ratio: ratioOf(a.fovDeg2 ?? null, b.fovDeg2 ?? null),
    },
    {
      label: 'Limiting magnitude',
      a: a.limitingMagnitude ?? '—',
      b: b.limitingMagnitude ?? '—',
      ratio: magnitudeComparison(a, b),
    },
    { label: 'Location', a: a.location, b: b.location },
    {
      label: 'Active',
      a: activeLabel(a),
      b: activeLabel(b),
    },
    { label: 'Main objective', a: a.objectives[0] ?? '—', b: b.objectives[0] ?? '—' },
    { label: 'Instruments', a: a.instruments.join(', '), b: b.instruments.join(', ') },
  ]
}

function activeLabel(t: Telescope): string {
  const start = t.launched ? String(t.launched) : (t.plannedDate ?? '—')
  return t.retired ? `${start} – ${t.retired}` : start
}

/**
 * Magnitudes are logarithmic: each 5 mag = 100× in brightness, so the
 * honest "ratio" is how much fainter one telescope can see.
 */
function magnitudeComparison(a: Telescope, b: Telescope): string | undefined {
  if (a.limitingMag === undefined || b.limitingMag === undefined) return undefined
  const delta = a.limitingMag - b.limitingMag
  if (Math.abs(delta) < 0.05) return 'same depth'
  const factor = 10 ** (0.4 * Math.abs(delta))
  const dir = delta > 0 ? 'fainter' : 'brighter limit'
  return `Δ${Math.abs(delta).toFixed(1)} mag ≈ sees ${formatRatio(factor)} ${dir}`
}

export function TelescopeCompare({
  aId,
  bId,
  onAChange,
  onBChange,
}: {
  aId: string
  bId: string
  onAChange: (id: string) => void
  onBChange: (id: string) => void
}) {
  const a = byId.get(aId)
  const b = byId.get(bId)

  const sorted = telescopes.slice().sort((x, y) => x.name.localeCompare(y.name))

  const setAId = onAChange
  const setBId = onBChange

  const picker = (value: string, onChange: (id: string) => void) => (
    <select className="telescope-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {sorted.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name} {t.fullName && t.fullName !== t.name ? `— ${t.fullName}` : ''}
        </option>
      ))}
    </select>
  )

  return (
    <section className="section">
      <h2>Compare two telescopes</h2>
      <div className="compare-pickers">
        {picker(aId, setAId)}
        <span className="hint" style={{ margin: 0 }}>
          vs
        </span>
        {picker(bId, setBId)}
      </div>
      {a && b && (
        <div style={{ overflowX: 'auto' }}>
          <table className="ratio-table">
            <thead>
              <tr>
                <th></th>
                <th>
                  {a.flag} {a.name}
                </th>
                <th>
                  {b.flag} {b.name}
                </th>
                <th>
                  {a.name} / {b.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {buildRows(a, b).map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.a}</td>
                  <td>{row.b}</td>
                  <td className="num ratio">{row.ratio ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
