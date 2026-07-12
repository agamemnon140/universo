import type { Body } from '../../types'
import { bodyById } from '../../data'
import { BodyCard } from './BodyCard'

const MOON_GROUP_ORDER = ['earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']

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
  const suns = bodies.filter((b) => b.type !== 'moon')
  const groups = MOON_GROUP_ORDER.map((parentId) => ({
    parent: bodyById.get(parentId)!,
    moons: bodies
      .filter((b) => b.parent === parentId && b.type === 'moon')
      .sort((a, b) => b.radiusEarth - a.radiusEarth),
  })).filter((g) => g.moons.length > 0)

  const renderCards = (list: Body[]) => (
    <div className="body-grid">
      {list.map((body) => (
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

  return (
    <>
      <h2 className="grid-group-title">Sun, planets &amp; dwarf planets</h2>
      {renderCards(suns)}
      {groups.map(({ parent, moons }) => (
        <div key={parent.id}>
          <h2 className="grid-group-title">
            <span
              className="dot"
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                marginRight: 7,
                background: parent.color,
              }}
            />
            Moons of {parent.name}
            <span className="grid-group-count">
              {moons.length} of {parent.moonCount} known
            </span>
          </h2>
          {renderCards(moons)}
        </div>
      ))}
    </>
  )
}
