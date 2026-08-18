// The 3-track daily review the prototype's memorization guide describes:
//
//   sabaq  — today's fresh portion (the most recently memorized surah)
//   sabqi  — everything from the last 7 days, recited once daily
//   manzil — a rotating cycle through everything older
//
// Built from the hifz tracker, so the guide's system becomes an actual
// daily list instead of something to remember on your own.

export interface ReviewQueue {
  sabaq: number | null
  sabqi: number[]
  manzil: number[]
  /** surahs with no recorded date — they rotate through manzil */
  undated: number
}

const MS_PER_DAY = 86_400_000
/** Parsed as UTC so a timezone shift can never move a day boundary. */
const asUtc = (dateKey: string) => Date.parse(`${dateKey}T00:00:00Z`)

export function daysBetween(from: string, to: string): number {
  const a = asUtc(from)
  const b = asUtc(to)
  if (Number.isNaN(a) || Number.isNaN(b)) return Number.POSITIVE_INFINITY
  return Math.round((b - a) / MS_PER_DAY)
}

export function buildReview(
  hifz: number[],
  log: Record<string, string>,
  today: string,
  dayIndex: number,
  manzilPerDay = 3,
): ReviewQueue {
  const memorized = [...new Set(hifz)].filter((n) => Number.isInteger(n) && n >= 1 && n <= 114)
  if (memorized.length === 0) return { sabaq: null, sabqi: [], manzil: [], undated: 0 }

  // Newest first; entries with no date sort last and never become sabaq.
  // A date that cannot be parsed is treated as no date at all — consistent
  // with daysBetween, and it stops a corrupt entry becoming today's sabaq
  // through an inconsistent (NaN) sort comparison.
  const dated = memorized
    .filter((n) => !Number.isNaN(asUtc(log[String(n)] ?? '')))
    .sort((a, b) => asUtc(log[String(b)]) - asUtc(log[String(a)]) || a - b)

  const sabaq = dated[0] ?? null
  const sabqi = dated.filter((n) => n !== sabaq && daysBetween(log[String(n)], today) <= 7)

  const recent = new Set<number>([...(sabaq ? [sabaq] : []), ...sabqi])
  const older = memorized.filter((n) => !recent.has(n)).sort((a, b) => a - b)

  // Deterministic rotation: the cycle advances one window per day, so every
  // old surah comes round again rather than the same few repeating.
  let manzil: number[] = []
  if (older.length > 0) {
    const take = Math.min(manzilPerDay, older.length)
    const start = ((dayIndex * take) % older.length + older.length) % older.length
    manzil = Array.from({ length: take }, (_, i) => older[(start + i) % older.length])
  }

  return {
    sabaq,
    sabqi,
    manzil,
    undated: memorized.filter((n) => Number.isNaN(asUtc(log[String(n)] ?? ''))).length,
  }
}
