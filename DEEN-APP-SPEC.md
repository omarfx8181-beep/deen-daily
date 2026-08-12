# Deen Daily — Build Spec for Claude Code

A daily Islamic education + practice platform. The included `deen-daily-v2.html` is the **working reference prototype** — treat it as the source of truth for features, content, data, tone, and design language (night/lapis/brass, Marcellus + Amiri + Inter, mihrab-arch signature card). This spec covers what the native build adds beyond the prototype.

## Stack

Pick one:
- **Option A (preferred): SwiftUI + SwiftData**, iOS 17+. Local-first, no accounts, no backend. Matches existing Swift pipeline.
- **Option B: React + Capacitor** (same pipeline as Ludo Soomaali v2) if cross-platform later matters.

Principles: local-first, offline-capable, zero login, all personal data on-device. Privacy is a feature.

## Core modules (all exist in the prototype — port 1:1)

1. **Today** — hijri + gregorian date, streak ring, daily hadith lesson (Nawawi 42 rotation, with source gradings), motivational hadith of the day (24-item graded set), Name of Allah of the day (99 set), 10-item practice checklist, adhkar fortress (8 items with Arabic, meaning, counts, sources).
2. **Quran** — page tracker (604-page Madani model, juz auto-computed), khatmah calculator, bookmarks (surah → page + note), hifz tracker (114 surahs toggle), full memorization method guide (sabaq/sabqi/manzil system, 10+10 technique, starting order).
3. **Learn** — 6-layer roadmap, browsable Nawawi 42, browsable motivation collection, 99 Names grid.
4. **Journal** — daily: 3 gratitude + rotating muhasabah prompt (14 prompts) + free write; persistent personal du'a list; past-entries history.

All content data (SURAHS with start pages, HADITH, SOURCES, NAMES, MOTIV, PROMPTS, ADHKAR, TASKS) lives as arrays in the prototype — extract into JSON/Swift constants directly. **Do not paraphrase religious texts when porting; copy verbatim.**

## Native-only additions (the reason to go native)

### P0
- **Prayer times + notifications.** AlAdhan API (`api.aladhan.com/v1/timings?latitude=..&longitude=..&method=2` — ISNA method for North America) with offline caching of the month. Local notifications at each prayer; checklist rows show today's times. Location: single stored lat/long (Twin Cities default), user-editable — no live location tracking needed.
- **Adhkar reminders.** Two scheduled local notifications (post-Fajr, pre-Maghrib) deep-linking to the Fortress.
- **SwiftData persistence** replacing window.storage. Entities: `DayLog(date, checks, journal)`, `QuranState(page, bookmarks, hifzSurahs)`, `DuaItem`, `Streak`. iCloud sync via CloudKit if trivial; otherwise local only.

### P1
- **Quran text + audio in-app.** Quran.com API v4 (`api.quran.com/api/v4`) for Arabic text (Uthmani script) + Sahih International translation per page/surah. Audio: EveryAyah per-ayah mp3 (Husary or Minshawi Mu'allim for hifz mode) with **ayah-loop repeat** (the 10+10 method as a feature: loop ayah N times, then hide text and prompt recall).
- **Hifz review queue.** Auto-generate the daily 3-track list from the hifz tracker: sabaq (current focus surah), sabqi (last 7 days additions), manzil (rotating cycle through old). One screen: "Today's review."
- **Home screen widget** — streak + today's hadith title + next prayer time.
- **Khatmah goal mode** — "finish by [date]" (e.g., before next Ramadan) → computes required pages/day, adjusts as you fall behind/ahead.

### P2
- Journal export (PDF/markdown), Somali translation toggle for hadith lessons, Apple Watch complication (next prayer + streak), share card for the daily hadith (image render, no user data).

## Design system (from prototype)
- Colors: night `#0C1220`, panel `#141D30`, lapis `#4A79C4`, brass `#C9A227`, moon `#EAE6DA`, slate `#8B94A7`, emerald `#3A9B72`.
- Type: Marcellus (display), Amiri (Arabic/quotes), Inter (UI). Signature: the mihrab-arch card for the daily lesson. Dark only for v1.
- Motion minimal; respect Reduce Motion.

## Content integrity rules (non-negotiable)
- Every hadith displays its source + grading. Never add a hadith without one.
- The contested-chain note on Nawawi #41 stays.
- Footer note stays: condensed renderings, verify at sunnah.com, ask scholars for rulings.
- Quran text via API must be an authenticated source (Quran.com uses the King Fahd Complex text) — never AI-generated Arabic.

## Non-goals (v1)
No accounts, no social features, no qibla/compass, no ads ever, no analytics beyond crash reports, no AI-generated religious content at runtime.

## Definition of done (MVP)
Today + Quran + Journal fully functional offline with persistence; prayer-time notifications firing; streak survives app restarts; all prototype content ported verbatim with sources intact.
