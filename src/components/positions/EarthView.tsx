import { SeasonsDiagram } from './SeasonsDiagram'
import { EarthOrbitPanel } from './EarthOrbitPanel'

export function EarthView({ jd }: { jd: number }) {
  return (
    <>
      <SeasonsDiagram jd={jd} />
      <EarthOrbitPanel jd={jd} />
    </>
  )
}
