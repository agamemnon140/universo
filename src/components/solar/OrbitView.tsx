import { bodies } from '../../data'

const SIZE = 700
const CENTER = SIZE / 2
const MAX_PLOT_R = SIZE / 2 - 40

/** Log radial scale for orbit distances (0.3–40 AU). */
function orbitRadius(au: number): number {
  const minLog = Math.log10(0.3)
  const maxLog = Math.log10(45)
  const f = (Math.log10(au) - minLog) / (maxLog - minLog)
  return 30 + f * (MAX_PLOT_R - 30)
}

export function OrbitView({ onSelect }: { onSelect: (id: string) => void }) {
  const sun = bodies.find((b) => b.id === 'sun')!
  const orbiters = bodies.filter(
    (b) => (b.type === 'planet' || b.type === 'dwarf-planet') && b.orbitDistanceAU,
  )

  return (
    <div className="orbit-view panel">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Sun */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={14}
          fill={sun.color}
          style={{ cursor: 'pointer', filter: `drop-shadow(0 0 8px ${sun.color})` }}
          onClick={() => onSelect('sun')}
        />
        {orbiters.map((body, i) => {
          const r = orbitRadius(body.orbitDistanceAU!)
          // deterministic spread via golden angle so labels don't overlap
          const angle = ((i * 137.5 - 90) * Math.PI) / 180
          const x = CENTER + r * Math.cos(angle)
          const y = CENTER + r * Math.sin(angle)
          const dotR = Math.max(4, Math.min(11, Math.sqrt(body.radiusEarth) * 3))
          return (
            <g key={body.id}>
              <circle
                cx={CENTER}
                cy={CENTER}
                r={r}
                fill="none"
                stroke="var(--line-strong)"
                strokeWidth="1"
              />
              <g className="map-star" onClick={() => onSelect(body.id)}>
                <circle cx={x} cy={y} r={dotR} fill={body.color} />
                <circle cx={x} cy={y} r={dotR + 9} fill="transparent" />
                <text
                  x={x}
                  y={y - dotR - 6}
                  textAnchor="middle"
                  fill="var(--text-dim)"
                  fontSize="13"
                >
                  {body.name}
                </text>
              </g>
            </g>
          )
        })}
        <text x={CENTER} y={SIZE - 8} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
          orbit distances on log scale · positions are illustrative
        </text>
      </svg>
    </div>
  )
}
