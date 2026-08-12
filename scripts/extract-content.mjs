#!/usr/bin/env node
/**
 * Generates src/data/content.js by extracting the content arrays from the
 * reference prototype deen-daily-v2.html BYTE-FOR-BYTE.
 *
 * Religious text must never be retyped, paraphrased, or reformatted — this
 * script is the only permitted way to (re)create src/data/content.js.
 * Verification: scripts/verify-content.mjs (npm run verify:content).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const HTML_PATH = join(root, 'deen-daily-v2.html')
const OUT_PATH = join(root, 'src', 'data', 'content.js')

export const ARRAY_NAMES = [
  'HADITH',
  'SOURCES',
  'NAMES',
  'SURAHS',
  'MOTIV',
  'PROMPTS',
  'ADHKAR',
  'TASKS',
]

/**
 * Extract the exact source text of `<prefix>NAME=[...]`'s array literal.
 * String-aware bracket matcher: only double-quoted strings occur in the data
 * (verified — no escapes present, but `\` is still handled defensively).
 * Returns the literal INCLUDING the outer brackets, byte-identical.
 */
export function extractLiteral(source, name, prefix) {
  const decl = `${prefix}${name}=`
  const re = new RegExp(`^${decl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gm')
  const matches = [...source.matchAll(re)]
  if (matches.length !== 1) {
    throw new Error(`${name}: expected exactly 1 \`${decl}\` at line start, found ${matches.length}`)
  }
  const start = matches[0].index + decl.length
  if (source[start] !== '[') {
    throw new Error(`${name}: expected \`[\` immediately after \`${decl}\``)
  }
  let depth = 0
  let inString = false
  for (let i = start; i < source.length; i++) {
    const ch = source[i]
    if (inString) {
      if (ch === '\\') i++
      else if (ch === '"') inString = false
    } else if (ch === '"') {
      inString = true
    } else if (ch === '[') {
      depth++
    } else if (ch === ']') {
      depth--
      if (depth === 0) {
        if (source[i + 1] !== ';') {
          throw new Error(`${name}: expected \`;\` after closing bracket`)
        }
        return source.slice(start, i + 1)
      }
    }
  }
  throw new Error(`${name}: unterminated array literal`)
}

function main() {
  const html = readFileSync(HTML_PATH, 'utf8')
  const parts = [
    '/* eslint-disable */',
    '//',
    '// GENERATED FILE — DO NOT EDIT, FORMAT, OR RETYPE.',
    '// Every array literal below is extracted BYTE-FOR-BYTE from',
    '// deen-daily-v2.html (the reference prototype) by scripts/extract-content.mjs.',
    '// Religious texts must never be regenerated or paraphrased.',
    '// Regenerate with: npm run extract:content',
    '// Verify with:     npm run verify:content',
    '',
  ]
  for (const name of ARRAY_NAMES) {
    const literal = extractLiteral(html, name, 'const ')
    parts.push(`export const ${name}=${literal};`)
  }
  mkdirSync(dirname(OUT_PATH), { recursive: true })
  writeFileSync(OUT_PATH, parts.join('\n') + '\n')
  console.log(`Wrote ${OUT_PATH} (${ARRAY_NAMES.length} arrays, verbatim).`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
