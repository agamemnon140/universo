import type { Body } from '../../types'
import { bodies, bodyById } from '../../data'
import { DetailSheet } from '../shell/DetailSheet'
import {
  formatNumber,
  formatPeriodDays,
  formatRotationHours,
} from '../../lib/format'
import { EARTH_SURFACE_AREA_KM2, solarDayHours, surfaceAreaKm2 } from '../../lib/derive'

export function BodyDetail({
  body,
  onClose,
  onSelectBody,
}: {
  body: Body
  onClose: () => void
  onSelectBody?: (id: string) => void
}) {
  const parent = body.parent ? bodyById.get(body.parent) : undefined
  const moons = bodies
    .filter((b) => b.parent === body.id && b.type === 'moon')
    .sort((a, b) => b.radiusEarth - a.radiusEarth)
  const area = surfaceAreaKm2(body)
  const solarDay = solarDayHours(body)

  return (
    <DetailSheet
      title={body.name}
      subtitle={`${body.type.replace('-', ' ')}${parent ? ` of ${parent.name}` : ''}`}
      onClose={onClose}
    >
      <dl className="kv">
        <dt>Mass</dt>
        <dd>{formatNumber(body.massEarth)} × Earth</dd>
        <dt>Radius</dt>
        <dd>
          {formatNumber(body.radiusKm, 'km')} ({formatNumber(body.radiusEarth)} × Earth)
        </dd>
        <dt>Surface area</dt>
        <dd>
          {formatNumber(area, 'km²')} ({formatNumber(area / EARTH_SURFACE_AREA_KM2)} × Earth)
        </dd>
        <dt>Surface gravity</dt>
        <dd>{formatNumber(body.surfaceGravityG)} g</dd>
        <dt>Density</dt>
        <dd>{formatNumber(body.densityGcm3, 'g/cm³')}</dd>
        <dt>Mean temperature</dt>
        <dd>{formatNumber(body.meanTempC)} °C</dd>
        <dt>Escape velocity</dt>
        <dd>{formatNumber(body.escapeVelocityKms, 'km/s')}</dd>
        <dt>Orbit distance</dt>
        <dd>
          {body.orbitDistanceKm === null
            ? '—'
            : `${formatNumber(body.orbitDistanceKm, 'km')}${parent ? ` around ${parent.name}` : ''}`}
        </dd>
        <dt>Orbital period</dt>
        <dd>{formatPeriodDays(body.orbitalPeriodDays)}</dd>
        <dt>Rotation (sidereal)</dt>
        <dd>{formatRotationHours(body.rotationPeriodHours)}</dd>
        <dt>Solar day (noon to noon)</dt>
        <dd>{formatRotationHours(solarDay)}</dd>
        <dt>Eccentricity</dt>
        <dd>{formatNumber(body.eccentricity)}</dd>
        <dt>Inclination</dt>
        <dd>{body.inclinationDeg === null ? '—' : `${formatNumber(body.inclinationDeg)}°`}</dd>
        <dt>Roche limit</dt>
        <dd>{formatNumber(body.rocheLimitKm, 'km')}</dd>
        <dt>Hill sphere</dt>
        <dd>{formatNumber(body.hillSphereKm, 'km')}</dd>
        <dt>Surface composition</dt>
        <dd>{body.composition.surface}</dd>
        <dt>Core &amp; interior</dt>
        <dd>{body.composition.core}</dd>
        <dt>Atmosphere</dt>
        <dd>{body.atmosphere}</dd>
        <dt>Moons</dt>
        <dd>{body.moonCount}</dd>
        <dt>Rings</dt>
        <dd>{body.rings ? 'Yes' : 'No'}</dd>
        <dt>Discovery</dt>
        <dd>
          {body.discovery.year ? `${body.discovery.year} — ` : ''}
          {body.discovery.by}
        </dd>
      </dl>

      {solarDay !== null && (
        <p className="hint">
          The sidereal rotation is one full turn measured against the stars. A solar day —
          noon to noon — is different because {body.name} also travels along its orbit while
          it spins.{' '}
          {(body.rotationPeriodHours ?? 0) < 0
            ? `${body.name} spins backwards, so that orbital motion brings the Sun back around sooner and the solar day is shorter than one rotation.`
            : 'It has to turn a little further to point back at the Sun, so the solar day is longer — Earth spins in 23.9 h, yet noon returns every 24.0 h.'}
        </p>
      )}

      {moons.length > 0 && (
        <>
          <h3 style={{ fontSize: '0.95rem', margin: '14px 0 4px' }}>
            Major moons ({moons.length} of {formatNumber(body.moonCount)} known)
          </h3>
          <div className="chips">
            {moons.map((moon) => (
              <button
                key={moon.id}
                className="chip"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectBody?.(moon.id)}
              >
                {moon.name}
              </button>
            ))}
          </div>
        </>
      )}

      {body.missions.length > 0 && (
        <>
          <h3 style={{ fontSize: '0.95rem', margin: '14px 0 4px' }}>Missions</h3>
          <ul className="fact-list">
            {body.missions.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </>
      )}

      {body.facts.length > 0 && (
        <>
          <h3 style={{ fontSize: '0.95rem', margin: '14px 0 4px' }}>Notable facts</h3>
          <ul className="fact-list">
            {body.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      )}
    </DetailSheet>
  )
}
