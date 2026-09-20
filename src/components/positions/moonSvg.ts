/**
 * SVG path of the sunlit part of a disc as seen from Earth (north up, east right):
 * lit limb on the right while waxing, on the left while waning, terminator a half-ellipse.
 * `elongationDeg` is Moon minus Sun longitude: 0 = new, 180 = full.
 * The dark part is simply the lit part of the opposite phase: litPath(…, elongation + 180).
 */
export function litPath(cx: number, cy: number, r: number, elongationDeg: number): string {
  const e = ((elongationDeg % 360) + 360) % 360
  const waxing = e < 180
  const gibbous = e > 90 && e < 270
  const rx = Math.max(0.01, r * Math.abs(Math.cos((e * Math.PI) / 180)))
  const top = `${cx} ${cy - r}`
  const bottom = `${cx} ${cy + r}`
  const limb = `A ${r} ${r} 0 0 ${waxing ? 1 : 0} ${bottom}`
  const sweep = waxing ? (gibbous ? 1 : 0) : gibbous ? 0 : 1
  return `M ${top} ${limb} A ${rx} ${r} 0 0 ${sweep} ${top} z`
}
