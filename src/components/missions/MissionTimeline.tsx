import type { Mission } from '../../types'
import {
  AXIS_END,
  AXIS_START,
  MISSION_LANES,
  MISSION_STATUSES,
  MISSION_STATUS_COLORS,
  MISSION_STATUS_LABELS,
  axisFraction,
  decimalYearOf,
  launchYearLabel,
  missionTimeline,
  sortByLaunch,
} from '../../lib/missions'

const TICKS: number[] = []
for (let year = AXIS_START; year <= AXIS_END; year += 5) TICKS.push(year)

const pct = (year: number) => `${(axisFraction(year) * 100).toFixed(2)}%`

function MissionRow({
  mission,
  now,
  onSelect,
}: {
  mission: Mission
  now: number
  onSelect: (id: string) => void
}) {
  const shape = missionTimeline(mission, now)
  const status = MISSION_STATUS_LABELS[mission.status]
  return (
    <button
      className="mission-row"
      onClick={() => onSelect(mission.id)}
      title={`${mission.fullName ?? mission.name} — ${status} · launch ${mission.launchLabel}`}
    >
      <span className="mission-label">
        <span className="mission-name">
          {mission.flag ? `${mission.flag} ` : ''}
          {mission.name}
        </span>
        <span className="mission-year">{launchYearLabel(mission)}</span>
      </span>
      <span className="mission-track" style={{ color: MISSION_STATUS_COLORS[mission.status] }}>
        {shape.segments.map((seg) => (
          <span
            key={`${seg.kind}-${seg.from}`}
            className={`mission-seg ${seg.kind}`}
            style={{
              left: pct(seg.from),
              width: `${((axisFraction(seg.to) - axisFraction(seg.from)) * 100).toFixed(2)}%`,
            }}
          />
        ))}
        {shape.markers.map((marker) => (
          <span
            key={marker.kind}
            className={`mission-marker ${marker.kind}${marker.done ? ' done' : ''}`}
            style={{ left: pct(marker.at) }}
          />
        ))}
        {shape.clippedStart && <span className="mission-clip start">‹</span>}
        {shape.clippedEnd && <span className="mission-clip end">›</span>}
        {!mission.launch && (
          <span className="mission-nodate">no date set</span>
        )}
      </span>
    </button>
  )
}

export function MissionTimeline({
  missions,
  onSelect,
}: {
  missions: Mission[]
  onSelect: (id: string) => void
}) {
  const now = decimalYearOf(new Date())

  return (
    <div className="panel mission-timeline">
      <div className="mission-axis" aria-hidden="true">
        <span />
        <span className="mission-axis-track">
          {TICKS.filter((year) => year % 10 === 0).map((year) => (
            <span
              key={year}
              className={year % 20 === 0 ? undefined : 'minor'}
              style={{ left: pct(year) }}
            >
              {year}
            </span>
          ))}
        </span>
      </div>

      {MISSION_LANES.map((lane) => {
        const rows = sortByLaunch(missions.filter((m) => m.lane === lane.id))
        if (rows.length === 0) return null
        return (
          <div key={lane.id} className="mission-lane">
            <h3>{lane.label}</h3>
            <div className="mission-rows">
              <div className="mission-grid" aria-hidden="true">
                {TICKS.map((year) => (
                  <span key={year} style={{ left: pct(year) }} />
                ))}
                <span className="mission-now" style={{ left: pct(now) }} />
              </div>
              {rows.map((mission) => (
                <MissionRow key={mission.id} mission={mission} now={now} onSelect={onSelect} />
              ))}
            </div>
          </div>
        )
      })}

      <div className="legend">
        {MISSION_STATUSES.map((status) => (
          <span key={status}>
            <span className="dot" style={{ background: MISSION_STATUS_COLORS[status] }} />
            {MISSION_STATUS_LABELS[status]}
          </span>
        ))}
        <span>
          <span className="mission-key cruise" />
          en route
        </span>
        <span>
          <span className="mission-key planned" />
          planned
        </span>
        <span>
          <span className="mission-key arrival" />
          arrival
        </span>
        <span>
          <span className="mission-key launch" />
          target launch
        </span>
        <span>
          <span className="mission-key now" />
          today
        </span>
        <span>‹ › beyond the axis</span>
      </div>
    </div>
  )
}
