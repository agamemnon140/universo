import { useMemo, useState } from 'react'
import { bodyById } from '../../data'
import { PLANET_IDS } from '../../data/orbits'
import {
  moonPosition,
  planetGeocentric,
  planetHeliocentric,
  planetOrbitPath,
  planetOrbitShape,
  visibilityHint,
  wrap360,
  type EclipticVector,
} from '../../lib/ephemeris'
import { formatNumber } from '../../lib/format'
import { SIGNS, signOf, signPosition } from '../../lib/zodiac'

const SIZE = 700
const CENTER = SIZE / 2
const MAX_R = SIZE / 2 - 44
const MIN_R = 30
const DEG = Math.PI / 180

type Centre = 'sun' | 'earth'
type Scale = 'log' | 'inner' | 'outer'

const INNER_IDS = ['mercury', 'venus', 'earth', 'mars']
const OUTER_IDS = ['jupiter', 'saturn', 'uranus', 'neptune']

/** Ring radii (AU) drawn behind the geocentric map so distances from Earth can be read. */
const GEO_RINGS: Record<Scale, number[]> = {
  log: [0.5, 1, 2, 5, 10, 20, 40],
  inner: [0.5, 1, 1.5, 2, 2.5],
  outer: [5, 10, 20, 30],
}

/** Outer edge of each linear scale, AU (Mars at conjunction is 2.7 AU from Earth). */
function linearMax(scale: Scale, centre: Centre): number {
  if (scale === 'inner') return centre === 'sun' ? 1.75 : 2.75
  return centre === 'sun' ? 31 : 32
}

function makeScale(scale: Scale, centre: Centre): (au: number) => number {
  if (scale === 'log') {
    const minLog = Math.log10(0.2)
    const maxLog = Math.log10(45)
    return (au) => {
      const f = (Math.log10(Math.max(au, 0.2)) - minLog) / (maxLog - minLog)
      return MIN_R + Math.min(1, f) * (MAX_R - MIN_R)
    }
  }
  const max = linearMax(scale, centre)
  return (au) => (Math.min(au, max) / max) * MAX_R
}

/** Ecliptic longitude → screen point: ♈ to the right, counter-clockwise as seen from north. */
function toScreen(lonDeg: number, r: number): { x: number; y: number } {
  return { x: CENTER + r * Math.cos(lonDeg * DEG), y: CENTER - r * Math.sin(lonDeg * DEG) }
}

function vectorToScreen(v: EclipticVector, radius: (au: number) => number) {
  const au = Math.hypot(v.x, v.y)
  const lon = wrap360(Math.atan2(v.y, v.x) / DEG)
  return toScreen(lon, radius(au))
}

function dotRadius(id: string): number {
  const body = bodyById.get(id)
  const re = body?.radiusEarth ?? 1
  return Math.max(4, Math.min(11, Math.sqrt(re) * 3))
}

/** ?centre=earth&scale=inner preselect the map mode, so a view can be shared. */
function fromUrl<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  const v = new URLSearchParams(window.location.search).get(key)
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback
}

export function PlanetMap({ jd, onSelect }: { jd: number; onSelect: (id: string) => void }) {
  const [centre, setCentre] = useState<Centre>(() => fromUrl<Centre>('centre', ['sun', 'earth'], 'sun'))
  const [scale, setScale] = useState<Scale>(() => fromUrl<Scale>('scale', ['log', 'inner', 'outer'], 'log'))
  const radius = useMemo(() => makeScale(scale, centre), [scale, centre])

  const rows = useMemo(
    () =>
      PLANET_IDS.map((id) => ({
        id,
        body: bodyById.get(id)!,
        helio: planetHeliocentric(id, jd),
        geo: planetGeocentric(id, jd),
        shape: planetOrbitShape(id, jd),
      })),
    [jd],
  )
  const sunGeo = useMemo(() => planetGeocentric('sun', jd), [jd])
  const moon = useMemo(() => moonPosition(jd), [jd])
  const orbits = useMemo(
    () => (centre === 'sun' ? PLANET_IDS.map((id) => ({ id, path: planetOrbitPath(id, jd) })) : []),
    [centre, jd],
  )

  // which planets get a full dot + label at this scale
  const labelled = new Set(
    scale === 'log' ? PLANET_IDS : scale === 'inner' ? INNER_IDS : OUTER_IDS,
  )
  const sun = bodyById.get('sun')!
  const earth = bodyById.get('earth')!
  const sunScreen = toScreen(sunGeo.lonDeg, radius(sunGeo.distAU))

  return (
    <>
      <div className="sky-controls">
        <div className="zoom-control" role="group" aria-label="Map centre">
          <button className={centre === 'sun' ? 'active' : ''} onClick={() => setCentre('sun')}>
            ☀ Sun centre
          </button>
          <button className={centre === 'earth' ? 'active' : ''} onClick={() => setCentre('earth')}>
            🌍 Earth centre
          </button>
        </div>
        <div className="zoom-control" role="group" aria-label="Scale">
          <button className={scale === 'log' ? 'active' : ''} onClick={() => setScale('log')}>
            Log
          </button>
          <button className={scale === 'inner' ? 'active' : ''} onClick={() => setScale('inner')}>
            Inner
          </button>
          <button className={scale === 'outer' ? 'active' : ''} onClick={() => setScale('outer')}>
            Outer
          </button>
        </div>
      </div>

      <div className="sky-map panel" style={{ padding: 8 }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE + 22}`}>
          {/* reference directions */}
          {centre === 'sun' && [0, 90, 180, 270].map((deg) => {
            const p = toScreen(deg, MAX_R + 8)
            const q = toScreen(deg, MAX_R + 30)
            return (
              <g key={deg}>
                <line x1={p.x} y1={p.y} x2={toScreen(deg, MAX_R + 16).x} y2={toScreen(deg, MAX_R + 16).y} stroke="var(--line-strong)" />
                <text x={q.x} y={q.y + 4} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
                  {deg === 0 ? '♈ 0°' : `${deg}°`}
                </text>
              </g>
            )
          })}
          <circle cx={CENTER} cy={CENTER} r={MAX_R + 8} fill="none" stroke="var(--line)" />
          {centre === 'earth' && (
            <g>
              {/* the tropical zodiac: twelve 30° slices from the March equinox */}
              <circle cx={CENTER} cy={CENTER} r={MAX_R + 36} fill="none" stroke="var(--line)" />
              {SIGNS.map((s) => {
                const a = toScreen(s.startDeg, MAX_R + 8)
                const b = toScreen(s.startDeg, MAX_R + 36)
                const mid = toScreen(s.startDeg + 15, MAX_R + 22)
                return (
                  <g key={s.name}>
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--line)" />
                    <text x={mid.x} y={mid.y + 5} textAnchor="middle" fill="var(--text-dim)" fontSize="14">
                      <title>{s.name}</title>
                      {s.symbol}
                    </text>
                  </g>
                )
              })}
            </g>
          )}

          {centre === 'earth' && (
            <>
              {/* night side: the half of the sky facing away from the Sun */}
              <path
                d={`M ${CENTER} ${CENTER} m ${-(MAX_R + 8)} 0 a ${MAX_R + 8} ${MAX_R + 8} 0 0 0 ${2 * (MAX_R + 8)} 0 z`}
                transform={`rotate(${90 - sunGeo.lonDeg} ${CENTER} ${CENTER})`}
                fill="rgba(77, 216, 255, 0.05)"
              />
              {(() => {
                const q = toScreen(sunGeo.lonDeg + 180, MAX_R - 14)
                return (
                  <text x={q.x} y={q.y + 4} textAnchor="middle" fill="var(--accent-cyan)" fillOpacity="0.55" fontSize="11">
                    midnight sky
                  </text>
                )
              })()}
              {GEO_RINGS[scale].map((au) => (
                <g key={au}>
                  <circle cx={CENTER} cy={CENTER} r={radius(au)} fill="none" stroke="var(--line)" strokeDasharray="3 5" />
                  <text x={CENTER + 4} y={CENTER - radius(au) - 3} fill="var(--text-faint)" fontSize="10">
                    {au} AU
                  </text>
                </g>
              ))}
              {/* Earth → Sun line */}
              <line x1={CENTER} y1={CENTER} x2={sunScreen.x} y2={sunScreen.y} stroke={sun.color} strokeOpacity="0.5" strokeDasharray="4 4" />
            </>
          )}

          {/* heliocentric orbits, sampled from the same elements as the positions */}
          {orbits.map(({ id, path }) => {
            if (!labelled.has(id) && scale !== 'log') return null
            const pts = path.map((v) => vectorToScreen(v, radius))
            const d = pts.map((p, k) => `${k === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z'
            const shape = rows.find((r) => r.id === id)!.shape
            const peri = toScreen(shape.periLonDeg, radius(shape.periAU))
            const apo = toScreen(shape.periLonDeg + 180, radius(shape.apoAU))
            return (
              <g key={id}>
                <path d={d} fill="none" stroke="var(--line-strong)" strokeWidth="1" />
                {/* nearest and farthest points of the orbit */}
                <circle cx={peri.x} cy={peri.y} r={2.2} fill="var(--accent-amber)" opacity="0.8" />
                <circle cx={apo.x} cy={apo.y} r={2.2} fill="var(--accent-cyan)" opacity="0.8" />
              </g>
            )
          })}

          {/* central body */}
          {centre === 'sun' ? (
            <circle
              cx={CENTER}
              cy={CENTER}
              r={14}
              fill={sun.color}
              style={{ cursor: 'pointer', filter: `drop-shadow(0 0 8px ${sun.color})` }}
              onClick={() => onSelect('sun')}
            />
          ) : (
            <g>
              {/* Moon on an illustrative ring, at its true direction */}
              <circle cx={CENTER} cy={CENTER} r={22} fill="none" stroke="var(--line-strong)" strokeDasharray="2 3" />
              {(() => {
                const m = toScreen(moon.lonDeg, 22)
                return (
                  <g className="map-star" onClick={() => onSelect('moon')}>
                    <circle cx={m.x} cy={m.y} r={3.5} fill={bodyById.get('moon')!.color} />
                    <circle cx={m.x} cy={m.y} r={10} fill="transparent" />
                  </g>
                )
              })()}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={9}
                fill={earth.color}
                style={{ cursor: 'pointer', filter: `drop-shadow(0 0 6px ${earth.color})` }}
                onClick={() => onSelect('earth')}
              />
              {/* Sun at its real direction and distance */}
              <g className="map-star" onClick={() => onSelect('sun')}>
                <circle cx={sunScreen.x} cy={sunScreen.y} r={11} fill={sun.color} style={{ filter: `drop-shadow(0 0 8px ${sun.color})` }} />
                <text x={sunScreen.x} y={sunScreen.y - 17} textAnchor="middle" fill="var(--text-dim)" fontSize="13">
                  Sun
                </text>
              </g>
            </g>
          )}

          {/* planets */}
          {rows.map(({ id, body, helio, geo }) => {
            if (centre === 'earth' && id === 'earth') return null
            const full = labelled.has(id)
            // linear scales: bodies beyond the frame are dropped rather than pinned to the rim
            if (!full && (scale === 'inner' || centre === 'earth')) return null
            const p =
              centre === 'sun'
                ? toScreen(helio.lonDeg, radius(helio.rAU))
                : toScreen(geo.lonDeg, radius(geo.distAU))
            const r = full ? dotRadius(id) : 2.5
            const label =
              centre === 'sun'
                ? `${body.name} · ${Math.round(helio.lonDeg)}°`
                : `${body.name} · ${Math.round(geo.elongationDeg)}° ${geo.side === 'east' ? 'E' : 'W'}`
            return (
              <g key={id} className="map-star" onClick={() => onSelect(id)}>
                <circle cx={p.x} cy={p.y} r={r} fill={body.color} />
                <circle cx={p.x} cy={p.y} r={Math.max(r + 9, 12)} fill="transparent" />
                {full && (
                  <text x={p.x} y={p.y - r - 6} textAnchor="middle" fill="var(--text-dim)" fontSize="13">
                    {label}
                  </text>
                )}
              </g>
            )
          })}
          {scale === 'outer' && (
            <text x={CENTER} y={CENTER + 34} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
              {centre === 'sun' ? 'inner planets' : 'Sun & inner planets'}
            </text>
          )}

          <text x={CENTER} y={SIZE + 14} textAnchor="middle" fill="var(--text-faint)" fontSize="11">
            {centre === 'sun'
              ? `heliocentric longitude · ${scale === 'log' ? 'log distance scale' : 'true distance scale'} · amber dot = perihelion, cyan dot = aphelion of each orbit`
              : `geocentric view · elongation from the Sun (E = evening sky, W = morning sky) · outer band: tropical zodiac signs`}
          </text>
        </svg>
      </div>

      <div className="table-scroll">
      <table className="planet-table">
        <thead>
          <tr>
            <th>Planet</th>
            <th>Helio. lon.</th>
            <th>From Sun</th>
            <th>From Earth</th>
            <th>Elongation</th>
            {centre === 'earth' && <th>Sign</th>}
            <th>Orbit shape</th>
            <th>In our sky</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ id, body, helio, geo, shape }) => (
            <tr key={id} style={{ cursor: 'pointer' }} onClick={() => onSelect(id)}>
              <td>
                <span className="dot" style={{ background: body.color, display: 'inline-block', width: 9, height: 9, borderRadius: '50%', marginRight: 6 }} />
                {body.name}
              </td>
              <td>{helio.lonDeg.toFixed(1)}°</td>
              <td>{formatNumber(helio.rAU)} AU</td>
              <td>{id === 'earth' ? '—' : `${formatNumber(geo.distAU)} AU`}</td>
              <td>
                {id === 'earth' ? '—' : `${geo.elongationDeg.toFixed(1)}° ${geo.side === 'east' ? 'E' : 'W'}`}
              </td>
              {centre === 'earth' && (
                <td style={{ whiteSpace: 'nowrap' }}>
                  {id === 'earth' ? '—' : `${signOf(geo.lonDeg).symbol} ${signPosition(geo.lonDeg)}`}
                </td>
              )}
              <td style={{ whiteSpace: 'nowrap' }}>
                <span className="ecc-bar" title={`eccentricity ${shape.e.toFixed(3)}`}>
                  <span style={{ width: `${Math.min(100, shape.e * 400)}%` }} />
                </span>
                e = {shape.e.toFixed(3)} · {formatNumber(shape.periAU)}–{formatNumber(shape.apoAU)} AU
              </td>
              <td style={{ color: 'var(--text-dim)' }}>{id === 'earth' ? 'home' : visibilityHint(id, geo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {centre === 'earth' && (
        <p className="hint">
          Tropical signs: the Sun is in {signOf(sunGeo.lonDeg).symbol} {signPosition(sunGeo.lonDeg)} and the Moon in{' '}
          {signOf(moon.lonDeg).symbol} {signPosition(moon.lonDeg)}. These are the astrological signs, twelve equal 30° slices
          counted from the March equinox; the constellations of the same names have slipped about one sign east since
          the scheme was fixed 2,000 years ago (precession), so a planet &ldquo;in Aries&rdquo; is actually seen against Pisces.
        </p>
      )}
      <p className="not-to-scale">
        Planet positions from JPL Keplerian elements (about 1° accuracy, 1800–2050); the Moon&apos;s
        ring is illustrative, its direction is real. Orbit shape: e is the eccentricity (0 = circle), then the
        closest and farthest distance from the Sun; in the Inner and Outer scales the orbits are drawn true to shape.
      </p>
    </>
  )
}
