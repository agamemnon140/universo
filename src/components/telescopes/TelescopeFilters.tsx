import type { TelescopeStatus } from '../../types'
import { STATUS_LABELS } from '../../lib/spectrum'

export type DomainFilter = 'all' | 'space' | 'ground'
export type TelescopeSort = 'wavelength' | 'date'

const STATUSES: (TelescopeStatus | 'all')[] = [
  'all',
  'operating',
  'construction',
  'planned',
  'retired',
]

const STATUS_CHIP_COLORS: Record<string, string> = {
  operating: 'var(--status-operating)',
  construction: 'var(--status-construction)',
  planned: 'var(--status-planned)',
  retired: 'var(--status-retired)',
}

export function TelescopeFilters({
  status,
  domain,
  sort,
  onStatus,
  onDomain,
  onSort,
}: {
  status: TelescopeStatus | 'all'
  domain: DomainFilter
  sort: TelescopeSort
  onStatus: (s: TelescopeStatus | 'all') => void
  onDomain: (d: DomainFilter) => void
  onSort: (s: TelescopeSort) => void
}) {
  return (
    <>
      <div className="filter-row">
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`chip${status === s ? ' on' : ''}`}
            style={
              status === s
                ? { background: s === 'all' ? 'var(--text)' : STATUS_CHIP_COLORS[s] }
                : undefined
            }
            onClick={() => onStatus(s)}
          >
            {s === 'all' ? 'All statuses' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      <div className="filter-row">
        {(['all', 'space', 'ground'] as const).map((d) => (
          <button
            key={d}
            className={`chip${domain === d ? ' on' : ''}`}
            style={domain === d ? { background: 'var(--accent-cyan)' } : undefined}
            onClick={() => onDomain(d)}
          >
            {d === 'all' ? 'Space + ground' : d === 'space' ? 'In space' : 'On the ground'}
          </button>
        ))}
      </div>
      <div className="filter-row" style={{ alignItems: 'center' }}>
        <span className="sort-label">Sort by</span>
        {(['wavelength', 'date'] as const).map((s) => (
          <button
            key={s}
            className={`chip${sort === s ? ' on' : ''}`}
            style={sort === s ? { background: 'var(--accent-amber)' } : undefined}
            onClick={() => onSort(s)}
          >
            {s === 'wavelength' ? 'Wavelength' : 'First light (oldest first)'}
          </button>
        ))}
      </div>
    </>
  )
}
