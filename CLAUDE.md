# CLAUDE.md — Deen Daily project rules

Deen Daily is a daily Islamic education + practice app. `deen-daily-v2.html` is the
**working reference prototype** and the source of truth for all features, content,
data, tone, and design. `DEEN-APP-SPEC.md` covers what the native build adds.

## Content integrity rules (non-negotiable)

Copied verbatim from `DEEN-APP-SPEC.md` — these are permanent project rules:

- Every hadith displays its source + grading. Never add a hadith without one.
- The contested-chain note on Nawawi #41 stays.
- Footer note stays: condensed renderings, verify at sunnah.com, ask scholars for rulings.
- Quran text via API must be an authenticated source (Quran.com uses the King Fahd Complex text) — never AI-generated Arabic.

## Religious text handling

- **Never regenerate, paraphrase, retype, or "fix" any religious text** — Quran,
  hadith, adhkar, du'as, and the Names of Allah are copied verbatim from
  `deen-daily-v2.html`. This applies to Arabic and to the English renderings alike.
- `src/data/content.js` is a **generated artifact**: it is only ever produced by
  `npm run extract:content` (`scripts/extract-content.mjs`), never edited by hand,
  never reformatted, never touched by a formatter or linter.
- `npm run verify:content` must pass (zero diffs, exit 0) before any commit that
  touches `src/data/`.
- Typographic quotes around quoted hadith text are added at render time (as the
  prototype does) — never baked into the data.

## Build lane

- **React + Capacitor (Option B)** — locked. Vite + React + TypeScript for the web
  app now; Capacitor wrapping comes in a later phase. Local-first, offline-capable,
  zero login, all personal data on-device. No accounts, no social, no ads ever, no
  analytics beyond crash reports, no AI-generated religious content at runtime.

## Working style

- All work in **small commits**, each one scoped to a single concern, with clear
  descriptive messages.
- Match the prototype's design system exactly (night/lapis/brass palette,
  Marcellus + Amiri + Inter, mihrab-arch signature card, dark-only for v1,
  respect Reduce Motion).
- Persistence keys and JSON shapes follow the prototype (`deen2:d:<YYYY-MM-DD>`,
  `deen2:main`) so storage backends can be swapped without migrations.

## Commands

- `npm run dev` — dev server
- `npm run build` — type-check + production build
- `npm test` — unit tests (Vitest)
- `npm run extract:content` — regenerate `src/data/content.js` from the prototype
- `npm run verify:content` — character-by-character content integrity check
