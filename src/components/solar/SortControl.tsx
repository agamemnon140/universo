import { BODY_SORT_LABELS, type BodySort } from '../../lib/sortBodies'

const SORTS: BodySort[] = ['size', 'distance', 'mass', 'grip']

export function SortControl({
  sort,
  onSort,
}: {
  sort: BodySort
  onSort: (s: BodySort) => void
}) {
  return (
    <div className="filter-row" style={{ alignItems: 'center' }}>
      <span className="sort-label">Sort by</span>
      {SORTS.map((s) => (
        <button
          key={s}
          className={`chip${sort === s ? ' on' : ''}`}
          style={sort === s ? { background: 'var(--accent-cyan)' } : undefined}
          onClick={() => onSort(s)}
        >
          {BODY_SORT_LABELS[s]}
        </button>
      ))}
    </div>
  )
}
