#!/usr/bin/env node
/**
 * Generates public/data/hisn.json — the complete Hisn al-Muslim
 * ("Fortress of the Muslim") collection: Arabic, transliteration,
 * translation and reference for every du'a, grouped into its chapters.
 *
 * SOURCE: the sunnah.com hadith corpus as published in the `hadith` npm
 * package (collection 300 = Hisn al-Muslim). Every field is copied
 * VERBATIM from that corpus — nothing is retyped, translated, or
 * generated. Run with the extracted package available:
 *
 *   HADITH_DB=/path/to/package/data/hadith.db npm run generate:hisn
 *
 * The generated file is committed and guarded by scripts/verify-data.mjs
 * (SHA-256 manifest + structural checks), which is what CI runs.
 */
import { DatabaseSync } from 'node:sqlite'
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const DB = process.env.HADITH_DB
if (!DB) throw new Error('Set HADITH_DB to the hadith package hadith.db path')
const OUT = join(root, 'public', 'data', 'hisn.json')
const COLLECTION = 300

// A paragraph is the transliteration only if it carries the corpus's scholarly
// transliteration letters (macrons / under-dots). Curly quotes and backticks
// are NOT evidence — they appear in ordinary English narration too, and
// treating them as a signal labels English prose as something to recite.
const TRANSLIT_LETTERS = /[āīūḥṣḍṭẓĀĪŪḤṢḌṬẒ]/
// Narration markers: if the paragraph tells a story about the Prophet ﷺ or a
// companion, it is prose, even when a transliterated du'a is embedded in it.
const NARRATION = /\(ﷺ\)|said:|Messenger of Allah|The Prophet|used to|narrated/i

const isTransliteration = (p) => {
  if (!TRANSLIT_LETTERS.test(p)) return false
  if (NARRATION.test(p)) return false
  // Require several diacritic letters so a stray accented word cannot qualify.
  return (p.match(/[āīūḥṣḍṭẓĀĪŪḤṢḌṬẒ]/g) || []).length >= 3
}

const db = new DatabaseSync(DB, { readOnly: true })

// The corpus carries one unnumbered section header ("The merit of dhikr")
// with no du'as attached; drop chapters without a real number so every
// chapter listed is a real, populated occasion.
const chapters = db
  .prepare(
    'SELECT number n, title_en titleEn, title titleAr FROM chapter WHERE collection_id=? ORDER BY number',
  )
  .all(COLLECTION)
  .map((c) => ({ n: Number(c.n), title: (c.titleEn || '').trim(), titleAr: (c.titleAr || '').trim() }))
  .filter((c) => Number.isInteger(c.n) && c.n > 0)

const rows = db
  .prepare(
    `SELECT h.display_number n, h.chapter_id ch, h.content ar, e.content en
     FROM hadith h JOIN hadith_en e ON e.arabic_urn = h.urn
     WHERE h.collection_id = ? ORDER BY CAST(h.display_number AS INTEGER)`,
  )
  .all(COLLECTION)

const chapterNumberById = new Map(
  db
    .prepare('SELECT id, number FROM chapter WHERE collection_id=?')
    .all(COLLECTION)
    .map((c) => [c.id, c.number]),
)

let withTranslit = 0
const duas = rows.map((r) => {
  const parts = String(r.en || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  const refIx = parts.findIndex((p) => /^Reference:?$/i.test(p) || /^Reference:/i.test(p))
  const body = refIx === -1 ? parts : parts.slice(0, refIx)
  const ref =
    refIx === -1
      ? ''
      : parts
          .slice(refIx)
          .join(' ')
          .replace(/^Reference:?\s*/i, '')
          .trim()

  let translit = ''
  let meaning = ''
  if (body.length >= 2 && isTransliteration(body[0])) {
    translit = body[0]
    meaning = body.slice(1).join('\n\n')
    withTranslit++
  } else {
    // Mixed narration-and-transliteration, or none at all: show the whole
    // English as the meaning rather than labelling prose "Say it".
    meaning = body.join('\n\n')
  }
  return {
    n: Number(r.n),
    ch: chapterNumberById.get(r.ch) ?? 0,
    ar: String(r.ar || '').trim(),
    translit,
    meaning,
    ref,
  }
})

// Content integrity rule: every hadith must display its source. The corpus
// leaves a reference off a few entries — those are dropped rather than shown
// unsourced.
const sourced = duas.filter((d) => d.ref.trim())
const dropped = duas.length - sourced.length
const keptChapters = new Set(sourced.map((d) => d.ch))

const payload = {
  source: 'Hisn al-Muslim — sunnah.com corpus, copied verbatim',
  chapters: chapters.filter((c) => keptChapters.has(c.n)),
  duas: sourced,
}
const json = JSON.stringify(payload)
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, json)
writeFileSync(
  join(dirname(OUT), 'hisn.manifest.json'),
  JSON.stringify({
    sha256: createHash('sha256').update(json).digest('hex'),
    chapters: payload.chapters.length,
    duas: payload.duas.length,
    withTranslit: payload.duas.filter((d) => d.translit).length,
  }),
)

console.log(
  `Wrote ${OUT}: ${payload.chapters.length} chapters, ${payload.duas.length} du'as ` +
    `(${payload.duas.filter((d) => d.translit).length} with transliteration, ` +
    `${dropped} dropped for having no reference), ${(json.length / 1024).toFixed(0)} KB`,
)
