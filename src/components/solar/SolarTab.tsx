import { useState } from 'react'
import type { NewsState } from '../../hooks/useNews'
import { bodies, bodyById } from '../../data'
import { BodyGrid } from './BodyGrid'
import { ComparePanel } from './ComparePanel'
import { OrbitView } from './OrbitView'
import { BodyDetail } from './BodyDetail'
import { NewsSection } from '../news/NewsSection'

type View = 'grid' | 'orbits'

/** Initial selection from ?compare=jupiter,earth so comparisons are shareable. */
function selectionFromUrl(): string[] {
  const param = new URLSearchParams(window.location.search).get('compare')
  if (!param) return []
  return param
    .split(',')
    .map((id) => id.trim().toLowerCase())
    .filter((id) => bodyById.has(id))
    .slice(0, 2)
}

export function SolarTab({ news }: { news: NewsState }) {
  const [view, setView] = useState<View>('grid')
  const [selected, setSelected] = useState<string[]>(selectionFromUrl)
  const [detailId, setDetailId] = useState<string | null>(null)

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const [aId, bId] = selected
  const a = aId ? bodyById.get(aId) : undefined
  const b = bId ? bodyById.get(bId) : undefined
  const detail = detailId ? bodyById.get(detailId) : undefined

  return (
    <>
      <div className="view-toggle">
        <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>
          Compare
        </button>
        <button className={view === 'orbits' ? 'active' : ''} onClick={() => setView('orbits')}>
          Orbits
        </button>
      </div>

      {view === 'grid' && (
        <>
          <p className="hint">
            Tap two bodies to compare them — sizes in the grid are to relative scale. Tap ⓘ for
            details.
          </p>
          <BodyGrid
            bodies={bodies}
            selected={selected}
            onToggle={toggleSelect}
            onDetail={setDetailId}
          />
          {a && b && <ComparePanel a={a} b={b} />}
          {selected.length < 2 && (
            <p className="empty-note">
              {selected.length === 0
                ? 'Select two bodies to see how they compare.'
                : 'Select one more body to compare.'}
            </p>
          )}
        </>
      )}

      {view === 'orbits' && (
        <>
          <p className="hint">
            Orbit distances on a logarithmic scale — tap a body for details.
          </p>
          <OrbitView onSelect={setDetailId} />
        </>
      )}

      {detail && <BodyDetail body={detail} onClose={() => setDetailId(null)} />}

      <NewsSection news={news} theme="solar-system" />
    </>
  )
}
