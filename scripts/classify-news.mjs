/**
 * Sort a news item into the tab themes it belongs to.
 *
 * Keywords match whole words (optionally plural), never fragments of longer
 * words: a plain substring test filed every "radio" story under the moon Io,
 * and would do the same for "Marshall" (Mars) or "titanium" (Titan). Hyphens
 * count as spaces on both sides, so 'super earth' also finds "super-Earth".
 */
export const THEME_KEYWORDS = {
  'solar-system': [
    'solar system', 'the sun', 'solar', 'mercury', 'venus', 'mars', 'martian',
    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'the moon', 'lunar',
    'europa', 'titan', 'enceladus', 'ganymede', 'callisto', 'io', 'triton',
    'charon', 'asteroid', 'comet', 'kuiper', 'oort', 'ceres', 'eris', 'haumea',
    'makemake', 'vesta', 'bennu', 'apophis', 'phobos', 'deimos', 'artemis',
    'meteor', 'meteorite', 'dwarf planet', 'trans neptunian', 'ring system',
    'heliosphere',
  ],
  telescopes: [
    'telescope', 'observatory', 'observatories', 'jwst', 'webb', 'hubble',
    'chandra', 'alma', 'vera rubin', 'rubin observatory', 'euclid', 'gaia',
    'roman', 'tess', 'kepler', 'fermi', 'ska', 'square kilometre', 'lofar',
    'meerkat', 'ligo', 'virgo', 'lisa', 'gravitational wave', 'interferometer',
    'fast radio', 'radio astronomy', 'spectrograph', 'observation', 'survey',
    'astronomers observe', 'imaging', 'detector',
  ],
  exoplanets: [
    'exoplanet', 'planet orbiting', 'habitable', 'habitability', 'trappist',
    'proxima', 'alpha centauri', 'red dwarf', 'super earth', 'sub neptune',
    'hot jupiter', 'brown dwarf', 'planetary system', 'biosignature',
    'star system', 'nearby star', 'k2 18', 'transit method', 'radial velocity',
    'stellar neighborhood', 'white dwarf', 'binary star',
  ],
  missions: [
    'mission', 'spacecraft', 'space probe', 'rover', 'lander', 'orbiter',
    'flyby', 'sample return', 'launch', 'launched', 'artemis', 'voyager',
    'perseverance', 'europa clipper', 'juice', 'dragonfly', 'bepicolombo',
    'new horizons', 'osiris', 'tianwen', "chang'e", 'starship', 'mmx',
  ],
}

/** Lower-case, straighten apostrophes, and treat hyphens and dashes as spaces. */
function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[-‐-―]/g, ' ')
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** One regex per theme: any keyword as a whole word, with an optional plural s/es. */
const THEME_PATTERNS = Object.entries(THEME_KEYWORDS).map(([theme, keywords]) => {
  const alternatives = keywords.map((kw) => escapeRegExp(normalize(kw)).replace(/ +/g, '\\s+'))
  return [theme, new RegExp(`(?<![a-z0-9])(?:${alternatives.join('|')})(?:es|s)?(?![a-z0-9])`)]
})

export function classify(text) {
  const haystack = normalize(text)
  return THEME_PATTERNS.filter(([, pattern]) => pattern.test(haystack)).map(([theme]) => theme)
}
