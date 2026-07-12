import type { Body } from '../../types'
import { compareHeadline } from '../../lib/derive'
import { RatioTable } from './RatioTable'

const MAX_R = 130 // px radius of the larger circle
const MIN_R = 2 // floor so tiny bodies stay visible
const SCALE_LIMIT = 45 // beyond this ratio the drawing stops being to scale

export function ComparePanel({ a, b }: { a: Body; b: Body }) {
  const ratio = a.radiusEarth / b.radiusEarth
  const larger = ratio >= 1 ? a : b
  const smaller = ratio >= 1 ? b : a
  const sizeRatio = larger.radiusEarth / smaller.radiusEarth

  const rLarge = MAX_R
  const rSmallTrue = MAX_R / sizeRatio
  const rSmall = Math.max(MIN_R, rSmallTrue)
  const notToScale = sizeRatio > SCALE_LIMIT && rSmallTrue < MIN_R

  const width = 640
  const height = MAX_R * 2 + 70
  const cy = MAX_R + 20
  const cxLarge = width * 0.32
  const cxSmall = width * 0.78

  const circle = (body: Body, cx: number, r: number) => (
    <>
      <defs>
        <radialGradient id={`grad-${body.id}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={body.gradient?.[0] ?? body.color} />
          <stop offset="100%" stopColor={body.gradient?.[1] ?? body.color} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#grad-${body.id})`} />
      <text
        x={cx}
        y={cy + Math.max(r, 14) + 24}
        textAnchor="middle"
        fill="var(--text)"
        fontSize="15"
        fontWeight="600"
      >
        {body.name}
      </text>
    </>
  )

  return (
    <div className="panel compare-panel section">
      <h2 style={{ margin: '0 0 4px', fontSize: '1.05rem' }}>
        {a.name} vs {b.name}
      </h2>
      {compareHeadline(a, b) && (
        <p className="hint" style={{ color: 'var(--accent-amber)' }}>
          {compareHeadline(a, b)}
        </p>
      )}
      <svg className="compare-circles" viewBox={`0 0 ${width} ${height}`}>
        {circle(larger, cxLarge, rLarge)}
        {circle(smaller, cxSmall, rSmall)}
      </svg>
      {notToScale && (
        <p className="not-to-scale">
          Size difference too extreme to draw to scale — {smaller.name} is shown enlarged (true
          diameter ratio: {sizeRatio.toFixed(0)}×).
        </p>
      )}
      <RatioTable a={a} b={b} />
    </div>
  )
}
