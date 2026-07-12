export const ZOOM_LEVELS = [20, 100, 1500] as const
export type ZoomLy = (typeof ZOOM_LEVELS)[number]

export function ZoomControl({ zoom, onZoom }: { zoom: ZoomLy; onZoom: (z: ZoomLy) => void }) {
  return (
    <div className="zoom-control">
      {ZOOM_LEVELS.map((level) => (
        <button
          key={level}
          className={zoom === level ? 'active' : ''}
          onClick={() => onZoom(level)}
        >
          {level} ly
        </button>
      ))}
    </div>
  )
}
