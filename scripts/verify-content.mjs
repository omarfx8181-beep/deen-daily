#!/usr/bin/env node
/**
 * Content integrity gate (npm run verify:content).
 *
 * Proves that every content array in src/data/content.js is IDENTICAL to its
 * counterpart in deen-daily-v2.html, three independent ways:
 *
 *   1. Character-by-character comparison of the raw array literals
 *      (re-extracted from both files with the string-aware bracket matcher).
 *   2. Semantic comparison through two UNRELATED parsers: JSON.parse on the
 *      HTML literal vs `import()` of content.js through Node's real JS parser
 *      — so a bug in the shared extractor cannot green-light both sides.
 *   3. Expected counts and ordering invariants (42 hadith numbered 1..42,
 *      SOURCES aligned 1:1, 99 names, 114 surahs numbered in order, 24
 *      motivations, 14 prompts, 8 adhkar, 10 tasks).
 *
 * Exits non-zero on ANY difference. Zero diffs required.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ARRAY_NAMES, extractLiteral } from './extract-content.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const HTML_PATH = join(root, 'deen-daily-v2.html')
const DATA_PATH = join(root, 'src', 'data', 'content.js')

const EXPECTED_COUNTS = {
  HADITH: 42,
  SOURCES: 42,
  NAMES: 99,
  SURAHS: 114,
  MOTIV: 24,
  PROMPTS: 14,
  ADHKAR: 8,
  TASKS: 10,
}

const cp = (s, i) => {
  const c = s.codePointAt(i)
  return c === undefined ? 'EOF' : `U+${c.toString(16).toUpperCase().padStart(4, '0')} ${JSON.stringify(String.fromCodePoint(c))}`
}

function charDiff(name, a, b) {
  if (a === b) return null
  const n = Math.min(a.length, b.length)
  let i = 0
  while (i < n && a[i] === b[i]) i++
  const ctx = (s) => JSON.stringify(s.slice(Math.max(0, i - 40), i + 40))
  return [
    `${name}: literals differ at index ${i} (html len ${a.length}, module len ${b.length})`,
    `  html:   ${cp(a, i)}  …${ctx(a)}…`,
    `  module: ${cp(b, i)}  …${ctx(b)}…`,
  ].join('\n')
}

const html = readFileSync(HTML_PATH, 'utf8')
const dataSrc = readFileSync(DATA_PATH, 'utf8')
const mod = await import(DATA_PATH)

let failures = 0
const fail = (msg) => {
  failures++
  console.error(`✗ ${msg}`)
}

for (const name of ARRAY_NAMES) {
  let htmlLit, modLit
  try {
    htmlLit = extractLiteral(html, name, 'const ')
    modLit = extractLiteral(dataSrc, name, 'export const ')
  } catch (e) {
    fail(String(e.message ?? e))
    continue
  }

  // Layer 1 — character-by-character.
  const diff = charDiff(name, htmlLit, modLit)
  if (diff) {
    fail(diff)
    continue
  }

  // Layer 2 — independent parsers: JSON.parse(html literal) vs imported values.
  let parsed
  try {
    parsed = JSON.parse(htmlLit)
  } catch (e) {
    fail(`${name}: HTML literal is not valid JSON (extraction incomplete?): ${e.message}`)
    continue
  }
  if (JSON.stringify(mod[name]) !== JSON.stringify(parsed)) {
    fail(`${name}: imported module values differ semantically from HTML values`)
    continue
  }

  // Layer 3 — counts.
  if (parsed.length !== EXPECTED_COUNTS[name]) {
    fail(`${name}: expected ${EXPECTED_COUNTS[name]} entries, found ${parsed.length}`)
    continue
  }

  console.log(`✓ ${name}: ${parsed.length} entries, ${htmlLit.length} chars, byte-identical + JSON-equal`)
}

// Ordering invariants.
if (!failures) {
  if (!mod.HADITH.every((h, i) => h[0] === i + 1)) fail('HADITH: numbers are not 1..42 in order')
  if (!mod.SURAHS.every((s, i) => s[0] === i + 1)) fail('SURAHS: numbers are not 1..114 in order')
  if (mod.SOURCES.length !== mod.HADITH.length) fail('SOURCES: not aligned 1:1 with HADITH')
}

if (failures) {
  console.error(`\n${failures} failure(s). Content does NOT match the prototype.`)
  process.exit(1)
}
console.log('\nAll 8 arrays verified: zero diffs against deen-daily-v2.html.')
