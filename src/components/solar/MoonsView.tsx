import { useState } from 'react'
import { bodies, bodyById } from '../../data'
import { BodyCard } from './BodyCard'
import { SortControl } from './SortControl'
import { formatNumber } from '../../lib/format'
import { sortBodies, sortCaption, type BodySort } from '../../lib/sortBodies'

const SIZE = 700
const CENTER_X = SIZE / 2
const CENTER_Y = 235
const HEIGHT = 470

const PLANET_ORDER = ['earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']

/** 'all' pools every planet's moons into one grid; a planet id zooms into its system. */
type MoonScope = 'all' | (typeof PLANET_ORDER)[number]

export function MoonsView({
  selected,
  sort,
  onSort,
  onToggle,
  onDetail,
}: {
  selected: string[]
  sort: BodySort
  onSort: (s: BodySort) => void
  onToggle: (id: string) => void
  onDetail: (id: string) => void
}) {
  const [planetId, setPlanetId] = useState<MoonScope>(() => {
    const p = new URLSearchParams(window.location.search).get('planet')
    return p && PLANET_ORDER.includes(p) ? p : 'all'
  })
  const showAll = planetId === 'all'
  const planet = showAll ? undefined : bodyById.get(planetId)!
  const moons = bodies
    .filter((b) => (showAll ? b.type === 'moon' : b.parent === planetId))
    .sort((a, b) => a.orbitDistanceKm! - b.orbitDistanceKm!)

  const minOrbit = moons[0]?.orbitDistanceKm ?? 1
  const maxOrbit = moons[moons.length - 1]?.orbitDistanceKm ?? 1
  const spread = Math.log10(maxOrbit / minOrbit) || 1

  const orbitRadius = (km: number) =>
    70 + (Math.log10(km / minOrbit) / spread) * (CENTER_X - 110)

  return (
    <>
      <div className="chips" style={{ marginBottom: 12 }}>
        <button
          className={`chip${showAll ? ' on' : ''}`}
          style={showAll ? { background: 'var(--accent-cyan)' } : undefined}
          onClick={() => setPlanetId('all')}
        >
          All planets
        </button>
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

      {showAll ? (
        <p className="hint">
          All {moons.length} major moons of the solar system in one grid — each card names the
          planet it circles. Sorting by tidal grip ranks how hard a moon kneads its planet:
          its mass relative to the planet's, weighted by closeness, with the Moon's grip on
          Earth (our ocean tides) as 1. Pick a planet above for its orbit map.
        </p>
      ) : (
        <p className="hint">
          {planet!.name} has {formatNumber(planet!.moonCount)} known{' '}
          {planet!.moonCount === 1 ? 'moon' : 'moons'}
          {moons.length < planet!.moonCount
            ? ` — the ${moons.length} at least ~100 km across are shown (larger than almost every asteroid); the rest are small captured rocks`
            : ''}
          . Orbits on a log scale. Tap a moon to select it for comparison, or use a card's
          Details button.
        </p>
      )}

      {planet && (
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
      )}

      <SortControl sort={sort} onSort={onSort} />

      <div className="body-grid">
        {sortBodies(moons, sort).map((moon) => {
          const value = sortCaption(moon, sort)
          const parentName = bodyById.get(moon.parent!)?.name
          // pooled grid: name the planet, except where the distance caption already does
          const caption =
            !showAll || sort === 'distance'
              ? value
              : value
                ? `${parentName} · ${value}`
                : `moon of ${parentName}`
          return (
            <BodyCard
              key={moon.id}
              body={moon}
              maxRadius={Math.max(...moons.map((m) => m.radiusEarth))}
              caption={caption}
              selected={selected.includes(moon.id)}
              onToggle={() => onToggle(moon.id)}
              onDetail={() => onDetail(moon.id)}
            />
          )
        })}
      </div>
    </>
  )
}
