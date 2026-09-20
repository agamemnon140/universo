import { useCallback, useEffect, useMemo, useState } from 'react'
import type { NewsState } from '../../hooks/useNews'
import { bodyById } from '../../data'
import { julianDay } from '../../lib/ephemeris'
import { dayOfJd, todayNoon } from '../../lib/dates'
import { nextEclipse } from '../../lib/eclipses'
import { TimeControl } from './TimeControl'
import { PlanetMap } from './PlanetMap'
import { EarthView } from './EarthView'
import { MoonView } from './MoonView'
import { EclipsesView } from './EclipsesView'
import { BodyDetail } from '../solar/BodyDetail'
import { NewsSection } from '../news/NewsSection'

type View = 'planets' | 'earth' | 'moon' | 'eclipses'

const VIEWS: { id: View; label: string }[] = [
  { id: 'planets', label: 'Planets' },
  { id: 'earth', label: 'Earth' },
  { id: 'moon', label: 'Moon' },
  { id: 'eclipses', label: 'Eclipses' },
]

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
  const v = new URLSearchParams(window.location.search).get('view')
  if (v === 'earthmoon') return 'earth' // old links
  return VIEWS.some((x) => x.id === v) ? (v as View) : 'planets'
}

const HINTS: Record<View, string> = {
  planets:
    "Where the eight planets really are on this date. Centre the map on the Sun to read each planet's heliocentric longitude, or on Earth to see which side of the Sun it sits from our point of view — and whether it is an evening or a morning object. Tap a planet for its profile.",
  earth:
    "Earth on this date: how its 23.4° tilt sets the season, and how its almost-circular orbit still speeds it up and slows it down.",
  moon:
    "The Moon on this date: its phase and the face it shows us, its elliptical and tilted orbit, the months it keeps, and why it has no seasons but a slow 18.6-year swing across our sky.",
  eclipses:
    'When shadows line up: the eclipse seasons, the geometry of the coming new and full Moon, and every eclipse of the next ten years. Press play, or jump straight to the next one.',
}

export function PositionsTab({ news }: { news: NewsState }) {
  const [date, setDate] = useState<Date>(dateFromUrl)
  const [view, setView] = useState<View>(viewFromUrl)
  const [detailId, setDetailId] = useState<string | null>(null)
  const jd = useMemo(() => julianDay(date), [date])

  // keep ?date= and ?view= in sync so the current snapshot can be copied from the address bar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('date', date.toISOString().slice(0, 10))
    params.set('view', view)
    const url = `${window.location.pathname}?${params.toString()}${window.location.hash}`
    window.history.replaceState(null, '', url)
  }, [date, view])

  const jumpTo = useCallback((targetJd: number) => setDate(dayOfJd(targetJd)), [])
  const jumpEclipse = useCallback(
    (direction: 1 | -1) => {
      // step half a day past the current date so a same-day eclipse is not found again
      const e = nextEclipse(jd + direction * 0.5, direction)
      jumpTo(e.jd)
    },
    [jd, jumpTo],
  )

  const detail = detailId ? bodyById.get(detailId) : undefined

  return (
    <>
      <div className="view-toggle">
        {VIEWS.map((v) => (
          <button key={v.id} className={view === v.id ? 'active' : ''} onClick={() => setView(v.id)}>
            {v.label}
          </button>
        ))}
      </div>

      <TimeControl date={date} setDate={setDate}>
        {view === 'eclipses' && (
          <>
            <button className="chip" onClick={() => jumpEclipse(-1)}>
              ◀ Previous eclipse
            </button>
            <button className="chip" onClick={() => jumpEclipse(1)}>
              Next eclipse ▶
            </button>
          </>
        )}
      </TimeControl>

      <p className="hint">{HINTS[view]}</p>

      {view === 'planets' && <PlanetMap jd={jd} onSelect={setDetailId} />}
      {view === 'earth' && <EarthView jd={jd} />}
      {view === 'moon' && <MoonView jd={jd} />}
      {view === 'eclipses' && <EclipsesView jd={jd} onJump={jumpTo} />}

      {detail && (
        <BodyDetail body={detail} onClose={() => setDetailId(null)} onSelectBody={setDetailId} />
      )}

      <NewsSection news={news} theme="solar-system" />
    </>
  )
}
