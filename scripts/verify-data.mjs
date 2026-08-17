#!/usr/bin/env node
/**
 * Integrity gate for the generated datasets that do NOT come from the
 * prototype (npm run verify:data):
 *
 *   public/quran/*.json  — Qur'an text, transliteration, translation
 *   public/data/hisn.json — Hisn al-Muslim du'a collection
 *
 * Checks, for every file:
 *   1. sha256 matches the committed manifest (detects any post-generation
 *      edit, deliberate or accidental — these files are never hand-edited).
 *   2. Structure: contiguous ayah numbering, no empty Arabic/translit/
 *      translation field, valid chapter references.
 *   3. Cross-check against the prototype: every surah's ayah count and name
 *      must equal the SURAHS metadata in src/data/content.js, which is
 *      itself byte-verified against deen-daily-v2.html by verify:content.
 *
 * Exits non-zero on any mismatch.
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SURAHS } from '../src/data/content.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sha = (s) => createHash('sha256').update(s).digest('hex')

let failures = 0
const fail = (msg) => {
  failures++
  console.error(`✗ ${msg}`)
}

// ---- Qur'an ----
const manifest = JSON.parse(readFileSync(join(root, 'public', 'quran', 'manifest.json'), 'utf8'))
let ayahTotal = 0
for (const [n, name, , ayahs] of SURAHS) {
  const raw = readFileSync(join(root, 'public', 'quran', `${n}.json`), 'utf8')
  const entry = manifest.surahs[n]
  if (!entry) {
    fail(`surah ${n}: missing from manifest`)
    continue
  }
  if (sha(raw) !== entry.sha256) {
    fail(`surah ${n}: sha256 mismatch — file was modified after generation`)
    continue
  }
  const s = JSON.parse(raw)
  if (s.n !== n || s.name !== name) fail(`surah ${n}: identity mismatch vs prototype (${s.name})`)
  if (s.verses.length !== ayahs || entry.ayahs !== ayahs) {
    fail(`surah ${n}: ${s.verses.length} ayat, prototype says ${ayahs}`)
    continue
  }
  if (s.verses.some((v, i) => v.i !== i + 1)) fail(`surah ${n}: ayah numbering not contiguous`)
  if (s.verses.some((v) => !v.ar?.trim() || !v.tr?.trim() || !v.en?.trim()))
    fail(`surah ${n}: empty arabic/transliteration/translation field`)
  ayahTotal += s.verses.length
}
if (!failures) console.log(`✓ Qur'an: 114 surahs, ${ayahTotal} ayat — sha256 + counts verified`)

// ---- Hisn al-Muslim ----
const hisnRaw = readFileSync(join(root, 'public', 'data', 'hisn.json'), 'utf8')
const hisnMan = JSON.parse(readFileSync(join(root, 'public', 'data', 'hisn.manifest.json'), 'utf8'))
if (sha(hisnRaw) !== hisnMan.sha256) {
  fail('hisn.json: sha256 mismatch — file was modified after generation')
} else {
  const hisn = JSON.parse(hisnRaw)
  if (hisn.chapters.length !== hisnMan.chapters)
    fail(`hisn.json: ${hisn.chapters.length} chapters, manifest says ${hisnMan.chapters}`)
  if (hisn.duas.length !== hisnMan.duas)
    fail(`hisn.json: ${hisn.duas.length} du'as, manifest says ${hisnMan.duas}`)
  const chapterNumbers = new Set(hisn.chapters.map((c) => c.n))
  if (hisn.chapters.some((c) => !Number.isInteger(c.n) || c.n <= 0 || !c.title))
    fail('hisn.json: chapter without a valid number or title')
  if (hisn.duas.some((d) => !chapterNumbers.has(d.ch))) fail('hisn.json: du’a with unknown chapter')
  const populated = new Set(hisn.duas.map((d) => d.ch))
  if (hisn.chapters.some((c) => !populated.has(c.n))) fail('hisn.json: chapter with no du’as')
  if (hisn.duas.some((d) => !d.ar?.trim())) fail('hisn.json: du’a with empty Arabic')
  // Content integrity: nothing is displayed without its source.
  const unsourced = hisn.duas.filter((d) => !d.ref?.trim())
  if (unsourced.length)
    fail(`hisn.json: ${unsourced.length} du’a(s) with no reference (e.g. #${unsourced[0].n})`)
  // A "Say it" line must be a transliteration, never English narration.
  const badTranslit = hisn.duas.filter(
    (d) =>
      d.translit &&
      (!/[āīūḥṣḍṭẓĀĪŪḤṢḌṬẒ]/.test(d.translit) ||
        /\(ﷺ\)|said:|Messenger of Allah|The Prophet|narrated/i.test(d.translit)),
  )
  if (badTranslit.length)
    fail(
      `hisn.json: ${badTranslit.length} "Say it" line(s) look like English prose (e.g. #${badTranslit[0].n})`,
    )
  const translits = hisn.duas.filter((d) => d.translit?.trim()).length
  if (translits !== hisnMan.withTranslit)
    fail(`hisn.json: ${translits} transliterations, manifest says ${hisnMan.withTranslit}`)
  if (!failures)
    console.log(
      `✓ Hisn al-Muslim: ${hisn.chapters.length} chapters, ${hisn.duas.length} du'as ` +
        `(${translits} with transliteration) — sha256 + structure verified`,
    )
}

if (failures) {
  console.error(`\n${failures} failure(s). Generated data does NOT match its manifest.`)
  process.exit(1)
}
console.log('\nAll generated datasets verified.')
