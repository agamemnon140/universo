import { useMemo } from 'react'
import { bodyById } from '../../data'
import { AU_KM, earthOrbitState } from '../../lib/apsides'
import { formatJd, inDays } from '../../lib/dates'
import { planetHeliocentric, planetPerihelionLongitude } from '../../lib/ephemeris'
import { formatNumber } from '../../lib/format'
import { OrbitShapeFigure } from './OrbitShapeFigure'

/** Perihelion longitude advances ~0.323° per century: one lap in about 111,000 years. */
const PERIHELION_LAP_YEARS = 111_000

export function EarthOrbitPanel({ jd }: { jd: number }) {
  const sun = bodyById.get('sun')!
  const earth = bodyById.get('earth')!
  const { state, lon, periLon } = useMemo(
    () => ({
      state: earthOrbitState(jd),
      lon: planetHeliocentric('earth', jd).lonDeg,
      periLon: planetPerihelionLongitude('earth', jd),
    }),
    [jd],
  )
  const pct = ((state.distanceKm - state.lastPeri.distanceKm) / state.lastPeri.distanceKm) * 100
  // sunlight ∝ 1/r²
  const sunlightVsPeri = (state.lastPeri.distanceKm / state.distanceKm) ** 2 * 100

  return (
    <div className="panel diagram">
      <h3>Earth&apos;s orbit — an ellipse, only just</h3>
      <OrbitShapeFigure
        state={state}
        centralColor={sun.color}
        centralName="The Sun"
        centralRadius={12}
        orbiterColor={earth.color}
        orbiterName="Earth"
        orbiterLonDeg={lon}
        periLonDeg={periLon}
        periName="Perihelion"
        apoName="Aphelion"
        distanceLabel={`${formatNumber(state.distanceKm / 1e6)} M km`}
      />
      <dl className="kv">
        <dt>Distance today</dt>
        <dd>
          {formatNumber(Math.round(state.distanceKm))} km · {(state.distanceKm / AU_KM).toFixed(4)} AU ·{' '}
          {pct.toFixed(1)}% farther than perihelion, {Math.round(state.fraction * 100)}% of the way out to aphelion
        </dd>
        <dt>Speed today</dt>
        <dd>
          {state.speedKms.toFixed(2)} km/s (ranges {state.minSpeedKms.toFixed(2)} at aphelion to{' '}
          {state.maxSpeedKms.toFixed(2)} at perihelion)
        </dd>
        <dt>Next perihelion</dt>
        <dd>
          {formatJd(state.nextPeri.jd)} · {formatNumber(Math.round(state.nextPeri.distanceKm))} km ·{' '}
          {inDays(state.nextPeri.jd - jd)}
        </dd>
        <dt>Next aphelion</dt>
        <dd>
          {formatJd(state.nextApo.jd)} · {formatNumber(Math.round(state.nextApo.distanceKm))} km ·{' '}
          {inDays(state.nextApo.jd - jd)}
        </dd>
        <dt>Sunlight today</dt>
        <dd>{sunlightVsPeri.toFixed(1)}% of what Earth receives at perihelion</dd>
        <dt>Perihelion points to</dt>
        <dd>
          ecliptic longitude {periLon.toFixed(1)}° — it creeps forward and completes a lap in ~
          {formatNumber(PERIHELION_LAP_YEARS)} years
        </dd>
      </dl>
      <p className="caption">
        Earth&apos;s orbit is so close to a circle (eccentricity {state.eccentricity.toFixed(3)}) that
        drawn to scale it looks like one; only the Sun&apos;s slight offset from the centre gives it
        away. Distance swings by just 3.3% between perihelion in early January and aphelion in early
        July, changing sunlight by about 7% — and perihelion falls in the{' '}
        <strong>northern winter</strong>, so distance is not what makes the seasons: the axial tilt is.
        Kepler&apos;s second law still shows: Earth runs about 1 km/s faster in January than in July,
        which is why northern-hemisphere autumn and winter together are a week shorter than spring
        and summer.
      </p>
    </div>
  )
}
