import { SeasonsDiagram } from './SeasonsDiagram'
import { DayNightPanel } from './DayNightPanel'
import { EarthOrbitPanel } from './EarthOrbitPanel'

export function EarthView({ jd }: { jd: number }) {
  return (
    <>
      <SeasonsDiagram jd={jd} />
      <DayNightPanel jd={jd} />
      <EarthOrbitPanel jd={jd} />
    </>
  )
}
