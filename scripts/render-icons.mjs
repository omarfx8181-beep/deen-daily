#!/usr/bin/env node
/**
 * Renders public/favicon.svg to the PNG app icons (PWA + apple-touch) using
 * the locally installed headless Chromium. Re-run after editing the SVG.
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'public', 'favicon.svg'), 'utf8')
const SIZES = [
  ['pwa-192.png', 192],
  ['pwa-512.png', 512],
  ['pwa-maskable-512.png', 512],
  ['apple-touch-icon.png', 180],
]

const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ executablePath })
for (const [name, size] of SIZES) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.setContent(
    `<body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`,
  )
  await page.screenshot({ path: join(root, 'public', name) })
  await page.close()
  console.log(`rendered public/${name} (${size}x${size})`)
}
await browser.close()
