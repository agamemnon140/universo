import type { Body } from '../../types'
import { BodyCard } from './BodyCard'

export function BodyGrid({
  bodies,
  selected,
  onToggle,
  onDetail,
}: {
  bodies: Body[]
  selected: string[]
  onToggle: (id: string) => void
  onDetail: (id: string) => void
}) {
  const maxRadius = Math.max(...bodies.map((b) => b.radiusEarth))

  return (
    <div className="body-grid">
      {bodies.map((body) => (
        <BodyCard
          key={body.id}
          body={body}
          maxRadius={maxRadius}
          selected={selected.includes(body.id)}
          onToggle={() => onToggle(body.id)}
          onDetail={() => onDetail(body.id)}
        />
      ))}
    </div>
  )
}
