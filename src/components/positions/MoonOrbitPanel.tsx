import { useMemo } from 'react'
import { bodyById } from '../../data'
import { moonApparentDiameterArcmin, moonOrbitState } from '../../lib/apsides'
import { formatJd, inDays } from '../../lib/dates'
import { moonPhase, moonPosition } from '../../lib/ephemeris'
import { formatNumber } from '../../lib/format'
import { OrbitShapeFigure } from './OrbitShapeFigure'

/** Extreme perigee / apogee distances over the long run, km. */
const CLOSEST_KM = 356_400
const FARTHEST_KM = 406_700
/** Width of something at arm's length (70 cm) that would look as big as an angle of `arcmin`. */
function cmAtArmsLength(arcmin: number): number {
  return 2 * 70 * Math.tan((arcmin / 60 / 2) * (Math.PI / 180))
}
/** Perigee circles the orbit once every 8.85 years. */
const PERIGEE_LAP_YEARS = 8.85

export function MoonOrbitPanel({ jd }: { jd: number }) {
  const earth = bodyById.get('earth')!
  const moonBody = bodyById.get('moon')!
  const { state, moon, phase, perigeeLon } = useMemo(() => {
    const state = moonOrbitState(jd)
    // the real (osculating) perigee direction: where the Moon is at the nearest perigee instant
    const nearest = state.nextPeri.jd - jd < jd - state.lastPeri.jd ? state.nextPeri : state.lastPeri
    return { state, moon: moonPosition(jd), phase: moonPhase(jd), perigeeLon: moonPosition(nearest.jd).lonDeg }
  }, [jd])
  const diamNow = moonApparentDiameterArcmin(state.distanceKm)
  const diamMin = moonApparentDiameterArcmin(FARTHEST_KM)
  const diamMax = moonApparentDiameterArcmin(CLOSEST_KM)
  // a "supermoon" is a full Moon within ~90% of the closest perigee distance
  const supermoon = phase.name === 'Full Moon' && state.distanceKm < 360_000 + 0.1 * (FARTHEST_KM - CLOSEST_KM)
  const micromoon = phase.name === 'Full Moon' && state.distanceKm > 405_000

  // apparent-size discs, drawn to the right of the exaggerated ellipse
  const DX = 495
  const DY = 300
  const px = (arcmin: number) => (arcmin / diamMax) * 18
  const discs = (
    <g>
      <text x={DX} y={DY - 32} textAnchor="middle" fill="var(--text-dim)" fontSize="11">
        apparent size in the sky
      </text>
      {[
        { label: `${diamMax.toFixed(1)} arcmin`, sub: 'closest', d: diamMax, x: DX - 95, faded: true },
        { label: `${diamNow.toFixed(1)} arcmin`, sub: 'today', d: diamNow, x: DX, faded: false },
        { label: `${diamMin.toFixed(1)} arcmin`, sub: 'farthest', d: diamMin, x: DX + 95, faded: true },
      ].map((s) => (
        <g key={s.label} opacity={s.faded ? 0.45 : 1}>
          <circle cx={s.x} cy={DY} r={px(s.d)} fill={moonBody.color} />
          <text x={s.x} y={DY + 30} textAnchor="middle" fill="var(--text-faint)" fontSize="10">
            {s.label}
          </text>
          <text x={s.x} y={DY + 42} textAnchor="middle" fill="var(--text-faint)" fontSize="10">
            {s.sub}
          </text>
        </g>
      ))}
    </g>
  )

  return (
    <div className="panel diagram">
      <h3>The Moon&apos;s orbit — perigee, apogee and supermoons</h3>
      <OrbitShapeFigure
        state={state}
        centralColor={earth.color}
        centralName="Earth"
        centralRadius={10}
        orbiterColor={moonBody.color}
        orbiterName="Moon"
        orbiterLonDeg={moon.lonDeg}
        periLonDeg={perigeeLon}
        periName="Perigee"
        apoName="Apogee"
        distanceLabel={`${formatNumber(Math.round(state.distanceKm))} km`}
        extra={discs}
      />
      <dl className="kv">
        <dt>Distance today</dt>
        <dd>
          {formatNumber(Math.round(state.distanceKm))} km · {Math.round(state.fraction * 100)}% of the way
          from perigee to apogee · looks {diamNow.toFixed(1)} arcmin across, like a {cmAtArmsLength(diamNow).toFixed(1)} cm coin at arm&apos;s length
          {supermoon && (
            <>
              {' '}
              — <strong>a supermoon</strong>: full and near perigee
            </>
          )}
          {micromoon && (
            <>
              {' '}
              — <strong>a micromoon</strong>: full and near apogee
            </>
          )}
        </dd>
        <dt>Speed today</dt>
        <dd>
          {(state.speedKms * 3600).toFixed(0)} km/h · {state.speedKms.toFixed(3)} km/s (ranges{' '}
          {state.minSpeedKms.toFixed(3)} to {state.maxSpeedKms.toFixed(3)})
        </dd>
        <dt>Next perigee</dt>
        <dd>
          {formatJd(state.nextPeri.jd)} · {formatNumber(Math.round(state.nextPeri.distanceKm))} km ·{' '}
          {inDays(state.nextPeri.jd - jd)}
        </dd>
        <dt>Next apogee</dt>
        <dd>
          {formatJd(state.nextApo.jd)} · {formatNumber(Math.round(state.nextApo.distanceKm))} km ·{' '}
          {inDays(state.nextApo.jd - jd)}
        </dd>
        <dt>Perigee points to</dt>
        <dd>
          ecliptic longitude {perigeeLon.toFixed(1)}° — the whole ellipse turns once every{' '}
          {PERIGEE_LAP_YEARS} years
        </dd>
      </dl>
      <p className="caption">
        The Moon&apos;s orbit is more clearly an ellipse than Earth&apos;s (eccentricity around
        0.055), so its distance swings by some 50,000 km each month and its apparent size by 14% —
        between {diamMin.toFixed(1)} and {diamMax.toFixed(1)} arcminutes (1 arcminute is 1/60 of a degree), or about{' '}
        {cmAtArmsLength(diamMin).toFixed(1)} to {cmAtArmsLength(diamMax).toFixed(1)} cm seen at arm&apos;s length.
        The Sun&apos;s pull keeps reshaping the ellipse: its eccentricity breathes between 0.026 and
        0.077 (right now the local fit is {state.eccentricity.toFixed(3)}), and the perigee point
        marches around the orbit in {PERIGEE_LAP_YEARS} years. A full Moon that lands near perigee is
        a <strong>supermoon</strong>, about 7% bigger and 15% brighter than average; one near apogee
        is a micromoon. Perigee also brings the strongest tides.
      </p>
    </div>
  )
}
