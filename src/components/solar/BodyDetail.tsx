import type { Body } from '../../types'
import { bodies, bodyById } from '../../data'
import { DetailSheet } from '../shell/DetailSheet'
import {
  formatNumber,
  formatPeriodDays,
  formatRotationHours,
} from '../../lib/format'

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
        <dt>Rotation period</dt>
        <dd>{formatRotationHours(body.rotationPeriodHours)}</dd>
        <dt>Eccentricity</dt>
        <dd>{formatNumber(body.eccentricity)}</dd>
        <dt>Inclination</dt>
        <dd>{body.inclinationDeg === null ? '—' : `${formatNumber(body.inclinationDeg)}°`}</dd>
        <dt>Roche limit</dt>
        <dd>{formatNumber(body.rocheLimitKm, 'km')}</dd>
        <dt>Hill sphere</dt>
        <dd>{formatNumber(body.hillSphereKm, 'km')}</dd>
        <dt>Composition</dt>
        <dd>{body.composition}</dd>
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
