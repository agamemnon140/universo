/** Star rendering: spectral class → color, radius → marker size. */

const CLASS_COLORS: Record<string, string> = {
  O: '#9db4ff',
  B: '#aabfff',
  A: '#cad7ff',
  F: '#f8f7ff',
  G: '#fff4ea',
  K: '#ffd2a1',
  M: '#ffb56c',
  L: '#ff8f5e',
  T: '#d97757', // brown dwarfs
  Y: '#b8624d',
  D: '#c9d4e8', // white dwarfs
}

export function spectralColor(spectralClass: string): string {
  const letter = spectralClass.trim().charAt(0).toUpperCase()
  return CLASS_COLORS[letter] ?? '#dbe4ff'
}

/** Marker radius in px: ∝ sqrt(stellar radius), clamped for readability. */
export function markerRadius(radiusSun: number): number {
  return Math.min(10, Math.max(2, Math.sqrt(radiusSun) * 5))
}

export function spectralLabel(spectralClass: string): string {
  const letter = spectralClass.trim().charAt(0).toUpperCase()
  const names: Record<string, string> = {
    O: 'blue giant',
    B: 'blue-white star',
    A: 'white star',
    F: 'yellow-white star',
    G: 'Sun-like star',
    K: 'orange dwarf',
    M: 'red dwarf',
    L: 'brown dwarf',
    T: 'brown dwarf',
    Y: 'brown dwarf',
    D: 'white dwarf',
  }
  return names[letter] ?? 'star'
}
