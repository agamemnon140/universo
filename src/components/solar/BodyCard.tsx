import type { Body } from '../../types'

const CIRCLE_AREA = 64 // px box for the body circle

export function BodyCard({
  body,
  maxRadius,
  selected,
  onToggle,
  onDetail,
}: {
  body: Body
  maxRadius: number
  selected: boolean
  onToggle: () => void
  onDetail: () => void
}) {
  // sqrt scale keeps small moons visible next to the Sun
  const d = Math.max(5, Math.sqrt(body.radiusEarth / maxRadius) * CIRCLE_AREA)
  const fill = body.gradient
    ? `radial-gradient(circle at 35% 30%, ${body.gradient[0]}, ${body.gradient[1]})`
    : `radial-gradient(circle at 35% 30%, ${body.color}, ${body.color})`

  return (
    <button className={`body-card${selected ? ' selected' : ''}`} onClick={onToggle}>
      <span
        style={{
          width: CIRCLE_AREA,
          height: CIRCLE_AREA,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            width: d,
            height: d,
            borderRadius: '50%',
            background: fill,
            boxShadow: body.type === 'star' ? `0 0 18px 4px ${body.color}66` : 'none',
          }}
        />
      </span>
      <span className="body-name">{body.name}</span>
      <span className="body-type">{body.type.replace('-', ' ')}</span>
      <span
        role="button"
        tabIndex={0}
        className="body-type"
        style={{ color: 'var(--accent-cyan)' }}
        onClick={(e) => {
          e.stopPropagation()
          onDetail()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.stopPropagation()
            onDetail()
          }
        }}
      >
        ⓘ details
      </span>
    </button>
  )
}
