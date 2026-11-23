import { useMemo, useState } from 'react'
import type { MissionLead, MissionProgram, MissionStatus } from '../../types'
import type { NewsState } from '../../hooks/useNews'
import { missions } from '../../data/missions'
import { programOf } from '../../lib/missions'
import { MissionFilters } from './MissionFilters'
import { MissionTimeline } from './MissionTimeline'
import { MissionDetail } from './MissionDetail'
import { BudgetWatch } from './BudgetWatch'
import { NewsSection } from '../news/NewsSection'

export function MissionsTab({ news }: { news: NewsState }) {
  const [program, setProgram] = useState<MissionProgram | 'all'>('all')
  const [status, setStatus] = useState<MissionStatus | 'all'>('all')
  const [lead, setLead] = useState<MissionLead | 'all'>('all')
  const [detailId, setDetailId] = useState<string | null>(null)

  const visible = useMemo(
    () =>
      missions.filter(
        (m) =>
          (program === 'all' || programOf(m) === program) &&
          (status === 'all' || m.status === status) &&
          (lead === 'all' || m.lead === lead),
      ),
    [program, status, lead],
  )
  const detail = detailId ? missions.find((m) => m.id === detailId) : null

  // Feeds generated before the 'missions' theme existed carry no such items;
  // fall back to solar-system news until the next weekly refresh.
  const newsTheme = news.items.some((item) => item.themes.includes('missions'))
    ? 'missions'
    : 'solar-system'

  return (
    <>
      <section className="section">
        <h2>Big missions — flying, in the works, proposed</h2>
        <p className="hint">
          {visible.length} of {missions.length} missions on one timeline: human exploration
          first, then the robotic science missions grouped by where they go. A solid bar is time in flight (fainter while still en route), a diamond is arrival,
          and dashed lines are plans. Tap a row for the story. Space telescopes have their own
          tab — only the flagships appear here.
        </p>
        <MissionFilters
          program={program}
          status={status}
          lead={lead}
          onProgram={setProgram}
          onStatus={setStatus}
          onLead={setLead}
        />
        {visible.length > 0 ? (
          <MissionTimeline missions={visible} onSelect={setDetailId} />
        ) : (
          <div className="panel empty-note">No missions match these filters.</div>
        )}
      </section>

      <BudgetWatch missions={missions} onSelect={setDetailId} />

      <NewsSection news={news} theme={newsTheme} />

      {detail && <MissionDetail mission={detail} onClose={() => setDetailId(null)} />}
    </>
  )
}
