import type { Mission } from '../../types'
import { DetailSheet } from '../shell/DetailSheet'
import { FY2027, MISSION_LANES, MISSION_STATUS_LABELS } from '../../lib/missions'
import { formatDate } from '../../lib/format'

export function MissionDetail({ mission, onClose }: { mission: Mission; onClose: () => void }) {
  const m = mission
  const lane = MISSION_LANES.find((l) => l.id === m.lane)
  const isTarget = m.status === 'development' || m.status === 'proposed'
  return (
    <DetailSheet
      title={`${m.flag ? `${m.flag} ` : ''}${m.name}`}
      subtitle={m.fullName}
      onClose={onClose}
    >
      <div className="chips">
        <span className="chip">
          {MISSION_STATUS_LABELS[m.status]}
          {m.statusNote ? ` · ${m.statusNote}` : ''}
        </span>
        <span className="chip">{m.kind}</span>
        {lane && <span className="chip">{lane.label}</span>}
      </div>

      <p style={{ margin: '10px 0 4px' }}>{m.summary}</p>

      <dl className="kv">
        <dt>Agency</dt>
        <dd>{m.agency}</dd>
        <dt>Destination</dt>
        <dd>{m.target}</dd>
        <dt>{isTarget ? 'Launch target' : 'Launched'}</dt>
        <dd>{m.launchLabel}</dd>
        {m.arrivalLabel && (
          <>
            <dt>Arrival</dt>
            <dd>{m.arrivalLabel}</dd>
          </>
        )}
        {m.endLabel && (
          <>
            <dt>Ended</dt>
            <dd>{m.endLabel}</dd>
          </>
        )}
      </dl>

      {m.milestones.length > 0 && (
        <>
          <h3 style={{ fontSize: '0.95rem', margin: '14px 0 4px' }}>Milestones</h3>
          <ul className="fact-list">
            {m.milestones.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {m.budget && (
        <>
          <h3 style={{ fontSize: '0.95rem', margin: '14px 0 4px' }}>
            NASA budget, fiscal 2027 (US$ million)
          </h3>
          <dl className="kv">
            {m.budget.fy26 && (
              <>
                <dt>2026 enacted</dt>
                <dd>{m.budget.fy26}</dd>
              </>
            )}
            <dt>White House request</dt>
            <dd>{m.budget.request}</dd>
            <dt>House bill</dt>
            <dd>{m.budget.house}</dd>
            <dt>Senate bill</dt>
            <dd>{m.budget.senate}</dd>
          </dl>
          {m.budgetNote && <p className="hint">{m.budgetNote}</p>}
          <p className="hint">No final budget yet — figures as of {formatDate(FY2027.asOf)}.</p>
        </>
      )}

      {m.url && (
        <p style={{ marginTop: 14 }}>
          <a href={m.url} target="_blank" rel="noopener noreferrer">
            Official site →
          </a>
        </p>
      )}
    </DetailSheet>
  )
}
