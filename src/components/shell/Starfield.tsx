import { useMemo } from 'react'

/** Decorative static starfield: cheap, deterministic pseudo-random dots. */
export function Starfield() {
  const stars = useMemo(() => {
    const out: { x: number; y: number; r: number; o: number }[] = []
    let seed = 42
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    for (let i = 0; i < 140; i++) {
      out.push({
        x: rand() * 100,
        y: rand() * 100,
        r: 0.4 + rand() * 1.1,
        o: 0.15 + rand() * 0.5,
      })
    }
    return out
  }, [])

  return (
    <svg
      className="starfield"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r / 10} fill="#dbe4ff" opacity={s.o} />
      ))}
    </svg>
  )
}
