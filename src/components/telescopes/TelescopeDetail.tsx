import type { Telescope } from '../../types'
import { DetailSheet } from '../shell/DetailSheet'
import { STATUS_LABELS } from '../../lib/spectrum'

export function TelescopeDetail({
  telescope,
  onClose,
}: {
  telescope: Telescope
  onClose: () => void
}) {
  const t = telescope
  return (
    <DetailSheet title={t.name} subtitle={t.fullName} onClose={onClose}>
      <div className="chips">
        <span className="chip">{STATUS_LABELS[t.status]}</span>
        <span className="chip">{t.domain === 'space' ? 'Space' : 'Ground'}</span>
        {t.bands.map((band) => (
          <span key={band} className="chip">
            {band}
          </span>
        ))}
      </div>
      <dl className="kv">
        <dt>Agency</dt>
        <dd>{t.agency}</dd>
        <dt>Aperture</dt>
        <dd>{t.aperture}</dd>
        {t.fieldOfView && (
          <>
            <dt>Field of view</dt>
            <dd>{t.fieldOfView}</dd>
          </>
        )}
        {t.limitingMagnitude && (
          <>
            <dt>Limiting magnitude</dt>
            <dd>{t.limitingMagnitude}</dd>
          </>
        )}
        {t.signalLabel && (
          <>
            <dt>Signal band</dt>
            <dd>{t.signalLabel}</dd>
          </>
        )}
        <dt>Location</dt>
        <dd>{t.location}</dd>
        {t.launched && (
          <>
            <dt>{t.domain === 'space' ? 'Launched' : 'First light'}</dt>
            <dd>{t.launched}</dd>
          </>
        )}
        {t.retired && (
          <>
            <dt>Retired</dt>
            <dd>{t.retired}</dd>
          </>
        )}
        {t.plannedDate && (
          <>
            <dt>Expected</dt>
            <dd>{t.plannedDate}</dd>
          </>
        )}
      </dl>

      <h3 style={{ fontSize: '0.95rem', margin: '14px 0 4px' }}>Objectives</h3>
      <ul className="fact-list">
        {t.objectives.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ul>

      <h3 style={{ fontSize: '0.95rem', margin: '14px 0 4px' }}>Instruments</h3>
      <ul className="fact-list">
        {t.instruments.map((ins) => (
          <li key={ins}>{ins}</li>
        ))}
      </ul>

      {t.url && (
        <p style={{ marginTop: 14 }}>
          <a href={t.url} target="_blank" rel="noopener noreferrer">
            Official site →
          </a>
        </p>
      )}
    </DetailSheet>
  )
}
