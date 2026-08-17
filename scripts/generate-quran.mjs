#!/usr/bin/env node
/**
 * Generates public/quran/<surah>.json — the full Qur'an, one file per surah:
 * Arabic (Uthmani), an English transliteration, and an English translation
 * for every ayah, plus public/quran/manifest.json (per-file sha256 + counts).
 *
 * SOURCES (copied VERBATIM, never generated or edited):
 *   - Arabic Uthmani text: The Noble Qur'an Encyclopedia (quranenc.com),
 *     the King Fahd Complex text — the authenticated source the spec requires.
 *   - Transliteration: Tanzil.net en.transliteration.
 *   - Translation: Saheeh International (Umm Muhammad), via Tanzil.net.
 *   All three as published in the `quran-json` npm package.
 *
 *   QURAN_JSON=/path/to/package/dist npm run generate:quran
 *
 * The generated files are committed and guarded by scripts/verify-data.mjs,
 * which re-checks the manifest and cross-checks every ayah count against the
 * prototype-verified SURAHS metadata in src/data/content.js.
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SURAHS } from '../src/data/content.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = process.env.QURAN_JSON
if (!SRC) throw new Error('Set QURAN_JSON to the quran-json package dist directory')
const OUT_DIR = join(root, 'public', 'quran')

mkdirSync(OUT_DIR, { recursive: true })

const manifest = { source: 'quranenc.com (King Fahd Complex) · Tanzil · Saheeh International', surahs: {} }
let totalBytes = 0

for (const [n, name, meaning, ayahs, startPage] of SURAHS) {
  const src = JSON.parse(readFileSync(join(SRC, 'chapters', 'en', `${n}.json`), 'utf8'))
  const verses = (src.verses || src).map((v) => ({
    i: v.id,
    ar: v.text,
    tr: v.transliteration,
    en: v.translation,
  }))
  if (verses.length !== ayahs) {
    throw new Error(`surah ${n}: source has ${verses.length} ayat, prototype says ${ayahs}`)
  }
  if (verses.some((v, ix) => v.i !== ix + 1)) throw new Error(`surah ${n}: ayah numbering gap`)
  if (verses.some((v) => !v.ar || !v.tr || !v.en)) throw new Error(`surah ${n}: empty field`)

  const json = JSON.stringify({ n, name, meaning, ayahs, startPage, verses })
  writeFileSync(join(OUT_DIR, `${n}.json`), json)
  totalBytes += json.length
  manifest.surahs[n] = {
    ayahs: verses.length,
    sha256: createHash('sha256').update(json).digest('hex'),
  }
}

writeFileSync(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest))
console.log(
  `Wrote ${SURAHS.length} surah files (${(totalBytes / 1024 / 1024).toFixed(2)} MB) + manifest.json`,
)
