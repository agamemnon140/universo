import { useMemo, useState } from 'react'
import type { StarSystem } from '../../types'
import { systems } from '../../data'
import { formatNumber } from '../../lib/format'

interface Match {
  system: StarSystem
  label: string // what matched: star or planet name when not the system itself
}

function findMatches(query: string): Match[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const out: Match[] = []
  for (const system of systems) {
    if (system.name.toLowerCase().includes(q)) {
      out.push({ system, label: '' })
      continue
    }
    const star = system.stars.find((s) => s.name.toLowerCase().includes(q))
    if (star) {
      out.push({ system, label: star.name })
      continue
    }
    const planet = system.planets.find((p) => p.name.toLowerCase().includes(q))
    if (planet) {
      out.push({ system, label: planet.name })
    }
  }
  return out.sort((a, b) => a.system.distanceLy - b.system.distanceLy).slice(0, 8)
}

export function SearchBox({ onPick }: { onPick: (system: StarSystem) => void }) {
  const [query, setQuery] = useState('')
  const matches = useMemo(() => findMatches(query), [query])

  return (
    <div className="search-box">
      <input
        type="search"
        placeholder="Search star, system, or planet — e.g. Proxima, TRAPPIST, Sirius…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && matches.length > 0) {
            onPick(matches[0].system)
            setQuery('')
          }
        }}
      />
      {matches.length > 0 && (
        <ul className="search-results">
          {matches.map(({ system, label }) => (
            <li key={system.id}>
              <button
                onClick={() => {
                  onPick(system)
                  setQuery('')
                }}
              >
                <span className="search-name">
                  {system.name}
                  {label && label !== system.name && (
                    <span className="search-label"> · {label}</span>
                  )}
                </span>
                <span className="search-meta">
                  {formatNumber(system.distanceLy)} ly
                  {system.planets.length > 0 &&
                    ` · ${system.planets.length} planet${system.planets.length > 1 ? 's' : ''}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.trim().length >= 2 && matches.length === 0 && (
        <p className="hint" style={{ margin: '6px 2px' }}>
          No system, star, or planet matches "{query.trim()}".
        </p>
      )}
    </div>
  )
}
