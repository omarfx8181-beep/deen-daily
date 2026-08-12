# Deen Daily

A daily Islamic education and practice app — local-first, offline-capable, no
accounts, no ads, all personal data on-device.

Deen Daily turns daily practice into a quiet, consistent routine:

- **Today** — hijri + gregorian date, a streak ring, the daily hadith lesson
  (Nawawi's Forty rotation with source gradings), a motivational hadith of the
  day, the Name of Allah of the day, a 10-item practice checklist, and the
  adhkar fortress (morning/evening protection with Arabic, meaning, counts,
  and sources).
- **Quran** — page tracker (604-page Madani mushaf, juz auto-computed), khatmah
  calculator, bookmarks, hifz tracker for all 114 surahs, and a full
  memorization method guide (sabaq/sabqi/manzil, the 10+10 technique).
- **Learn** — a 6-layer roadmap, browsable Nawawi 42, the motivation
  collection, and the 99 Names grid.
- **Journal** — daily gratitude (shukr), a rotating muhasabah reflection
  prompt, free writing, a persistent personal du'a list, and past-entry
  history.

## Source of truth

[`deen-daily-v2.html`](deen-daily-v2.html) is the complete working reference
prototype. It defines every feature, all content, the tone, and the design
language (night/lapis/brass palette, Marcellus + Amiri + Inter, the
mihrab-arch signature card). [`DEEN-APP-SPEC.md`](DEEN-APP-SPEC.md) specifies
what the native build adds beyond it (prayer times + notifications, in-app
Quran text and audio, hifz review queue, widgets).

All religious content — hadith, adhkar, du'as, the Names of Allah — is copied
**verbatim** from the prototype into `src/data/content.js` by a mechanical
extraction script, and `npm run verify:content` proves character-by-character
equality against the prototype. Nothing religious is ever regenerated,
paraphrased, or AI-generated. Every hadith carries its source and grading.
See [`CLAUDE.md`](CLAUDE.md) for the non-negotiable content integrity rules.

## Stack

- **React + TypeScript + Vite** (web app, this phase)
- **Capacitor** (native iOS/Android wrap, later phase)
- Persistence: `localStorage` now, swappable for Capacitor Preferences later
  (same keys, same JSON shapes)
- Tests: Vitest

## Getting started

```sh
npm install
npm run dev             # dev server
npm test                # unit tests
npm run build           # type-check + production build
npm run verify:content  # character-by-character content integrity check
npm run extract:content # regenerate src/data/content.js from the prototype
```

## Roadmap

- [x] **Phase 1** — React scaffold, all content arrays extracted verbatim with
  a verification gate, Today tab (lesson, motivation, name of the day,
  checklist, adhkar fortress) with persistence and streak logic.
- [ ] **Phase 2** — Quran tab: page tracker, khatmah calculator, bookmarks,
  hifz tracker, memorization guide.
- [ ] **Phase 3** — Learn + Journal tabs.
- [ ] **Phase 4** — Capacitor wrap; prayer times (AlAdhan API) with local
  notifications; adhkar reminders.
- [ ] **Later** — in-app Quran text/audio (Quran.com API v4 + EveryAyah),
  hifz review queue, home-screen widget, khatmah goal mode.

## Principles

Local-first. Offline-capable. Zero login. Privacy is a feature. No accounts,
no social features, no ads ever, no analytics beyond crash reports, and no
AI-generated religious content at runtime.
