import { useState } from 'react'
import type { BlackHole, StarSystem } from '../../types'
import type { NewsState } from '../../hooks/useNews'
import { GalacticMap } from './GalacticMap'
import { ZoomControl, ZOOM_LEVELS, type ZoomLy } from './ZoomControl'
import { SystemDetail } from './SystemDetail'
import { SearchBox } from './SearchBox'
import { StarCompare } from './StarCompare'
import { BlackHolesSection } from './BlackHoles'
import { NewsSection } from '../news/NewsSection'

function zoomFromUrl(): ZoomLy {
  const z = Number(new URLSearchParams(window.location.search).get('zoom'))
  return (ZOOM_LEVELS as readonly number[]).includes(z) ? (z as ZoomLy) : ZOOM_LEVELS[0]
}

export function NeighborhoodTab({ news }: { news: NewsState }) {
  const [zoom, setZoom] = useState<ZoomLy>(zoomFromUrl)
  const [detail, setDetail] = useState<StarSystem | null>(null)
  const [bhDetail, setBhDetail] = useState<BlackHole | null>(null)

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
      <GalacticMap maxLy={zoom} onSelect={setDetail} onSelectBlackHole={setBhDetail} />
      {detail && <SystemDetail system={detail} onClose={() => setDetail(null)} />}
      <StarCompare />
      <BlackHolesSection detail={bhDetail} onSelect={setBhDetail} />
      <NewsSection news={news} theme="exoplanets" />
    </>
  )
}
