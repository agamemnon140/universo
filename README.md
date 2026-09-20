# Universo

Interactive guide to the solar system, where the planets and the Moon are right now, the
world's great telescopes, and our stellar neighborhood — built as a static PWA and published
on GitHub Pages.

**Live site:** https://agamemnon140.github.io/universo/

## Tabs

- **Solar System** — 45 bodies (Sun, planets, dwarf planets, every moon ≥100 km) with sizes
  drawn to relative scale, sortable by size, mass, or orbit distance from the Sun / parent
  planet. Select any two to compare them: true-scale circles plus a full ratio table (mass,
  volume, radius, surface area, gravity, density, temperature, escape velocity, orbital period,
  sidereal rotation and solar day, eccentricity, inclination, Roche limit, Hill sphere, surface
  and core composition). Comparisons are shareable via `?compare=jupiter,earth`. A secondary
  log-scale orbit view links to detail sheets with atmosphere, missions, and notable facts.
- **Positions** — where the planets, Earth and the Moon really are on any date from 1800 to
  2050 (defaults to today, with a date picker, ±day/month/year steps and a play button), in
  four views. *Planets* draws the eight planets on their true orbits, centred on the Sun
  (heliocentric longitude) or on Earth (elongation from the Sun, evening vs morning sky,
  night-side shading), on a log scale or in true-scale inner/outer views, with a table of
  distances and visibility, each orbit's eccentricity and perihelion/aphelion marks, and — with
  Earth at the centre — the tropical zodiac band and each body's sign. *Earth* shows the 23.4°
  axis around the orbit with globes lit by real 3D geometry, a panel explaining the day–night
  line (side views at the equinoxes and solstices, today's globe, daylight hours and noon Sun
  height by latitude), then the orbit's true and exaggerated ellipse: distance and speed today, next
  perihelion and aphelion, Kepler's equal-area sectors, and the slow precession of perihelion.
  *Moon* shows the phase from above and as seen from Earth with the next principal phases; a
  stylised near side with today's terminator, libration and local time at the Apollo 11 site;
  the orbit's ellipse with perigee, apogee, apparent size and supermoons; the 5.1° orbital
  tilt with the Moon's current height above or below the ecliptic and the nodes; the five
  lunar months and the locked spin; why the Moon has no seasons and what that does to its
  poles; and the 18.6-year nodal cycle (major and minor standstills). *Eclipses* is
  interactive: the Sun and the line of nodes on a ring with the eclipse-season windows, the
  shadow geometry (umbra, penumbra, γ) of the coming new and full Moon with its verdict, a
  20-year timeline showing the 6-month beat of eclipse seasons and the saros repeat, a list of
  every eclipse in the next ten years with type and class, and previous/next-eclipse buttons
  on the time control. Snapshots are shareable via
  `?date=2026-08-12&view=eclipses` (plus `centre=earth` / `scale=inner|outer` for the map).
- **Telescopes** — 49 observatories placed on the electromagnetic spectrum (gamma → radio,
  log wavelength scale), color-coded by status (operating / construction / planned / retired),
  with separate lanes for gravitational-wave and neutrino detectors. Filter by status and
  space/ground, order the rows by wavelength or by first light; tap a bar for aperture, field
  of view, limiting magnitude, instruments, and objectives.
- **Neighborhood** — top-down map of the galactic plane with 70 star systems: the real census
  within 20 light-years plus famous distant systems (TRAPPIST-1, K2-18, Kepler-452…). Zoom
  levels of 20 / 100 / 1500 ly on a log radial scale. Stars are colored by spectral class;
  amber rings mark systems with known exoplanets. Detail sheets list planets, discovery data,
  and the star's habitable zone.

Every tab ends with the latest matching headlines from
[Universe Today](https://www.universetoday.com/).

## How it works

- Vite + React + TypeScript, plain SVG for all visualizations, no chart libraries.
- Datasets are hand-curated JSON in [src/data/](src/data/), cross-checked against NASA
  factsheets and the NASA Exoplanet Archive. Solar-system relative values (mass, volume,
  radius, orbit, Roche limit, Hill sphere) follow the project owner's reference spreadsheet.
  Surface area and the solar day are derived in [src/lib/derive.ts](src/lib/derive.ts) rather
  than stored: the stored rotation period is sidereal (one turn against the stars), and the
  solar day adds the extra turn a body needs to face the Sun again after moving along its orbit.
- Positions are computed in the browser by [src/lib/ephemeris.ts](src/lib/ephemeris.ts) and
  friends ([apsides.ts](src/lib/apsides.ts) for perihelion/perigee and vis-viva speeds,
  [libration.ts](src/lib/libration.ts) for libration, the sub-solar point and the nodal cycle,
  [eclipses.ts](src/lib/eclipses.ts) for syzygies and eclipse classification after Meeus ch. 54):
  planets from the JPL "Approximate Positions of the Planets" Keplerian elements
  ([src/data/orbits.ts](src/data/orbits.ts), fitted for 1800–2050, ~1° accuracy, precessed to
  the equinox of date), Sun and Moon from Paul Schlyter's low-precision formulae (mean elements
  plus the main lunar perturbations, ~0.05° for the Moon). Every calendar day is evaluated at
  12:00 UTC. Checked against the 12 Aug 2026 total solar eclipse, the 2026–27 oppositions of
  Jupiter, Saturn and Mars, and the September 2026 equinox (within a minute). The eclipse
  finder reproduces every eclipse of 2026–2029 with its type; classes are right except in
  borderline cases, which are flagged, and where on Earth an eclipse is visible is out of scope.
- News: [.github/workflows/news.yml](.github/workflows/news.yml) runs weekly (Mondays 09:17
  UTC), fetches the Universe Today RSS feed via [scripts/fetch-news.mjs](scripts/fetch-news.mjs),
  classifies items per tab, and commits `public/news.json` only when content changed — then
  triggers the reusable deploy workflow.
- Deploy: [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and publishes to
  GitHub Pages on every push to `main` (artifact flow, no gh-pages branch).
- PWA: `manifest.webmanifest` + apple-touch-icon so the site installs to the iOS home screen
  with a custom solar-system icon. Icons are rendered from
  [public/icon.svg](public/icon.svg) by `node scripts/generate-icons.mjs`.

## Development

```sh
npm install
npm run dev        # local dev server
npm run build      # typecheck + production build
node scripts/fetch-news.mjs      # refresh public/news.json
node scripts/generate-icons.mjs  # re-render PNG icons after editing icon.svg
```
