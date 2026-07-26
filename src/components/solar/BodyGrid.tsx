import type { Body } from '../../types'
import { bodyById } from '../../data'
import { sortBodies, sortCaption, type BodySort } from '../../lib/sortBodies'
import { BodyCard } from './BodyCard'

const MOON_GROUP_ORDER = ['earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']

export function BodyGrid({
  bodies,
  selected,
  sort,
  onToggle,
  onDetail,
}: {
  bodies: Body[]
  selected: string[]
  sort: BodySort
  onToggle: (id: string) => void
  onDetail: (id: string) => void
}) {
  const maxRadius = Math.max(...bodies.map((b) => b.radiusEarth))
  const suns = sortBodies(
    bodies.filter((b) => b.type !== 'moon'),
    sort,
  )
  const groups = MOON_GROUP_ORDER.map((parentId) => ({
    parent: bodyById.get(parentId)!,
    moons: sortBodies(
      bodies.filter((b) => b.parent === parentId && b.type === 'moon'),
      sort,
    ),
  })).filter((g) => g.moons.length > 0)

  const renderCards = (list: Body[]) => (
    <div className="body-grid">
      {list.map((body) => (
        <BodyCard
          key={body.id}
          body={body}
          maxRadius={maxRadius}
          caption={sortCaption(body, sort)}
          selected={selected.includes(body.id)}
          onToggle={() => onToggle(body.id)}
          onDetail={() => onDetail(body.id)}
        />
      ))}
    </div>
  )

  return (
    <>
      <h2 className="grid-group-title">
        Sun, planets &amp; dwarf planets
        {sort === 'distance' && <span className="grid-group-count">outward from the Sun</span>}
      </h2>
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
              {sort === 'distance'
                ? `outward from ${parent.name} · ${moons.length} of ${parent.moonCount} known`
                : `${moons.length} of ${parent.moonCount} known`}
            </span>
          </h2>
          {renderCards(moons)}
        </div>
      ))}
    </>
  )
}
