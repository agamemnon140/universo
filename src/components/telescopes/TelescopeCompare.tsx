import { useState } from 'react'
import type { Telescope } from '../../types'
import { telescopes } from '../../data'
import { STATUS_LABELS } from '../../lib/spectrum'

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

const ROWS: { label: string; value: (t: Telescope) => string }[] = [
  { label: 'Country', value: (t) => t.flag ?? '—' },
  { label: 'Status', value: (t) => STATUS_LABELS[t.status] },
  { label: 'Space / ground', value: (t) => (t.domain === 'space' ? 'Space' : 'Ground') },
  { label: 'Agency', value: (t) => t.agency },
  { label: 'Spectral bands', value: (t) => t.bands.join(', ') },
  { label: 'Wavelength / signal', value: wavelengthLabel },
  { label: 'Aperture', value: (t) => t.aperture },
  { label: 'Field of view', value: (t) => t.fieldOfView ?? '—' },
  { label: 'Limiting magnitude', value: (t) => t.limitingMagnitude ?? '—' },
  { label: 'Location', value: (t) => t.location },
  {
    label: 'Active',
    value: (t) => {
      const start = t.launched ? String(t.launched) : (t.plannedDate ?? '—')
      return t.retired ? `${start} – ${t.retired}` : start
    },
  },
  { label: 'Main objective', value: (t) => t.objectives[0] ?? '—' },
  { label: 'Instruments', value: (t) => t.instruments.join(', ') },
]

export function TelescopeCompare() {
  const [aId, setAId] = useState('jwst')
  const [bId, setBId] = useState('vera-rubin')
  const a = byId.get(aId)
  const b = byId.get(bId)

  const sorted = telescopes.slice().sort((x, y) => x.name.localeCompare(y.name))

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
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.value(a)}</td>
                  <td>{row.value(b)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
