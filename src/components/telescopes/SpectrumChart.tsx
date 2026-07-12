import type { Telescope } from '../../types'
import {
  EM_BANDS,
  AXIS_MIN_LOG,
  AXIS_DECADES,
  STATUS_COLORS,
  STATUS_LABELS,
  wavelengthToX,
} from '../../lib/spectrum'

const WIDTH = 940
const LABEL_W = 150 // left gutter for telescope names
const PLOT_W = WIDTH - LABEL_W - 20
const ROW_H = 21
const BAND_H = 26
const HEADER_H = BAND_H + 26

function bandX(logValue: number): number {
  return LABEL_W + ((logValue - AXIS_MIN_LOG) / AXIS_DECADES) * PLOT_W
}

export function SpectrumChart({
  telescopes,
  onSelect,
}: {
  telescopes: Telescope[]
  onSelect: (t: Telescope) => void
}) {
  const em = telescopes
    .filter((t) => t.kind === 'em' && t.wavelengthMinM && t.wavelengthMaxM)
    .sort((a, b) => a.wavelengthMinM! - b.wavelengthMinM!)
  const gw = telescopes.filter((t) => t.kind === 'gravitational-wave')
  const nu = telescopes.filter((t) => t.kind === 'neutrino')

  const lanes: { title: string; items: Telescope[] }[] = []
  if (gw.length > 0) lanes.push({ title: 'Gravitational waves', items: gw })
  if (nu.length > 0) lanes.push({ title: 'Neutrinos', items: nu })

  const lanesH = lanes.reduce((h, lane) => h + 24 + lane.items.length * ROW_H + 6, 0)
  const height = HEADER_H + em.length * ROW_H + lanesH + 16

  return (
    <div className="panel spectrum-chart" style={{ padding: '16px 8px' }}>
      <svg viewBox={`0 0 ${WIDTH} ${height}`}>
        {/* EM band strip */}
        {EM_BANDS.map((band) => {
          const x0 = bandX(band.minLog)
          const x1 = bandX(band.maxLog)
          return (
            <g key={band.name}>
              <rect
                x={x0}
                y={0}
                width={x1 - x0}
                height={BAND_H}
                fill={band.color}
                opacity={0.22}
                stroke={band.color}
                strokeOpacity={0.45}
              />
              {x1 - x0 > 34 && (
                <text
                  x={(x0 + x1) / 2}
                  y={BAND_H / 2 + 4}
                  textAnchor="middle"
                  fill={band.color}
                  fontSize="11"
                  fontWeight="600"
                >
                  {band.name}
                </text>
              )}
            </g>
          )
        })}
        <text x={LABEL_W} y={BAND_H + 16} fill="var(--text-faint)" fontSize="10">
          ← shorter wavelength (gamma)
        </text>
        <text x={WIDTH - 20} y={BAND_H + 16} textAnchor="end" fill="var(--text-faint)" fontSize="10">
          longer wavelength (radio) →
        </text>

        {/* EM telescope bars */}
        {em.map((t, i) => {
          const y = HEADER_H + i * ROW_H
          const x0 = LABEL_W + wavelengthToX(t.wavelengthMinM!) * PLOT_W
          const x1 = LABEL_W + wavelengthToX(t.wavelengthMaxM!) * PLOT_W
          const color = STATUS_COLORS[t.status]
          return (
            <g key={t.id} className="spectrum-bar" onClick={() => onSelect(t)}>
              <rect x={0} y={y} width={WIDTH} height={ROW_H} fill="transparent" />
              <text
                x={LABEL_W - 8}
                y={y + ROW_H / 2 + 4}
                textAnchor="end"
                fill="var(--text-dim)"
                fontSize="11.5"
              >
                {t.name}
              </text>
              <rect
                x={x0}
                y={y + 5}
                width={Math.max(4, x1 - x0)}
                height={ROW_H - 10}
                rx={4}
                fill={color}
                opacity={t.status === 'retired' ? 0.55 : 0.9}
              />
            </g>
          )
        })}

        {/* GW / neutrino lanes */}
        {(() => {
          let y = HEADER_H + em.length * ROW_H + 8
          return lanes.map((lane) => {
            const laneTop = y
            y += 24 + lane.items.length * ROW_H + 6
            return (
              <g key={lane.title}>
                <line
                  x1={0}
                  y1={laneTop}
                  x2={WIDTH}
                  y2={laneTop}
                  stroke="var(--line)"
                  strokeWidth="1"
                />
                <text
                  x={0}
                  y={laneTop + 16}
                  fill="var(--text-faint)"
                  fontSize="10.5"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  {lane.title}
                </text>
                {lane.items.map((t, j) => {
                  const ry = laneTop + 22 + j * ROW_H
                  const color = STATUS_COLORS[t.status]
                  return (
                    <g key={t.id} className="spectrum-bar" onClick={() => onSelect(t)}>
                      <rect x={0} y={ry} width={WIDTH} height={ROW_H} fill="transparent" />
                      <text
                        x={LABEL_W - 8}
                        y={ry + ROW_H / 2 + 4}
                        textAnchor="end"
                        fill="var(--text-dim)"
                        fontSize="11.5"
                      >
                        {t.name}
                      </text>
                      <rect
                        x={LABEL_W}
                        y={ry + 5}
                        width={PLOT_W * 0.35}
                        height={ROW_H - 10}
                        rx={4}
                        fill={color}
                        opacity={0.9}
                      />
                      <text
                        x={LABEL_W + PLOT_W * 0.35 + 10}
                        y={ry + ROW_H / 2 + 4}
                        fill="var(--text-faint)"
                        fontSize="10.5"
                      >
                        {t.signalLabel ?? ''}
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })
        })()}
      </svg>
      <div className="legend">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <span key={key}>
            <span className="dot" style={{ background: STATUS_COLORS[key] }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
