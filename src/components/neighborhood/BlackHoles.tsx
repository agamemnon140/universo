import type { BlackHole } from '../../types'
import { blackHoles } from '../../data'
import { DetailSheet } from '../shell/DetailSheet'
import { formatNumber } from '../../lib/format'

const TYPE_LABELS: Record<BlackHole['type'], string> = {
  dormant: 'Dormant (no X-rays)',
  'x-ray-binary': 'X-ray binary',
  supermassive: 'Supermassive',
}

export function BlackHolesSection({
  detail,
  onSelect,
}: {
  detail: BlackHole | null
  onSelect: (bh: BlackHole | null) => void
}) {
  return (
    <section className="section">
      <h2>Nearest known black holes</h2>
      <p className="hint">
        Also drawn on the map at the 30,000 ly zoom (violet ring markers). Distances from the
        Sun — the nearest, Gaia BH1, is almost 100× farther than our farthest star on the map's
        20 ly view.
      </p>
      <div className="bh-grid">
        {blackHoles.map((bh) => (
          <button key={bh.id} className="bh-card" onClick={() => onSelect(bh)}>
            <span className="bh-icon" aria-hidden="true">
              <span className="bh-ring" />
            </span>
            <span className="bh-name">{bh.name}</span>
            <span className="bh-meta">
              {formatNumber(bh.distanceLy)} ly · {formatNumber(bh.massSun)} M☉
            </span>
            <span className="bh-type">{TYPE_LABELS[bh.type]}</span>
          </button>
        ))}
      </div>

      {detail && (
        <DetailSheet
          title={detail.name}
          subtitle={`black hole · ${formatNumber(detail.distanceLy)} light-years away`}
          onClose={() => onSelect(null)}
        >
          <dl className="kv">
            <dt>Mass</dt>
            <dd>{formatNumber(detail.massSun)} solar masses</dd>
            <dt>Type</dt>
            <dd>{TYPE_LABELS[detail.type]}</dd>
            <dt>Companion</dt>
            <dd>{detail.companion}</dd>
            <dt>Discovered</dt>
            <dd>{detail.discoveryYear}</dd>
          </dl>
          <p className="hint">{detail.note}</p>
        </DetailSheet>
      )}
    </section>
  )
}
