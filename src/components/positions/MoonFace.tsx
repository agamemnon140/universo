import { APOLLO_11 } from '../../lib/libration'
import { litPath } from './moonSvg'

const DEG = Math.PI / 180

/** Stylised near side: the big maria and two bright craters, selenographic coordinates. */
const MARIA: { name: string; lat: number; lon: number; r: number }[] = [
  { name: 'Mare Imbrium', lat: 32.8, lon: -15.6, r: 18 },
  { name: 'Mare Serenitatis', lat: 28, lon: 17.5, r: 11.5 },
  { name: 'Mare Tranquillitatis', lat: 8.5, lon: 31.4, r: 14 },
  { name: 'Mare Crisium', lat: 17, lon: 59.1, r: 9 },
  { name: 'Mare Fecunditatis', lat: -7.8, lon: 51.3, r: 13 },
  { name: 'Mare Nectaris', lat: -15.2, lon: 35.5, r: 5.5 },
  { name: 'Oceanus Procellarum', lat: 26, lon: -52, r: 16 },
  { name: 'Oceanus Procellarum', lat: 8, lon: -60, r: 15 },
  { name: 'Oceanus Procellarum', lat: -8, lon: -50, r: 9 },
  { name: 'Mare Nubium', lat: -21.3, lon: -16.6, r: 11 },
  { name: 'Mare Humorum', lat: -24.4, lon: -38.6, r: 6.5 },
  { name: 'Mare Frigoris', lat: 56, lon: -25, r: 6 },
  { name: 'Mare Frigoris', lat: 57, lon: 0, r: 6 },
  { name: 'Mare Frigoris', lat: 55, lon: 25, r: 5 },
  { name: 'Mare Vaporum', lat: 13.3, lon: 3.6, r: 4 },
]

const CRATERS = [
  { name: 'Tycho', lat: -43.3, lon: -11.4, r: 1.6 },
  { name: 'Copernicus', lat: 9.6, lon: -20.1, r: 1.6 },
]

interface Projected {
  x: number
  y: number
  z: number // > 0 = facing us
}

/** Orthographic projection with the sub-Earth point at (subLat, subLon); north up, east right. */
function project(latDeg: number, lonDeg: number, subLat: number, subLon: number, R: number): Projected {
  const phi = latDeg * DEG
  const lam = (lonDeg - subLon) * DEG
  const b = subLat * DEG
  const x = Math.cos(phi) * Math.sin(lam)
  const y = Math.cos(b) * Math.sin(phi) - Math.sin(b) * Math.cos(phi) * Math.cos(lam)
  const z = Math.sin(b) * Math.sin(phi) + Math.cos(b) * Math.cos(phi) * Math.cos(lam)
  return { x: R * x, y: -R * y, z }
}

function gridLine(points: [number, number][], subLat: number, subLon: number, R: number, cx: number, cy: number) {
  const segs: string[] = []
  let pen = false
  for (const [lat, lon] of points) {
    const p = project(lat, lon, subLat, subLon, R)
    if (p.z <= 0) {
      pen = false
      continue
    }
    segs.push(`${pen ? 'L' : 'M'} ${(cx + p.x).toFixed(1)} ${(cy + p.y).toFixed(1)}`)
    pen = true
  }
  return segs.join(' ')
}

export function MoonFace({
  cx,
  cy,
  r,
  elongationDeg,
  librationLon,
  librationLat,
  showGrid = true,
  markers = true,
}: {
  cx: number
  cy: number
  r: number
  elongationDeg: number
  librationLon: number
  librationLat: number
  showGrid?: boolean
  markers?: boolean
}) {
  const sub = { lat: librationLat, lon: librationLon }
  const meridians = [-60, -30, 0, 30, 60].map((lon) =>
    gridLine(
      Array.from({ length: 37 }, (_, k) => [-90 + k * 5, lon] as [number, number]),
      sub.lat,
      sub.lon,
      r,
      cx,
      cy,
    ),
  )
  const parallels = [-60, -30, 0, 30, 60].map((lat) =>
    gridLine(
      Array.from({ length: 73 }, (_, k) => [lat, -180 + k * 5] as [number, number]),
      sub.lat,
      sub.lon,
      r,
      cx,
      cy,
    ),
  )
  const meanCentre = project(0, 0, sub.lat, sub.lon, r)
  const apollo = project(APOLLO_11.lat, APOLLO_11.lon, sub.lat, sub.lon, r)

  return (
    <g>
      <defs>
        <clipPath id={`moon-clip-${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="#d8d8de" />
      <g clipPath={`url(#moon-clip-${cx}-${cy})`}>
        {MARIA.map((m, k) => {
          const p = project(m.lat, m.lon, sub.lat, sub.lon, r)
          if (p.z <= 0) return null
          const size = r * Math.sin(m.r * DEG)
          const angle = (Math.atan2(p.y, p.x) * 180) / Math.PI
          return (
            <ellipse
              key={k}
              cx={cx + p.x}
              cy={cy + p.y}
              rx={Math.max(0.5, size * p.z)}
              ry={size}
              transform={`rotate(${angle} ${cx + p.x} ${cy + p.y})`}
              fill="#8e8e9c"
              opacity="0.85"
            >
              <title>{m.name}</title>
            </ellipse>
          )
        })}
        {CRATERS.map((c) => {
          const p = project(c.lat, c.lon, sub.lat, sub.lon, r)
          if (p.z <= 0) return null
          return (
            <g key={c.name}>
              <circle cx={cx + p.x} cy={cy + p.y} r={r * Math.sin(c.r * DEG) * 3} fill="#f2f2f6" opacity="0.35" />
              <circle cx={cx + p.x} cy={cy + p.y} r={Math.max(1.2, r * Math.sin(c.r * DEG))} fill="#f8f8fc">
                <title>{c.name}</title>
              </circle>
            </g>
          )
        })}
        {showGrid &&
          [...meridians, ...parallels].map((d, k) => (
            <path key={k} d={d} fill="none" stroke="rgba(20,30,60,0.35)" strokeWidth="0.6" />
          ))}
        {/* night side */}
        <path d={litPath(cx, cy, r, elongationDeg + 180)} fill="rgba(2, 5, 14, 0.82)" />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line-strong)" />
      {markers && (
        <g>
          {/* sub-Earth point (disc centre) and the mean centre, offset by the libration */}
          <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke="var(--accent-cyan)" strokeWidth="1" />
          <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} stroke="var(--accent-cyan)" strokeWidth="1" />
          <line x1={cx} y1={cy} x2={cx + meanCentre.x} y2={cy + meanCentre.y} stroke="var(--accent-amber)" strokeWidth="1.2" />
          <circle cx={cx + meanCentre.x} cy={cy + meanCentre.y} r={2.5} fill="var(--accent-amber)" />
          {apollo.z > 0 && (
            <g>
              <circle cx={cx + apollo.x} cy={cy + apollo.y} r={3} fill="none" stroke="var(--status-operating)" strokeWidth="1.4" />
              <circle cx={cx + apollo.x} cy={cy + apollo.y} r={1} fill="var(--status-operating)" />
            </g>
          )}
        </g>
      )}
    </g>
  )
}
