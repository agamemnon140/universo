import type { Mission, MissionBudget, MissionStatus } from '../../types'
import { FY2027, programOf, type BudgetLine } from '../../lib/missions'
import { formatDate } from '../../lib/format'

const STATUS_ORDER: MissionStatus[] = ['proposed', 'development', 'operating', 'ended']

function Cells({ budget }: { budget: MissionBudget }) {
  return (
    <>
      <td className="fy26">{budget.fy26 ?? '—'}</td>
      <td>{budget.request}</td>
      <td>{budget.house}</td>
      <td>{budget.senate}</td>
    </>
  )
}

function BudgetTable({
  total,
  lines,
  missions,
  firstColumn,
  onSelect,
}: {
  total: BudgetLine
  lines: BudgetLine[]
  missions: Mission[]
  firstColumn: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="panel table-scroll" style={{ marginBottom: 14 }}>
      <table className="planet-table budget-table">
        <thead>
          <tr>
            <th>{firstColumn}</th>
            <th className="fy26">2026</th>
            <th>Request</th>
            <th>House</th>
            <th>Senate</th>
          </tr>
        </thead>
        <tbody>
          <tr className="budget-total">
            <td>{total.name}</td>
            <Cells budget={total} />
          </tr>
          {lines.map((line) => (
            <tr key={line.name}>
              <td>{line.name}</td>
              <Cells budget={line} />
            </tr>
          ))}
          {missions.map((m) => (
            <tr key={m.id} onClick={() => onSelect(m.id)} style={{ cursor: 'pointer' }}>
              <td>{m.name}</td>
              <Cells budget={m.budget!} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** The competing fiscal-2027 proposals, science and exploration apart. */
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

      <h3 className="budget-heading">Science</h3>
      <BudgetTable
        total={FY2027.science}
        lines={[]}
        missions={rows.filter((m) => programOf(m) === 'science')}
        firstColumn="Mission"
        onSelect={onSelect}
      />

      <h3 className="budget-heading">Human exploration</h3>
      <p className="hint">
        Artemis is paid for by system, not by flight, so the rows are the rockets, capsule,
        landers and suits that Artemis III and IV share. Each plan adds 1,025 to the Space Launch
        System from the 2025 reconciliation law.
      </p>
      <BudgetTable
        total={FY2027.exploration}
        lines={FY2027.explorationLines}
        missions={rows.filter((m) => programOf(m) === 'exploration')}
        firstColumn="Line"
        onSelect={onSelect}
      />
    </section>
  )
}
