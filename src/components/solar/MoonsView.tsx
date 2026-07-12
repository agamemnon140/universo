import { useState } from 'react'
import { bodies, bodyById } from '../../data'
import { BodyCard } from './BodyCard'
import { formatNumber } from '../../lib/format'

const SIZE = 700
const CENTER_X = SIZE / 2
const CENTER_Y = 235
const HEIGHT = 470

const PLANET_ORDER = ['earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']

export function MoonsView({
  selected,
  onToggle,
  onDetail,
}: {
  selected: string[]
  onToggle: (id: string) => void
  onDetail: (id: string) => void
}) {
  const [planetId, setPlanetId] = useState(() => {
    const p = new URLSearchParams(window.location.search).get('planet')
    return p && PLANET_ORDER.includes(p) ? p : 'jupiter'
  })
  const planet = bodyById.get(planetId)!
  const moons = bodies
    .filter((b) => b.parent === planetId)
    .sort((a, b) => a.orbitDistanceKm! - b.orbitDistanceKm!)

  const minOrbit = moons[0]?.orbitDistanceKm ?? 1
  const maxOrbit = moons[moons.length - 1]?.orbitDistanceKm ?? 1
  const spread = Math.log10(maxOrbit / minOrbit) || 1

  const orbitRadius = (km: number) =>
    70 + (Math.log10(km / minOrbit) / spread) * (CENTER_X - 110)

  return (
    <>
      <div className="chips" style={{ marginBottom: 12 }}>
        {PLANET_ORDER.map((id) => {
          const p = bodyById.get(id)!
          return (
            <button
              key={id}
              className={`chip${planetId === id ? ' on' : ''}`}
              style={planetId === id ? { background: p.color } : undefined}
              onClick={() => setPlanetId(id)}
            >
              {p.name}
            </button>
          )
        })}
      </div>

      <p className="hint">
        {planet.name} has {formatNumber(planet.moonCount)} known{' '}
        {planet.moonCount === 1 ? 'moon' : 'moons'}
        {moons.length < planet.moonCount ? ` — the ${moons.length} most important are shown` : ''}.
        Orbits on a log scale. Tap a moon to select it for comparison; tap ⓘ on a card for
        details.
      </p>

      <div className="panel" style={{ padding: 8, marginBottom: 14 }}>
        <svg viewBox={`0 0 ${SIZE} ${HEIGHT}`} style={{ width: '100%', height: 'auto' }}>
          {/* parent planet */}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={26}
            fill={planet.gradient?.[1] ?? planet.color}
            style={{ cursor: 'pointer' }}
            onClick={() => onDetail(planet.id)}
          />
          <text
            x={CENTER_X}
            y={CENTER_Y - 36}
            textAnchor="middle"
            fill="var(--text-dim)"
            fontSize="13"
          >
            {planet.name}
          </text>

          {moons.map((moon, i) => {
            const r = orbitRadius(moon.orbitDistanceKm!)
            const angle = ((i * 137.5 - 60) * Math.PI) / 180
            const x = CENTER_X + r * Math.cos(angle)
            const y = CENTER_Y + r * Math.sin(angle) * 0.55 // squash to ellipse
            const dotR = Math.max(3.5, Math.min(12, Math.sqrt(moon.radiusEarth) * 22))
            const isSelected = selected.includes(moon.id)
            return (
              <g key={moon.id}>
                <ellipse
                  cx={CENTER_X}
                  cy={CENTER_Y}
                  rx={r}
                  ry={r * 0.55}
                  fill="none"
                  stroke={isSelected ? 'var(--accent-amber)' : 'var(--line-strong)'}
                  strokeWidth={isSelected ? 1.6 : 1}
                />
                <g className="map-star" onClick={() => onToggle(moon.id)}>
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r={dotR + 5}
                      fill="none"
                      stroke="var(--accent-amber)"
                      strokeWidth="1.6"
                    />
                  )}
                  <circle cx={x} cy={y} r={dotR} fill={moon.color} />
                  <circle cx={x} cy={y} r={Math.max(dotR + 8, 12)} fill="transparent" />
                  <text
                    x={x}
                    y={y - dotR - 7}
                    textAnchor="middle"
                    fill={isSelected ? 'var(--accent-amber)' : 'var(--text-dim)'}
                    fontSize="12"
                  >
                    {moon.name}
                  </text>
                </g>
              </g>
            )
          })}
          <text x={CENTER_X} y={HEIGHT - 8} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
            orbit distances on log scale · positions are illustrative
          </text>
        </svg>
      </div>

      <div className="body-grid">
        {moons
          .slice()
          .sort((a, b) => b.radiusEarth - a.radiusEarth)
          .map((moon) => (
            <BodyCard
              key={moon.id}
              body={moon}
              maxRadius={Math.max(...moons.map((m) => m.radiusEarth))}
              selected={selected.includes(moon.id)}
              onToggle={() => onToggle(moon.id)}
              onDetail={() => onDetail(moon.id)}
            />
          ))}
      </div>
    </>
  )
}
