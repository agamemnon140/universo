import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { addDays, clampDate, MAX_DATE, MIN_DATE, todayNoon } from '../../lib/dates'

const TICKS_PER_SECOND = 8

const SPEEDS: { label: string; days: number }[] = [
  { label: '1 day', days: 1 },
  { label: '1 week', days: 7 },
  { label: '1 month', days: 30 },
]

const STEPS: { label: string; days: number }[] = [
  { label: '−1 y', days: -365 },
  { label: '−30 d', days: -30 },
  { label: '−1 d', days: -1 },
  { label: '+1 d', days: 1 },
  { label: '+30 d', days: 30 },
  { label: '+1 y', days: 365 },
]

export function TimeControl({
  date,
  setDate,
}: {
  date: Date
  setDate: Dispatch<SetStateAction<Date>>
}) {
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setDate((prev) => {
        const next = addDays(prev, speed)
        if (next.getTime() === prev.getTime()) setPlaying(false) // hit the 2050 edge
        return next
      })
    }, 1000 / TICKS_PER_SECOND)
    return () => window.clearInterval(id)
  }, [playing, speed, setDate])

  const iso = date.toISOString().slice(0, 10)
  const pretty = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <div className="time-control panel">
      <div className="time-row">
        <span className="time-date">{pretty}</span>
        <input
          type="date"
          value={iso}
          min={MIN_DATE}
          max={MAX_DATE}
          aria-label="Date"
          onChange={(e) => {
            const d = new Date(`${e.target.value}T12:00:00Z`)
            if (!isNaN(d.getTime())) setDate(clampDate(d))
          }}
        />
        <button className="chip" onClick={() => setDate(todayNoon())}>
          Today
        </button>
      </div>
      <div className="time-row">
        {STEPS.map((s) => (
          <button key={s.label} className="chip" onClick={() => setDate((d) => addDays(d, s.days))}>
            {s.label}
          </button>
        ))}
        <span className="time-sep" />
        <button
          className={`chip${playing ? ' play' : ''}`}
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        {SPEEDS.map((s) => (
          <button
            key={s.days}
            className={`chip${speed === s.days ? ' on' : ''}`}
            style={speed === s.days ? { background: 'var(--accent-cyan)' } : undefined}
            onClick={() => setSpeed(s.days)}
            title={`${s.label} per step, ${TICKS_PER_SECOND} steps per second`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
