import { useEffect, useMemo, useState } from 'react'
import type { NewsState } from '../../hooks/useNews'
import { bodyById } from '../../data'
import { julianDay } from '../../lib/ephemeris'
import { todayNoon } from '../../lib/dates'
import { TimeControl } from './TimeControl'
import { PlanetMap } from './PlanetMap'
import { EarthMoonView } from './EarthMoonView'
import { BodyDetail } from '../solar/BodyDetail'
import { NewsSection } from '../news/NewsSection'

type View = 'planets' | 'earthmoon'

/** ?date=YYYY-MM-DD makes a snapshot shareable; the day is evaluated at 12:00 UTC. */
function dateFromUrl(): Date {
  const raw = new URLSearchParams(window.location.search).get('date')
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(`${raw}T12:00:00Z`)
    if (!isNaN(d.getTime())) return d
  }
  return todayNoon()
}

function viewFromUrl(): View {
  return new URLSearchParams(window.location.search).get('view') === 'earthmoon'
    ? 'earthmoon'
    : 'planets'
}

export function PositionsTab({ news }: { news: NewsState }) {
  const [date, setDate] = useState<Date>(dateFromUrl)
  const [view, setView] = useState<View>(viewFromUrl)
  const [detailId, setDetailId] = useState<string | null>(null)
  const jd = useMemo(() => julianDay(date), [date])

  // keep ?date= in sync so the current snapshot can be copied from the address bar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('date', date.toISOString().slice(0, 10))
    const url = `${window.location.pathname}?${params.toString()}${window.location.hash}`
    window.history.replaceState(null, '', url)
  }, [date])

  const detail = detailId ? bodyById.get(detailId) : undefined

  return (
    <>
      <div className="view-toggle">
        <button className={view === 'planets' ? 'active' : ''} onClick={() => setView('planets')}>
          Planets
        </button>
        <button
          className={view === 'earthmoon' ? 'active' : ''}
          onClick={() => setView('earthmoon')}
        >
          Earth &amp; Moon
        </button>
      </div>

      <TimeControl date={date} setDate={setDate} />

      {view === 'planets' && (
        <>
          <p className="hint">
            Where the eight planets really are on this date. Centre the map on the Sun to read
            each planet&apos;s heliocentric longitude, or on Earth to see which side of the Sun
            it sits from our point of view — and whether it is an evening or a morning object.
            Tap a planet for its profile.
          </p>
          <PlanetMap jd={jd} onSelect={setDetailId} />
        </>
      )}

      {view === 'earthmoon' && (
        <>
          <p className="hint">
            Three tilts that shape our sky: Earth&apos;s axis (the seasons), the Moon&apos;s
            orbit (why eclipses are rare), and the Moon&apos;s own spin axis — plus where the
            Moon stands between Earth and Sun on this date, which is its phase.
          </p>
          <EarthMoonView jd={jd} />
        </>
      )}

      {detail && (
        <BodyDetail body={detail} onClose={() => setDetailId(null)} onSelectBody={setDetailId} />
      )}

      <NewsSection news={news} theme="solar-system" />
    </>
  )
}
