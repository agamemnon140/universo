/** Tiny 3-vector toolkit for the lit globes: ecliptic coordinates, unit vectors. */
export type Vec3 = [number, number, number]

export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
export const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}
export const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k]
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]

/** A screen basis: `right` and `up` span the picture, `toward` points at the viewer. */
export interface Camera {
  right: Vec3
  up: Vec3
  toward: Vec3
}

export function cameraFrom(right: Vec3, up: Vec3): Camera {
  const r = norm(right)
  const u = norm(up)
  return { right: r, up: u, toward: norm(cross(r, u)) }
}
