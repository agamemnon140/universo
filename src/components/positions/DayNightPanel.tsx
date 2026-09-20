import { useMemo } from 'react'
import { bodyById } from '../../data'
import { OBLIQUITY_DEG } from '../../data/orbits'
import { planetHeliocentric, seasonInfo } from '../../lib/ephemeris'
import { EARTH_AXIS, sunDirection } from '../../lib/earthGeometry'
import { cameraFrom, scale, type Camera } from '../../lib/vec3'
import { Globe3D } from './Globe3D'

const DEG = Math.PI / 180

/** Side view: sunlight from the left, ecliptic north up, viewer in the ecliptic plane. */
function sideCamera(earthLonDeg: number): Camera {
  return cameraFrom(scale(sunDirection(earthLonDeg), -1), [0, 0, 1])
}

const FRAMES = [
  { earthLon: 180, label: 'March equinox' },
  { earthLon: 270, label: 'June solstice' },
  { earthLon: 0, label: 'September equinox' },
  { earthLon: 90, label: 'December solstice' },
]

const LATITUDES = [
  { lat: 66.56, name: 'Arctic Circle' },
  { lat: 45, name: '45° N (Milan, Montreal)' },
  { lat: 23.44, name: 'Tropic of Cancer' },
  { lat: 0, name: 'Equator' },
  { lat: -23.55, name: 'São Paulo (23.6° S)' },
  { lat: -45, name: '45° S (New Zealand)' },
  { lat: -66.56, name: 'Antarctic Circle' },
]

/** Hours of daylight at latitude φ when the Sun's declination is δ (ignoring refraction). */
function dayLengthHours(latDeg: number, decDeg: number): number {
  const cosH = -Math.tan(latDeg * DEG) * Math.tan(decDeg * DEG)
  if (cosH <= -1) return 24
  if (cosH >= 1) return 0
  return (2 * Math.acos(cosH)) / DEG / 15
}

function hm(hours: number): string {
  if (hours >= 24) return '24 h — midnight Sun'
  if (hours <= 0) return '0 h — polar night'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h} h ${String(m).padStart(2, '0')} min`
}

export function DayNightPanel({ jd }: { jd: number }) {
  const earth = bodyById.get('earth')!
  const sun = bodyById.get('sun')!
  const { earthLon, season } = useMemo(
    () => ({ earthLon: planetHeliocentric('earth', jd).lonDeg, season: seasonInfo(jd) }),
    [jd],
  )
  const color = earth.gradient?.[0] ?? earth.color
  const dec = season.declinationDeg

  return (
    <div className="panel diagram">
      <h3>Reading the day–night line</h3>
      <svg viewBox="0 0 700 330">
        {/* sunlight */}
        {[60, 100, 140].map((y) => (
          <line key={y} x1={14} y1={y} x2={54} y2={y} stroke={sun.color} strokeOpacity="0.5" />
        ))}
        <text x={14} y={44} fill={sun.color} fillOpacity="0.8" fontSize="11">
          sunlight
        </text>
        {FRAMES.map((f, k) => {
          const cx = 130 + k * 150
          return (
            <g key={f.label}>
              <Globe3D cx={cx} cy={100} r={44} sun={sunDirection(f.earthLon)} axis={EARTH_AXIS} cam={sideCamera(f.earthLon)} color={color} />
              <text x={cx} y={172} textAnchor="middle" fill="var(--text-dim)" fontSize="12">
                {f.label}
              </text>
            </g>
          )
        })}
        <text x={350} y={22} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
          seen from the side, Sun always on the left · equator solid, polar circles dotted, axis amber
        </text>

        {/* today, larger */}
        <Globe3D cx={130} cy={258} r={56} sun={sunDirection(earthLon)} axis={EARTH_AXIS} cam={sideCamera(earthLon)} color={color} />
        <text x={130} y={326} textAnchor="middle" fill="var(--text)" fontSize="12" fontWeight="600">
          today
        </text>
        <g fontSize="12" fill="var(--text-dim)">
          <text x={215} y={222} fill="var(--text)" fontWeight="600" fontSize="13">
            The day–night line is always at right angles to the sunlight
          </text>
          <text x={215} y={244}>
            It never moves; the tilted Earth turns through it. Whichever pole leans toward the
          </text>
          <text x={215} y={262}>
            Sun stays on the lit side all day long (midnight Sun), the other stays in the dark.
          </text>
          <text x={215} y={280}>
            At the equinoxes the line runs pole to pole and every place gets 12 hours of light.
          </text>
          <text x={215} y={306} fill="var(--accent-amber)">
            Today the Sun stands {Math.abs(dec).toFixed(1)}° {dec >= 0 ? 'north' : 'south'} of the equator, so the{' '}
            {dec >= 0 ? 'Arctic' : 'Antarctic'} is tilted into the light.
          </text>
        </g>
      </svg>
      <div className="table-scroll">
        <table className="planet-table">
          <thead>
            <tr>
              <th>Latitude</th>
              <th>Daylight today</th>
              <th>Noon Sun height</th>
            </tr>
          </thead>
          <tbody>
            {LATITUDES.map((l) => {
              const hours = dayLengthHours(l.lat, dec)
              const noonAlt = 90 - Math.abs(l.lat - dec)
              return (
                <tr key={l.lat}>
                  <td>{l.name}</td>
                  <td>{hm(hours)}</td>
                  <td style={{ color: 'var(--text-dim)' }}>
                    {noonAlt <= 0 ? 'below the horizon' : `${noonAlt.toFixed(0)}° above the horizon${noonAlt >= 89.5 ? ' — overhead' : ''}`}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="caption">
        Half of Earth is always in sunlight. What the {OBLIQUITY_DEG.toFixed(1)}° tilt changes is
        which half: in June the day–night line falls short of the north pole, so everywhere inside
        the Arctic Circle stays lit through a full turn while the Antarctic never sees the Sun; in
        December it is the other way round. In between, the line crosses each parallel of latitude
        unevenly — a long day arc on the summer side, a short one on the winter side — which is why
        day length and the height of the noon Sun swing with the seasons, more so the farther you
        are from the equator. The table applies that to today&apos;s Sun.
      </p>
    </div>
  )
}
