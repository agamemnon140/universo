# Universo

Interactive guide to the solar system, the world's great telescopes, and our stellar
neighborhood — built as a static PWA and published on GitHub Pages.

**Live site:** https://agamemnon140.github.io/universo/

## Tabs

- **Solar System** — 20 bodies (Sun, planets, Pluto, 10 major moons) with sizes drawn to
  relative scale. Select any two to compare them: true-scale circles plus a full ratio table
  (mass, volume, radius, gravity, density, temperature, escape velocity, orbital and rotation
  periods, eccentricity, inclination, Roche limit, Hill sphere). Comparisons are shareable via
  `?compare=jupiter,earth`. A secondary log-scale orbit view links to detail sheets with
  atmosphere, missions, and notable facts.
- **Telescopes** — 49 observatories placed on the electromagnetic spectrum (gamma → radio,
  log wavelength scale), color-coded by status (operating / construction / planned / retired),
  with separate lanes for gravitational-wave and neutrino detectors. Filter by status and
  space/ground; tap a bar for aperture, field of view, limiting magnitude, instruments, and
  objectives.
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
