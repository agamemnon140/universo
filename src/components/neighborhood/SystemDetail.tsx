import type { StarSystem } from '../../types'
import { DetailSheet } from '../shell/DetailSheet'
import { spectralColor, spectralLabel } from '../../lib/spectral'
import { formatNumber } from '../../lib/format'

export function SystemDetail({
  system,
  onClose,
}: {
  system: StarSystem
  onClose: () => void
}) {
  const hz = system.habitableZone

  return (
    <DetailSheet
      title={system.name}
      subtitle={`${formatNumber(system.distanceLy)} light-years away`}
      onClose={onClose}
    >
      {system.note && <p className="hint">{system.note}</p>}

      <h3 style={{ fontSize: '0.95rem', margin: '12px 0 4px' }}>
        {system.stars.length > 1 ? `Stars (${system.stars.length})` : 'Star'}
      </h3>
      <dl className="kv">
        {system.stars.map((star) => (
          <div key={star.name} style={{ display: 'contents' }}>
            <dt>
              <span
                className="dot"
                style={{
                  display: 'inline-block',
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  marginRight: 6,
                  background: spectralColor(star.spectralClass),
                }}
              />
              {star.name}
            </dt>
            <dd>
              {star.spectralClass} ({spectralLabel(star.spectralClass)})
              {' · '}
              {formatNumber(star.radiusSun)} R☉
              {star.massSun !== undefined && ` · ${formatNumber(star.massSun)} M☉`}
              {star.tempK !== undefined && ` · ${formatNumber(star.tempK)} K`}
            </dd>
          </div>
        ))}
      </dl>

      {system.planets.length > 0 ? (
        <>
          <h3 style={{ fontSize: '0.95rem', margin: '14px 0 4px' }}>
            Known planets ({system.planets.length})
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="planet-table">
              <thead>
                <tr>
                  <th>Planet</th>
                  <th>Mass (M⊕)</th>
                  <th>Radius (R⊕)</th>
                  <th>Orbit (AU)</th>
                  <th>Period (d)</th>
                  <th>Found</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {system.planets.map((planet) => (
                  <tr key={planet.name}>
                    <td>
                      {planet.name}{' '}
                      {planet.inHabitableZone && <span className="hz-badge">HZ</span>}
                    </td>
                    <td>{formatNumber(planet.massEarth)}</td>
                    <td>{formatNumber(planet.radiusEarth)}</td>
                    <td>{formatNumber(planet.orbitAU)}</td>
                    <td>{formatNumber(planet.periodDays)}</td>
                    <td>{planet.discoveryYear}</td>
                    <td>{planet.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {system.planets.some((p) => p.note) && (
            <ul className="fact-list">
              {system.planets
                .filter((p) => p.note)
                .map((p) => (
                  <li key={p.name}>
                    <strong>{p.name}:</strong> {p.note}
                  </li>
                ))}
            </ul>
          )}
        </>
      ) : (
        <p className="empty-note">No confirmed planets in this system yet.</p>
      )}

      {hz && (
        <div className="hz-bar">
          <h3 style={{ fontSize: '0.95rem', margin: '14px 0 6px' }}>Habitable zone</h3>
          <HabitableZoneBar
            innerAU={hz.innerAU}
            outerAU={hz.outerAU}
            planets={system.planets}
          />
        </div>
      )}
    </DetailSheet>
  )
}

function HabitableZoneBar({
  innerAU,
  outerAU,
  planets,
}: {
  innerAU: number
  outerAU: number
  planets: StarSystem['planets']
}) {
  // log scale from 0.005 AU to 4× the HZ outer edge
  const minAU = 0.005
  const maxAU = outerAU * 4
  const toX = (au: number) =>
    (Math.log10(Math.max(minAU, au) / minAU) / Math.log10(maxAU / minAU)) * 100

  return (
    <svg viewBox="0 0 100 16" style={{ width: '100%', height: 44 }}>
      <rect x={0} y={6} width={100} height={4} rx={2} fill="var(--line)" />
      <rect
        x={toX(innerAU)}
        y={6}
        width={Math.max(1.5, toX(outerAU) - toX(innerAU))}
        height={4}
        rx={2}
        fill="rgba(74, 222, 128, 0.55)"
      />
      {planets
        .filter((p) => p.orbitAU !== undefined)
        .map((p) => (
          <circle
            key={p.name}
            cx={toX(p.orbitAU!)}
            cy={8}
            r={2.2}
            fill={p.inHabitableZone ? 'var(--status-operating)' : 'var(--text-dim)'}
          >
            <title>{p.name}</title>
          </circle>
        ))}
      <text x={toX(innerAU)} y={15.5} fontSize="3.4" fill="var(--text-faint)" textAnchor="middle">
        {innerAU} AU
      </text>
      <text x={toX(outerAU)} y={15.5} fontSize="3.4" fill="var(--text-faint)" textAnchor="middle">
        {outerAU} AU
      </text>
    </svg>
  )
}
