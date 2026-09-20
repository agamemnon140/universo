import type { ReactNode } from 'react'
import type { OrbitState } from '../../lib/apsides'
import { wrap360 } from '../../lib/ephemeris'

const W = 700
const H = 350
const DEG = Math.PI / 180

/** Polar radius of an ellipse from its focus, for true anomaly ν (degrees). */
function radius(a: number, e: number, nuDeg: number): number {
  return (a * (1 - e * e)) / (1 + e * Math.cos(nuDeg * DEG))
}

/** Area swept from the focus between two true anomalies (½∫r²dν, numeric). */
function sweptArea(a: number, e: number, nu1: number, nu2: number): number {
  const n = 60
  let area = 0
  for (let k = 0; k < n; k++) {
    const nu = nu1 + ((nu2 - nu1) * (k + 0.5)) / n
    const r = radius(a, e, nu)
    area += 0.5 * r * r * ((nu2 - nu1) / n) * DEG
  }
  return area
}

function sectorPath(fx: number, fy: number, a: number, e: number, nu1: number, nu2: number, rot: number): string {
  const pts: string[] = [`M ${fx} ${fy}`]
  for (let k = 0; k <= 30; k++) {
    const nu = nu1 + ((nu2 - nu1) * k) / 30
    const r = radius(a, e, nu)
    pts.push(`L ${(fx + r * Math.cos((nu + rot) * DEG)).toFixed(1)} ${(fy - r * Math.sin((nu + rot) * DEG)).toFixed(1)}`)
  }
  return pts.join(' ') + ' z'
}

function ellipsePath(fx: number, fy: number, a: number, e: number, rot: number): string {
  const pts: string[] = []
  for (let k = 0; k <= 120; k++) {
    const nu = (k / 120) * 360
    const r = radius(a, e, nu)
    pts.push(`${k === 0 ? 'M' : 'L'} ${(fx + r * Math.cos((nu + rot) * DEG)).toFixed(1)} ${(fy - r * Math.sin((nu + rot) * DEG)).toFixed(1)}`)
  }
  return pts.join(' ') + ' z'
}

export function OrbitShapeFigure({
  state,
  centralColor,
  centralName,
  centralRadius,
  orbiterColor,
  orbiterName,
  orbiterLonDeg,
  periLonDeg,
  periName,
  apoName,
  distanceLabel,
  extra,
}: {
  state: OrbitState
  centralColor: string
  centralName: string
  centralRadius: number
  orbiterColor: string
  orbiterName: string
  orbiterLonDeg: number // current ecliptic longitude as seen from the central body
  periLonDeg: number // ecliptic longitude of the nearest point of the orbit
  periName: string
  apoName: string
  distanceLabel: string
  extra?: ReactNode
}) {
  const e = state.eccentricity
  const nu = wrap360(orbiterLonDeg - periLonDeg) // true anomaly

  // left: true shape, ♈ to the right, scaled so the far point fits
  const LX = 170
  const LY = 170
  const scale = 112 / (state.semiMajorKm * (1 + e))
  const aL = state.semiMajorKm * scale
  const rNow = state.distanceKm * scale
  const now = { x: LX + rNow * Math.cos(orbiterLonDeg * DEG), y: LY - rNow * Math.sin(orbiterLonDeg * DEG) }
  const peri = { x: LX + aL * (1 - e) * Math.cos(periLonDeg * DEG), y: LY - aL * (1 - e) * Math.sin(periLonDeg * DEG) }
  const apo = { x: LX - aL * (1 + e) * Math.cos(periLonDeg * DEG), y: LY + aL * (1 + e) * Math.sin(periLonDeg * DEG) }
  // apsis labels step aside when the body's label would sit on top of them
  const hidePeri = Math.hypot(now.x - peri.x, now.y - peri.y) < 60
  const hideApo = Math.hypot(now.x - apo.x, now.y - apo.y) < 60

  // right: the same orbit with e stretched to 0.5, nearest point to the right
  const RX = 545
  const RY = 150
  const E2 = 0.5
  const a2 = 100
  // by distance: is the body at one end of its orbit?
  const nearPeri = state.fraction < 0.08
  const nearApo = state.fraction > 0.92
  const r2 = radius(a2, E2, nu)
  const now2 = { x: RX + r2 * Math.cos(nu * DEG), y: RY - r2 * Math.sin(nu * DEG) }
  const c2 = { x: RX - a2 * E2, y: RY } // ellipse centre
  const focus2 = { x: RX - 2 * a2 * E2, y: RY } // the empty focus
  // Kepler's second law: two sectors of equal area, one at each end
  const dApo = 14
  const targetArea = sweptArea(a2, E2, 180 - dApo / 2, 180 + dApo / 2)
  let dPeri = 10
  while (sweptArea(a2, E2, -dPeri / 2, dPeri / 2) < targetArea && dPeri < 170) dPeri += 1

  return (
    <svg viewBox={`0 0 ${W} ${H}`}>
      {/* ---- true shape ---- */}
      <text x={LX} y={22} textAnchor="middle" fill="var(--text-dim)" fontSize="12">
        true shape · e = {e.toFixed(3)}
      </text>
      <path d={ellipsePath(LX, LY, aL, e, periLonDeg)} fill="rgba(120,150,255,0.04)" stroke="var(--line-strong)" />
      {/* line of apsides */}
      <line x1={peri.x} y1={peri.y} x2={apo.x} y2={apo.y} stroke="var(--line-strong)" strokeDasharray="3 4" />
      <circle cx={LX} cy={LY} r={centralRadius} fill={centralColor} style={{ filter: `drop-shadow(0 0 6px ${centralColor})` }} />
      <circle cx={peri.x} cy={peri.y} r={3} fill="var(--accent-amber)" />
      <circle cx={apo.x} cy={apo.y} r={3} fill="var(--accent-cyan)" />
      {!hidePeri && (
        <text x={peri.x} y={peri.y + (peri.y < LY ? -8 : 16)} textAnchor="middle" fill="var(--accent-amber)" fontSize="11">
          {periName}
        </text>
      )}
      {!hideApo && (
        <text x={apo.x} y={apo.y + (apo.y < LY ? -8 : 16)} textAnchor="middle" fill="var(--accent-cyan)" fontSize="11">
          {apoName}
        </text>
      )}
      <line x1={LX} y1={LY} x2={now.x} y2={now.y} stroke={orbiterColor} strokeOpacity="0.5" strokeDasharray="3 3" />
      <circle cx={now.x} cy={now.y} r={6} fill={orbiterColor} />
      <text
        x={Math.min(Math.max(now.x, 70), 290)}
        y={now.y + (now.y < LY ? -11 : 19)}
        textAnchor="middle"
        fill="var(--text)"
        fontSize="12"
        fontWeight="600"
      >
        {orbiterName} · {distanceLabel}
        {nearPeri ? ` (${periName.toLowerCase()})` : nearApo ? ` (${apoName.toLowerCase()})` : ''}
      </text>
      <text x={LX} y={H - 10} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
        {centralName} sits at one focus — barely off centre · ♈ to the right
      </text>

      {/* ---- exaggerated ---- */}
      <text x={RX - a2 * E2} y={22} textAnchor="middle" fill="var(--text-dim)" fontSize="12">
        same orbit with e stretched to 0.5
      </text>
      <path d={ellipsePath(RX, RY, a2, E2, 0)} fill="rgba(120,150,255,0.04)" stroke="var(--line-strong)" />
      <path d={sectorPath(RX, RY, a2, E2, -dPeri / 2, dPeri / 2, 0)} fill="rgba(255,184,77,0.22)" />
      <path d={sectorPath(RX, RY, a2, E2, 180 - dApo / 2, 180 + dApo / 2, 0)} fill="rgba(77,216,255,0.22)" />
      <line x1={RX - a2 * (1 + E2)} y1={RY} x2={RX + a2 * (1 - E2)} y2={RY} stroke="var(--line-strong)" strokeDasharray="3 4" />
      <circle cx={c2.x} cy={c2.y} r={2} fill="var(--text-faint)" />
      <circle cx={focus2.x} cy={focus2.y} r={3} fill="none" stroke="var(--text-faint)" />
      <text x={focus2.x} y={focus2.y + 16} textAnchor="middle" fill="var(--text-faint)" fontSize="10">
        empty focus
      </text>
      <circle cx={RX} cy={RY} r={centralRadius} fill={centralColor} style={{ filter: `drop-shadow(0 0 6px ${centralColor})` }} />
      <circle cx={now2.x} cy={now2.y} r={6} fill={orbiterColor} />
      <text x={RX + a2 * (1 - E2) + 6} y={RY + 4} fill="var(--accent-amber)" fontSize="11">
        {periName}
      </text>
      <text x={RX - a2 * (1 + E2) - 6} y={RY + 4} textAnchor="end" fill="var(--accent-cyan)" fontSize="11">
        {apoName}
      </text>
      <text x={RX - a2 * E2} y={RY + a2 * Math.sqrt(1 - E2 * E2) + 20} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
        shaded sectors: equal areas in equal times — fast near {periName.toLowerCase()}, slow near {apoName.toLowerCase()}
      </text>
      {extra}
    </svg>
  )
}
