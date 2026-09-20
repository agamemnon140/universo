import { MoonPhaseDiagram } from './MoonPhaseDiagram'
import { MoonFacePanel } from './MoonFacePanel'
import { MoonOrbitPanel } from './MoonOrbitPanel'
import { MoonOrbitSide } from './MoonOrbitSide'
import { MoonPeriodsPanel } from './MoonPeriodsPanel'
import { MoonSeasonsPanel } from './MoonSeasonsPanel'
import { MoonNodalPanel } from './MoonNodalPanel'

export function MoonView({ jd }: { jd: number }) {
  return (
    <>
      <MoonPhaseDiagram jd={jd} />
      <MoonFacePanel jd={jd} />
      <MoonOrbitPanel jd={jd} />
      <MoonOrbitSide jd={jd} />
      <MoonPeriodsPanel jd={jd} />
      <MoonSeasonsPanel jd={jd} />
      <MoonNodalPanel jd={jd} />
    </>
  )
}
