export const ZOOM_LEVELS = [20, 100, 1500, 30000] as const
export type ZoomLy = (typeof ZOOM_LEVELS)[number]

const LABELS: Record<ZoomLy, string> = {
  20: '20 ly',
  100: '100 ly',
  1500: '1500 ly',
  30000: '30k ly',
}

export function ZoomControl({ zoom, onZoom }: { zoom: ZoomLy; onZoom: (z: ZoomLy) => void }) {
  return (
    <div className="zoom-control">
      {ZOOM_LEVELS.map((level) => (
        <button
          key={level}
          className={zoom === level ? 'active' : ''}
          onClick={() => onZoom(level)}
        >
          {LABELS[level]}
        </button>
      ))}
    </div>
  )
}
