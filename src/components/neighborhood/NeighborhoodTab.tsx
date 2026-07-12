import { useState } from 'react'
import type { StarSystem } from '../../types'
import type { NewsState } from '../../hooks/useNews'
import { GalacticMap } from './GalacticMap'
import { ZoomControl, ZOOM_LEVELS, type ZoomLy } from './ZoomControl'
import { SystemDetail } from './SystemDetail'
import { SearchBox } from './SearchBox'
import { NewsSection } from '../news/NewsSection'

export function NeighborhoodTab({ news }: { news: NewsState }) {
  const [zoom, setZoom] = useState<ZoomLy>(ZOOM_LEVELS[0])
  const [detail, setDetail] = useState<StarSystem | null>(null)

  const pickSystem = (system: StarSystem) => {
    // zoom the map out just enough for the picked system to be visible
    const fitting = ZOOM_LEVELS.find((level) => system.distanceLy <= level)
    if (fitting && fitting > zoom) setZoom(fitting)
    setDetail(system)
  }

  return (
    <>
      <p className="hint">
        Top-down view of the galactic plane, Sun at the center. Amber rings mark systems with
        known exoplanets — tap any star for details, or search below. Zoom out to reach famous
        distant systems like TRAPPIST-1 and K2-18.
      </p>
      <SearchBox onPick={pickSystem} />
      <ZoomControl zoom={zoom} onZoom={setZoom} />
      <GalacticMap maxLy={zoom} onSelect={setDetail} />
      {detail && <SystemDetail system={detail} onClose={() => setDetail(null)} />}
      <NewsSection news={news} theme="exoplanets" />
    </>
  )
}
