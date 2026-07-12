/**
 * Render public/icon.svg to the PWA PNG set. Run once locally after changing
 * the icon art (`node scripts/generate-icons.mjs`); the PNGs are committed.
 */
import sharp from 'sharp'

const jobs = [
  { size: 180, out: 'public/apple-touch-icon.png' },
  { size: 192, out: 'public/icons/icon-192.png' },
  { size: 512, out: 'public/icons/icon-512.png' },
]

for (const { size, out } of jobs) {
  await sharp('public/icon.svg', { density: 300 })
    .resize(size, size)
    .flatten({ background: '#050a18' }) // apple-touch-icon must be opaque
    .png()
    .toFile(out)
  console.log(`${out} (${size}×${size})`)
}
