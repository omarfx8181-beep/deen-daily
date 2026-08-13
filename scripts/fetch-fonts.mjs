#!/usr/bin/env node
/**
 * Vendors the app's fonts (the exact families/axes the prototype loads from
 * Google Fonts) into src/assets/fonts so the app works fully offline and
 * makes no third-party requests at runtime.
 *
 * Downloads the woff2 files for the `latin` and `arabic` subsets and writes
 * fonts.css with the same @font-face rules pointing at the local files.
 * Uses curl so the environment's HTTPS proxy is respected.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(root, 'src', 'assets', 'fonts')

// Same families/axes as the prototype's Google Fonts link.
const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Marcellus&family=Amiri:ital@0;1&family=Inter:wght@400,500,600,700&display=swap'
    .replace('wght@400,500,600,700', 'wght@400;500;600;700')
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const SUBSETS = new Set(['latin', 'arabic'])

const curl = (url, args = []) => execFileSync('curl', ['-sSfL', '-A', UA, ...args, url])

const css = curl(CSS_URL).toString('utf8')

// css2 emits `/* subset */` before each @font-face block.
const blockRe = /\/\* ([a-z-]+) \*\/\s*(@font-face\s*\{[^}]*\})/g
const out = []
let match
let count = 0
mkdirSync(OUT_DIR, { recursive: true })
while ((match = blockRe.exec(css)) !== null) {
  const [, subset, block] = match
  if (!SUBSETS.has(subset)) continue
  const family = block.match(/font-family:\s*'([^']+)'/)[1]
  const style = block.match(/font-style:\s*(\w+)/)[1]
  const weight = block.match(/font-weight:\s*(\d+)/)[1]
  const url = block.match(/src:\s*url\((https:[^)]+\.woff2)\)/)[1]
  const file = `${family.toLowerCase().replace(/\s+/g, '-')}-${style}-${weight}-${subset}.woff2`
  writeFileSync(join(OUT_DIR, file), curl(url))
  out.push(`/* ${subset} */\n${block.replace(url, `./${file}`)}`)
  count++
}
if (count === 0) throw new Error('No @font-face blocks matched — did the css2 format change?')

writeFileSync(
  join(OUT_DIR, 'fonts.css'),
  `/* Self-hosted fonts (latin + arabic subsets), vendored by scripts/fetch-fonts.mjs\n   from Google Fonts (same families the prototype loads). Do not edit by hand. */\n\n` +
    out.join('\n') +
    '\n',
)
console.log(`Vendored ${count} font files into src/assets/fonts/`)
