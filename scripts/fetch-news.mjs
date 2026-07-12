/**
 * Fetch the Universe Today RSS feed, classify items by tab theme, and write
 * public/news.json. Run by the weekly news workflow and manually via
 * `node scripts/fetch-news.mjs`. Exits non-zero on failure so CI never
 * commits bad data over a good file.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { XMLParser } from 'fast-xml-parser'

const FEED_URL = 'https://www.universetoday.com/feed'
const OUT_PATH = new URL('../public/news.json', import.meta.url)
const MAX_ITEMS = 40

const THEME_KEYWORDS = {
  'solar-system': [
    'solar system', 'the sun', 'solar ', 'mercury', 'venus', 'mars', 'martian',
    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'the moon', 'lunar',
    'europa', 'titan', 'enceladus', 'ganymede', 'callisto', 'io ', 'triton',
    'asteroid', 'comet', 'kuiper', 'oort', 'ceres', 'phobos', 'artemis',
    'meteor', 'dwarf planet', 'ring system', 'heliosphere',
  ],
  telescopes: [
    'telescope', 'observatory', 'jwst', 'webb', 'hubble', 'chandra', 'alma',
    'vera rubin', 'rubin observatory', 'euclid', 'gaia', 'roman', 'tess',
    'kepler', 'fermi', 'ska ', 'square kilometre', 'ligo', 'virgo', 'lisa',
    'gravitational wave', 'interferometer', 'fast radio', 'spectrograph',
    'observation', 'survey', 'astronomers observe', 'imaging', 'detector',
  ],
  exoplanets: [
    'exoplanet', 'exoplanets', 'planet orbiting', 'habitable', 'trappist',
    'proxima', 'alpha centauri', 'red dwarf', 'super-earth', 'sub-neptune',
    'hot jupiter', 'brown dwarf', 'planetary system', 'biosignature',
    'star system', 'nearby star', 'k2-18', 'transit method', 'radial velocity',
    'stellar neighborhood', 'white dwarf', 'binary star',
  ],
}

function classify(text) {
  const lower = ` ${text.toLowerCase()} `
  const themes = []
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) themes.push(theme)
  }
  return themes
}

function stripHtml(html) {
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8216;|&lsquo;/g, "'")
    .replace(/&#8220;|&ldquo;|&#8221;|&rdquo;/g, '"')
    .replace(/&#8230;|&hellip;/g, '…')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text, max = 200) {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return `${cut.slice(0, Math.max(0, cut.lastIndexOf(' ')))}…`
}

const res = await fetch(FEED_URL, {
  headers: { 'user-agent': 'universo-news-bot (github.com; static site feed refresh)' },
})
if (!res.ok) {
  console.error(`Feed request failed: ${res.status} ${res.statusText}`)
  process.exit(1)
}
const xml = await res.text()

const parser = new XMLParser({ ignoreAttributes: false })
const doc = parser.parse(xml)
const rawItems = doc?.rss?.channel?.item
if (!Array.isArray(rawItems) || rawItems.length === 0) {
  console.error('Feed parsed but no <item> entries found — RSS shape may have changed.')
  process.exit(1)
}

const items = []
for (const raw of rawItems) {
  const title = stripHtml(raw.title ?? '')
  const link = String(raw.link ?? '').trim()
  const description = stripHtml(raw.description ?? '')
  const categories = Array.isArray(raw.category)
    ? raw.category.join(' ')
    : String(raw.category ?? '')
  const pubDate = new Date(raw.pubDate ?? '')
  if (!title || !link || isNaN(pubDate.getTime())) continue

  const themes = classify(`${title} ${categories} ${description}`)
  if (themes.length === 0) continue

  items.push({
    id: createHash('sha1').update(String(raw.guid?.['#text'] ?? raw.guid ?? link)).digest('hex').slice(0, 12),
    title,
    link,
    date: pubDate.toISOString(),
    summary: truncate(description),
    themes,
  })
}

if (items.length === 0) {
  console.error('No feed items matched any theme — refusing to overwrite news.json.')
  process.exit(1)
}

items.sort((a, b) => (a.date < b.date ? 1 : -1))
const nextItems = items.slice(0, MAX_ITEMS)

// Skip the write when content is unchanged so git sees no diff (no
// pointless commit + redeploy — only generatedAt would differ).
try {
  const existing = JSON.parse(readFileSync(OUT_PATH, 'utf8'))
  if (JSON.stringify(existing.items) === JSON.stringify(nextItems)) {
    console.log('news.json already up to date — nothing to write.')
    process.exit(0)
  }
} catch {
  // missing or invalid existing file: proceed with the write
}

const feed = {
  generatedAt: new Date().toISOString(),
  source: 'universetoday.com',
  items: nextItems,
}

writeFileSync(OUT_PATH, `${JSON.stringify(feed, null, 2)}\n`)
console.log(`Wrote ${feed.items.length} items to public/news.json`)
