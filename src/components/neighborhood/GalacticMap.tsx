import type { StarSystem } from '../../types'
import { systems } from '../../data'
import { galacticLongitude, logRadial } from '../../lib/project'
import { spectralColor, markerRadius } from '../../lib/spectral'

const SIZE = 760
const CENTER = SIZE / 2
const PLOT_R = SIZE / 2 - 34

/** Ring distances (ly) per zoom level. */
const RINGS: Record<number, number[]> = {
  20: [5, 10, 15, 20],
  100: [10, 25, 50, 100],
  1500: [50, 200, 600, 1500],
}

export function GalacticMap({
  maxLy,
  onSelect,
}: {
  maxLy: number
  onSelect: (s: StarSystem) => void
}) {
  const visible = systems.filter((s) => s.distanceLy <= maxLy)
  const rings = RINGS[maxLy] ?? [maxLy / 4, maxLy / 2, maxLy]
  const showLabels = maxLy > 20 ? visible.length <= 40 : true

  return (
    <div className="galactic-map panel" style={{ padding: 8 }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* distance rings */}
        {rings.map((ringLy) => {
          const r = logRadial(ringLy, maxLy) * PLOT_R
          return (
            <g key={ringLy}>
              <circle
                cx={CENTER}
                cy={CENTER}
                r={r}
                fill="none"
                stroke="var(--line)"
                strokeWidth="1"
              />
              <text
                x={CENTER + 4}
                y={CENTER - r - 4}
                fill="var(--text-faint)"
                fontSize="11"
              >
                {ringLy} ly
              </text>
            </g>
          )
        })}

        {/* Sun */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={6}
          fill="#ffd166"
          style={{ filter: 'drop-shadow(0 0 6px #ffd166)' }}
        />
        <text x={CENTER} y={CENTER + 20} textAnchor="middle" fill="var(--text-dim)" fontSize="11">
          Sun
        </text>

        {/* star systems */}
        {visible.map((system) => {
          const l = galacticLongitude(system.ra, system.dec)
          const r = logRadial(system.distanceLy, maxLy) * PLOT_R
          // +x toward galactic center (right), +y galactic rotation (up in SVG = -y)
          const x = CENTER + r * Math.cos(l)
          const y = CENTER - r * Math.sin(l)
          const primary = system.stars[0]
          const dotR = markerRadius(primary?.radiusSun ?? 0.5)
          const hasPlanets = system.planets.length > 0
          const labelled = showLabels || hasPlanets

          return (
            <g key={system.id} className="map-star" onClick={() => onSelect(system)}>
              {hasPlanets && (
                <circle
                  cx={x}
                  cy={y}
                  r={dotR + 4}
                  fill="none"
                  stroke="var(--accent-amber)"
                  strokeWidth="1.4"
                  opacity="0.9"
                />
              )}
              <circle cx={x} cy={y} r={dotR} fill={spectralColor(primary?.spectralClass ?? 'G')} />
              <circle cx={x} cy={y} r={Math.max(dotR + 7, 11)} fill="transparent" />
              {labelled && (
                <text
                  x={x}
                  y={y - dotR - 6}
                  textAnchor="middle"
                  fill="var(--text-dim)"
                  fontSize="10.5"
                >
                  {system.name}
                </text>
              )}
            </g>
          )
        })}

        <text x={CENTER} y={SIZE - 6} textAnchor="middle" fill="var(--text-faint)" fontSize="10.5">
          log distance scale · galactic center toward the right · {visible.length} systems shown
        </text>
      </svg>
      <div className="legend" style={{ padding: '0 10px 8px' }}>
        <span>
          <span className="dot" style={{ background: '#9db4ff' }} /> hot (O/B/A)
        </span>
        <span>
          <span className="dot" style={{ background: '#fff4ea' }} /> Sun-like (F/G)
        </span>
        <span>
          <span className="dot" style={{ background: '#ffb56c' }} /> red/orange dwarf (K/M)
        </span>
        <span>
          <span className="dot" style={{ background: '#c9d4e8' }} /> white dwarf
        </span>
        <span>
          <span
            className="dot"
            style={{ background: 'transparent', border: '1.5px solid var(--accent-amber)' }}
          />
          has exoplanets
        </span>
      </div>
    </div>
  )
}
