import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classify } from './classify-news.mjs'

test('a radio-astronomy story is not filed under the moon Io', () => {
  const themes = classify('LOFAR Takes the Deepest Image of the Low-Frequency Radio Sky to Date')
  assert.ok(!themes.includes('solar-system'))
  assert.ok(themes.includes('telescopes'))
})

test('Io itself still counts as solar system', () => {
  assert.ok(classify("Io's volcanoes, seen by Juno").includes('solar-system'))
  assert.ok(classify('A new map of Io, Europa and Ganymede').includes('solar-system'))
})

test('keywords do not match inside longer words', () => {
  assert.deepEqual(classify('Marshall engineers test a titanium alloy in the studio'), [])
  assert.deepEqual(classify('A Romanian team models scenarios for stellar audio'), [])
})

test('plurals and hyphenated forms match', () => {
  assert.ok(classify('Two asteroids and three comets').includes('solar-system'))
  assert.ok(classify('A super-Earth among the exoplanets').includes('exoplanets'))
  assert.ok(classify('New gravitational-wave detectors').includes('telescopes'))
  assert.ok(classify('Trans-Neptunian objects beyond Pluto').includes('solar-system'))
})

test('dwarf planets are solar system news', () => {
  for (const name of ['Ceres', 'Eris', 'Haumea', 'Makemake']) {
    assert.ok(classify(`${name} surprises astronomers`).includes('solar-system'), name)
  }
})

test('mission stories get the missions theme', () => {
  assert.ok(classify('BepiColombo enters orbit around Mercury').includes('missions'))
  assert.ok(classify('China delays the Chang’e 7 launch').includes('missions'))
  assert.ok(classify('NASA picks two sample-return concepts').includes('missions'))
  assert.ok(!classify('Astronomers probe the origin of a fast radio burst').includes('missions'))
})

test('a story can belong to several themes', () => {
  const themes = classify('JWST images the rings of Uranus during a spacecraft flyby')
  assert.deepEqual(themes, ['solar-system', 'telescopes', 'missions'])
})
