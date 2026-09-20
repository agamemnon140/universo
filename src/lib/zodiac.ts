/**
 * The tropical zodiac: twelve 30° slices of the ecliptic counted from the March equinox
 * (♈ 0°). Because our longitudes are referred to the equinox of date, a planet's tropical
 * sign follows directly from its geocentric longitude. The constellations of the same names
 * have drifted about 24° east since the signs were fixed some 2,000 years ago.
 */
export interface Sign {
  symbol: string
  name: string
  startDeg: number
}

export const SIGNS: Sign[] = [
  { symbol: '♈', name: 'Aries', startDeg: 0 },
  { symbol: '♉', name: 'Taurus', startDeg: 30 },
  { symbol: '♊', name: 'Gemini', startDeg: 60 },
  { symbol: '♋', name: 'Cancer', startDeg: 90 },
  { symbol: '♌', name: 'Leo', startDeg: 120 },
  { symbol: '♍', name: 'Virgo', startDeg: 150 },
  { symbol: '♎', name: 'Libra', startDeg: 180 },
  { symbol: '♏', name: 'Scorpio', startDeg: 210 },
  { symbol: '♐', name: 'Sagittarius', startDeg: 240 },
  { symbol: '♑', name: 'Capricorn', startDeg: 270 },
  { symbol: '♒', name: 'Aquarius', startDeg: 300 },
  { symbol: '♓', name: 'Pisces', startDeg: 330 },
]

export function signOf(lonDeg: number): Sign {
  const l = ((lonDeg % 360) + 360) % 360
  return SIGNS[Math.floor(l / 30)]
}

/** "12° Virgo" — degrees into the sign. */
export function signPosition(lonDeg: number): string {
  const l = ((lonDeg % 360) + 360) % 360
  const s = signOf(l)
  return `${Math.floor(l - s.startDeg)}° ${s.name}`
}
