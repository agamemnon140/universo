import { useMemo, useState } from 'react'
import type { Telescope, TelescopeStatus } from '../../types'
import type { NewsState } from '../../hooks/useNews'
import { telescopes } from '../../data'
import { SpectrumChart } from './SpectrumChart'
import { TelescopeFilters, type DomainFilter } from './TelescopeFilters'
import { TelescopeDetail } from './TelescopeDetail'
import { TelescopeSearch } from './TelescopeSearch'
import { TelescopeCompare } from './TelescopeCompare'
import { NewsSection } from '../news/NewsSection'

export function TelescopesTab({ news }: { news: NewsState }) {
  const [statusFilter, setStatusFilter] = useState<TelescopeStatus | 'all'>('all')
  const [domainFilter, setDomainFilter] = useState<DomainFilter>('all')
  const [detail, setDetail] = useState<Telescope | null>(null)

  const filtered = useMemo(
    () =>
      telescopes.filter(
        (t) =>
          (statusFilter === 'all' || t.status === statusFilter) &&
          (domainFilter === 'all' || t.domain === domainFilter),
      ),
    [statusFilter, domainFilter],
  )

  return (
    <>
      <p className="hint">
        {telescopes.length} observatories across the electromagnetic spectrum — plus
        gravitational-wave and neutrino detectors. Tap a bar for the full story.
      </p>
      <TelescopeSearch onPick={setDetail} />
      <TelescopeFilters
        status={statusFilter}
        domain={domainFilter}
        onStatus={setStatusFilter}
        onDomain={setDomainFilter}
      />
      <SpectrumChart telescopes={filtered} onSelect={setDetail} />
      <TelescopeCompare />
      {detail && <TelescopeDetail telescope={detail} onClose={() => setDetail(null)} />}
      <NewsSection news={news} theme="telescopes" />
    </>
  )
}
