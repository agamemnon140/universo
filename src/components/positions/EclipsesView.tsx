import { EclipseRing } from './EclipseRing'
import { ShadowGeometry } from './ShadowGeometry'
import { EclipseList } from './EclipseList'

export function EclipsesView({ jd, onJump }: { jd: number; onJump: (jd: number) => void }) {
  return (
    <>
      <EclipseRing jd={jd} />
      <ShadowGeometry jd={jd} />
      <EclipseList jd={jd} onJump={onJump} />
    </>
  )
}
