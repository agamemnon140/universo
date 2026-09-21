import { EclipseRing } from './EclipseRing'
import { ShadowGeometry } from './ShadowGeometry'
import { EclipseCyclePanel } from './EclipseCyclePanel'
import { EclipseRhythmPanel } from './EclipseRhythmPanel'
import { EclipseList } from './EclipseList'

export function EclipsesView({ jd, onJump }: { jd: number; onJump: (jd: number) => void }) {
  return (
    <>
      <EclipseRing jd={jd} />
      <ShadowGeometry jd={jd} />
      <EclipseCyclePanel jd={jd} onJump={onJump} />
      <EclipseRhythmPanel jd={jd} onJump={onJump} />
      <EclipseList jd={jd} onJump={onJump} />
    </>
  )
}
