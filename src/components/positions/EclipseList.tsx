import { useMemo } from 'react'
import { formatJdTime } from '../../lib/dates'
import { eclipsesBetween, type Eclipse } from '../../lib/eclipses'

const YEARS = 10

function detail(e: Eclipse): string {
  if (e.kind === 'solar') {
    if (e.cls === 'partial') return `${Math.round(e.magnitude * 100)}% of the Sun covered at most`
    if (e.cls === 'annular') return 'ring of Sun left around the Moon'
    if (e.cls === 'hybrid') return 'total along part of the track, annular elsewhere'
    return 'Sun fully hidden along a narrow track'
  }
  if (e.cls === 'penumbral') return 'faint shading only'
  if (e.cls === 'partial') return `${Math.round(e.magnitude * 100)}% of the Moon in the umbra`
  return `whole Moon in the umbra · magnitude ${e.magnitude.toFixed(2)}`
}

export function EclipseList({ jd, onJump }: { jd: number; onJump: (jd: number) => void }) {
  // recompute once a month while the date moves, not on every tick
  const bucket = Math.floor(jd / 30.44)
  const list = useMemo(() => eclipsesBetween(bucket * 30.44, bucket * 30.44 + YEARS * 365.25), [bucket])
  const upcoming = list.filter((e) => e.jd >= jd - 0.5)
  const solar = upcoming.filter((e) => e.kind === 'solar')
  const lunar = upcoming.filter((e) => e.kind === 'lunar')
  const count = (arr: Eclipse[], cls: string) => arr.filter((e) => e.cls === cls).length

  return (
    <div className="panel diagram">
      <h3>The next {YEARS} years of eclipses</h3>
      <p className="hint" style={{ margin: '0 8px 8px' }}>
        {upcoming.length} eclipses: {solar.length} solar ({count(solar, 'total')} total, {count(solar, 'annular')} annular
        {count(solar, 'hybrid') > 0 ? `, ${count(solar, 'hybrid')} hybrid` : ''}, {count(solar, 'partial')} partial) and{' '}
        {lunar.length} lunar ({count(lunar, 'total')} total, {count(lunar, 'partial')} partial, {count(lunar, 'penumbral')}{' '}
        penumbral). Computed from the same model as the maps; times are the moment of alignment, within a few minutes.
        Where on Earth each one is visible is beyond this model.
      </p>
      <div className="table-scroll eclipse-list">
        <table className="planet-table">
          <thead>
            <tr>
              <th>When (UTC)</th>
              <th>Eclipse</th>
              <th>Detail</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((e) => (
              <tr key={e.jd}>
                <td style={{ whiteSpace: 'nowrap' }}>{formatJdTime(e.jd)}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <span className={`eclipse-tag ${e.kind}`}>{e.kind === 'solar' ? '☉' : '☾'}</span>{' '}
                  {e.cls} {e.kind}
                  {e.borderline && (
                    <span title="close to a class boundary — the type may differ" style={{ color: 'var(--text-faint)' }}>
                      {' '}
                      ?
                    </span>
                  )}
                </td>
                <td style={{ color: 'var(--text-dim)' }}>{detail(e)}</td>
                <td>
                  <button className="body-details-btn" onClick={() => onJump(e.jd)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
