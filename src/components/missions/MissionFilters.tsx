import type { MissionLead, MissionProgram, MissionStatus } from '../../types'
import {
  MISSION_LEADS,
  MISSION_PROGRAM_LABELS,
  MISSION_STATUSES,
  MISSION_STATUS_COLORS,
  MISSION_STATUS_LABELS,
} from '../../lib/missions'

export function MissionFilters({
  program,
  status,
  lead,
  onProgram,
  onStatus,
  onLead,
}: {
  program: MissionProgram | 'all'
  status: MissionStatus | 'all'
  lead: MissionLead | 'all'
  onProgram: (p: MissionProgram | 'all') => void
  onStatus: (s: MissionStatus | 'all') => void
  onLead: (l: MissionLead | 'all') => void
}) {
  return (
    <>
      <div className="filter-row">
        {(['all', 'science', 'exploration'] as const).map((p) => (
          <button
            key={p}
            className={`chip${program === p ? ' on' : ''}`}
            style={program === p ? { background: 'var(--accent-amber)' } : undefined}
            onClick={() => onProgram(p)}
          >
            {p === 'all' ? 'Science + exploration' : MISSION_PROGRAM_LABELS[p]}
          </button>
        ))}
      </div>
      <div className="filter-row">
        {(['all', ...MISSION_STATUSES] as const).map((s) => (
          <button
            key={s}
            className={`chip${status === s ? ' on' : ''}`}
            style={
              status === s
                ? { background: s === 'all' ? 'var(--text)' : MISSION_STATUS_COLORS[s] }
                : undefined
            }
            onClick={() => onStatus(s)}
          >
            {s === 'all' ? 'All statuses' : MISSION_STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      <div className="filter-row">
        <button
          className={`chip${lead === 'all' ? ' on' : ''}`}
          style={lead === 'all' ? { background: 'var(--accent-cyan)' } : undefined}
          onClick={() => onLead('all')}
        >
          All agencies
        </button>
        {MISSION_LEADS.map((l) => (
          <button
            key={l.id}
            className={`chip${lead === l.id ? ' on' : ''}`}
            style={lead === l.id ? { background: 'var(--accent-cyan)' } : undefined}
            onClick={() => onLead(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>
    </>
  )
}
