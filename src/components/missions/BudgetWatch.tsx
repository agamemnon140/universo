import type { Mission, MissionStatus } from '../../types'
import { FY2027 } from '../../lib/missions'
import { formatDate } from '../../lib/format'

const STATUS_ORDER: MissionStatus[] = ['proposed', 'development', 'operating', 'ended']

/** The three competing fiscal-2027 proposals, mission by mission. */
export function BudgetWatch({
  missions,
  onSelect,
}: {
  missions: Mission[]
  onSelect: (id: string) => void
}) {
  // The undecided missions first: proposed, then in development, then flying.
  const rows = missions
    .filter((m) => m.budget)
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
  return (
    <section className="section">
      <h2>NASA budget watch — fiscal 2027</h2>
      <p className="hint">
        US$ million. Three proposals and no final budget yet: the White House request, the House
        committee bill (May 2026) and the Senate subcommittee bill (12 Nov 2026). ≥ is a floor
        written into the bill; “backed” means supported without a figure; “cut” means reported
        as a cancellation target; — means no figure was published. As of{' '}
        {formatDate(FY2027.asOf)}.
      </p>
      <div className="panel table-scroll">
        <table className="planet-table budget-table">
          <thead>
            <tr>
              <th>Mission</th>
              <th>2026</th>
              <th>Request</th>
              <th>House</th>
              <th>Senate</th>
            </tr>
          </thead>
          <tbody>
            <tr className="budget-total">
              <td>All NASA science</td>
              <td>{FY2027.science.fy26}</td>
              <td>{FY2027.science.request}</td>
              <td>{FY2027.science.house}</td>
              <td>{FY2027.science.senate}</td>
            </tr>
            {rows.map((m) => (
              <tr key={m.id} onClick={() => onSelect(m.id)} style={{ cursor: 'pointer' }}>
                <td>{m.name}</td>
                <td>{m.budget!.fy26 ?? '—'}</td>
                <td>{m.budget!.request}</td>
                <td>{m.budget!.house}</td>
                <td>{m.budget!.senate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
