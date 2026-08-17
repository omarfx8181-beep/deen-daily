import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOCATION,
  PRAYER_ORDER,
  formatTime,
  nextPrayer,
  timesFor,
  untilLabel,
} from './prayer'

const fmt = (d: Date) =>
  d.toLocaleTimeString('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: '2-digit',
  })

describe('prayer times (ISNA / North America, computed on device)', () => {
  it('produces the expected times for the default location', () => {
    // Minneapolis, 17 Aug 2026 — sunset ~8:16pm CDT, a good sanity anchor.
    const t = timesFor(DEFAULT_LOCATION, new Date('2026-08-17T12:00:00Z'))
    expect(fmt(t.fajr)).toBe('4:46 AM')
    expect(fmt(t.sunrise)).toBe('6:17 AM')
    expect(fmt(t.dhuhr)).toBe('1:18 PM')
    expect(fmt(t.asr)).toBe('5:08 PM')
    expect(fmt(t.maghrib)).toBe('8:16 PM')
    expect(fmt(t.isha)).toBe('9:47 PM')
  })

  it('keeps prayers in order across the year and across latitudes', () => {
    const places = [DEFAULT_LOCATION, { lat: 21.4225, lng: 39.8262, label: 'Makkah' }]
    for (const loc of places) {
      for (const iso of ['2026-01-15', '2026-03-21', '2026-06-21', '2026-12-21']) {
        const t = timesFor(loc, new Date(`${iso}T12:00:00Z`))
        const seq = [t.fajr, t.sunrise, t.dhuhr, t.asr, t.maghrib, t.isha].map((d) => d.getTime())
        const sorted = [...seq].sort((a, b) => a - b)
        expect(seq, `${loc.label} ${iso}`).toEqual(sorted)
      }
    }
  })

  it('every prayer id resolves to a valid date', () => {
    const t = timesFor(DEFAULT_LOCATION, new Date('2026-08-17T12:00:00Z'))
    for (const id of PRAYER_ORDER) expect(Number.isNaN(t[id].getTime())).toBe(false)
  })
})

describe('nextPrayer', () => {
  const day = (hhmm: string) => new Date(`2026-08-17T${hhmm}:00-05:00`)

  it('is Fajr before dawn', () => {
    const n = nextPrayer(DEFAULT_LOCATION, day('03:00'))
    expect(n.id).toBe('fajr')
    expect(n.tomorrow).toBe(false)
  })

  it('advances through the day', () => {
    expect(nextPrayer(DEFAULT_LOCATION, day('05:00')).id).toBe('dhuhr')
    expect(nextPrayer(DEFAULT_LOCATION, day('14:00')).id).toBe('asr')
    expect(nextPrayer(DEFAULT_LOCATION, day('18:00')).id).toBe('maghrib')
    expect(nextPrayer(DEFAULT_LOCATION, day('20:30')).id).toBe('isha')
  })

  it('rolls over to tomorrow after Isha', () => {
    const n = nextPrayer(DEFAULT_LOCATION, day('23:30'))
    expect(n.id).toBe('fajr')
    expect(n.tomorrow).toBe(true)
    expect(n.time.getTime()).toBeGreaterThan(day('23:30').getTime())
  })
})

describe('formatting helpers', () => {
  it('formats a countdown', () => {
    const now = new Date('2026-08-17T10:00:00Z')
    expect(untilLabel(new Date('2026-08-17T12:14:00Z'), now)).toBe('2h 14m')
    expect(untilLabel(new Date('2026-08-17T10:43:00Z'), now)).toBe('43m')
    expect(untilLabel(new Date('2026-08-17T09:00:00Z'), now)).toBe('now')
  })

  it('formats a clock time', () => {
    expect(formatTime(new Date('2026-08-17T17:05:00Z'))).toMatch(/^\d{1,2}:\d{2}\s?(AM|PM)$/)
  })
})
