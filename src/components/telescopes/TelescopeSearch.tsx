import { useMemo, useState } from 'react'
import type { Telescope } from '../../types'
import { telescopes } from '../../data'
import { STATUS_LABELS } from '../../lib/spectrum'

function findMatches(query: string): Telescope[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  return telescopes
    .filter((t) =>
      [t.name, t.fullName ?? '', t.agency, t.location, ...t.bands]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
    .slice(0, 8)
}

export function TelescopeSearch({ onPick }: { onPick: (t: Telescope) => void }) {
  const [query, setQuery] = useState('')
  const matches = useMemo(() => findMatches(query), [query])

  return (
    <div className="search-box">
      <input
        type="search"
        placeholder="Search telescope, agency, or location — e.g. Webb, ESO, Chile, radio…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && matches.length > 0) {
            onPick(matches[0])
            setQuery('')
          }
        }}
      />
      {matches.length > 0 && (
        <ul className="search-results">
          {matches.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => {
                  onPick(t)
                  setQuery('')
                }}
              >
                <span className="search-name">
                  {t.flag} {t.name}
                  {t.fullName && t.fullName !== t.name && (
                    <span className="search-label"> · {t.fullName}</span>
                  )}
                </span>
                <span className="search-meta">{STATUS_LABELS[t.status]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.trim().length >= 2 && matches.length === 0 && (
        <p className="hint" style={{ margin: '6px 2px' }}>
          No telescope matches "{query.trim()}".
        </p>
      )}
    </div>
  )
}
