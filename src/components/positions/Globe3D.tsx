import { add, cross, dot, norm, scale, type Camera, type Vec3 } from '../../lib/vec3'
import { litPath } from './moonSvg'

const DEG = Math.PI / 180
const RAD = 180 / Math.PI

/** Path of the visible part of a small circle of latitude `latDeg` around `axis`. */
function latitudeCircle(cx: number, cy: number, r: number, axis: Vec3, latDeg: number, cam: Camera): string {
  const helper: Vec3 = Math.abs(axis[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]
  const p1 = norm(cross(axis, helper))
  const p2 = cross(axis, p1)
  const cosL = Math.cos(latDeg * DEG)
  const sinL = Math.sin(latDeg * DEG)
  const segs: string[] = []
  let pen = false
  for (let t = 0; t <= 360; t += 5) {
    const q = add(scale(add(scale(p1, Math.cos(t * DEG)), scale(p2, Math.sin(t * DEG))), cosL), scale(axis, sinL))
    if (dot(q, cam.toward) <= 0) {
      pen = false
      continue
    }
    segs.push(`${pen ? 'L' : 'M'} ${(cx + r * dot(q, cam.right)).toFixed(1)} ${(cy - r * dot(q, cam.up)).toFixed(1)}`)
    pen = true
  }
  return segs.join(' ')
}

/**
 * A lit globe: the night side is the projection of the hemisphere facing away from `sun`,
 * so the day–night line is a true ellipse and a tilted pole can sit wholly in daylight.
 */
export function Globe3D({
  cx,
  cy,
  r,
  sun,
  axis,
  cam,
  color,
  faded = false,
  showCircles = true,
  labelPole = true,
}: {
  cx: number
  cy: number
  r: number
  sun: Vec3 // unit vector from the globe toward the Sun
  axis: Vec3 // unit vector along the spin axis, north
  cam: Camera
  color: string
  faded?: boolean
  showCircles?: boolean
  labelPole?: boolean
}) {
  // phase: how much of the visible disc is lit depends on the Sun's component toward the viewer
  const sd = Math.max(-1, Math.min(1, dot(sun, cam.toward)))
  const elongation = Math.acos(-sd) * RAD // 0 = all dark, 180 = all lit
  const sx = dot(sun, cam.right)
  const sy = -dot(sun, cam.up)
  const litAngle = Math.atan2(sy, sx) * RAD
  const north = { x: cx + r * dot(axis, cam.right), y: cy - r * dot(axis, cam.up), front: dot(axis, cam.toward) > 0 }
  const ext = 1.4
  const a1 = { x: cx + ext * (north.x - cx), y: cy + ext * (north.y - cy) }
  const a2 = { x: cx - ext * (north.x - cx), y: cy - ext * (north.y - cy) }

  return (
    <g opacity={faded ? 0.5 : 1}>
      <circle cx={cx} cy={cy} r={r} fill={color} />
      {showCircles &&
        [
          { lat: 0, stroke: 'rgba(255,255,255,0.45)', dash: undefined },
          { lat: 66.56, stroke: 'rgba(255,255,255,0.3)', dash: '2 2' },
          { lat: -66.56, stroke: 'rgba(255,255,255,0.3)', dash: '2 2' },
        ].map((c) => (
          <path key={c.lat} d={latitudeCircle(cx, cy, r, axis, c.lat, cam)} fill="none" stroke={c.stroke} strokeWidth="0.8" strokeDasharray={c.dash} />
        ))}
      {/* night side */}
      <path d={litPath(cx, cy, r, elongation + 180)} transform={`rotate(${litAngle} ${cx} ${cy})`} fill="rgba(2, 5, 14, 0.72)" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.15)" />
      {/* spin axis */}
      <line x1={a2.x} y1={a2.y} x2={a1.x} y2={a1.y} stroke="var(--accent-amber)" strokeWidth={r > 30 ? 1.8 : 1.4} />
      <circle cx={north.x} cy={north.y} r={r > 30 ? 2.5 : 1.8} fill={north.front ? 'var(--accent-amber)' : 'rgba(255,184,77,0.4)'} />
      {labelPole && (
        <text x={a1.x + (a1.x >= cx ? 4 : -4)} y={a1.y - 3} textAnchor={a1.x >= cx ? 'start' : 'end'} fill="var(--accent-amber)" fontSize={r > 30 ? 12 : 10}>
          N
        </text>
      )}
    </g>
  )
}
