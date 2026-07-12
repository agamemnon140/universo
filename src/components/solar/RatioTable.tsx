import type { Body } from '../../types'
import { compareBodies } from '../../lib/derive'

export function RatioTable({ a, b }: { a: Body; b: Body }) {
  const rows = compareBodies(a, b)

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="ratio-table">
        <thead>
          <tr>
            <th>Metric</th>
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
  )
}
