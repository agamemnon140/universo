import { SeasonsDiagram } from './SeasonsDiagram'
import { MoonOrbitSide } from './MoonOrbitSide'
import { MoonPhaseDiagram } from './MoonPhaseDiagram'

export function EarthMoonView({ jd }: { jd: number }) {
  return (
    <>
      <SeasonsDiagram jd={jd} />
      <MoonPhaseDiagram jd={jd} />
      <MoonOrbitSide jd={jd} />
    </>
  )
}
