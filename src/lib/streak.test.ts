import { afterEach, describe, expect, it, vi } from 'vitest'
import { updateStreak, type Streak } from './streak'
import { todayKey, yesterdayKey, dayOfYear } from './dates'
import { loadMain, saveMain, sList, DAY_PREFIX, sSet, defaultMain } from './storage'

const TODAY = '2026-08-12'
const YESTERDAY = '2026-08-11'
const TOTAL = 10

const run = (streak: Streak, done: number) => updateStreak(streak, done, TOTAL, TODAY, YESTERDAY)

describe('updateStreak (prototype parity)', () => {
  it('first-ever completion starts the streak at 1', () => {
    const r = run({ count: 0, last: null }, TOTAL)
    expect(r).toEqual({ streak: { count: 1, last: TODAY }, changed: true })
  })

  it('completion the day after the last completed day increments', () => {
    const r = run({ count: 3, last: YESTERDAY }, TOTAL)
    expect(r.streak).toEqual({ count: 4, last: TODAY })
  })

  it('completion after a gap resets to 1', () => {
    const r = run({ count: 7, last: '2026-08-01' }, TOTAL)
    expect(r.streak).toEqual({ count: 1, last: TODAY })
  })

  it('is idempotent when today is already counted', () => {
    const r = run({ count: 4, last: TODAY }, TOTAL)
    expect(r.changed).toBe(false)
    expect(r.streak).toEqual({ count: 4, last: TODAY })
  })

  it('un-checking after completion decrements and rolls last back to yesterday', () => {
    const r = run({ count: 4, last: TODAY }, TOTAL - 1)
    expect(r.streak).toEqual({ count: 3, last: YESTERDAY })
  })

  it('decrementing a 1-day streak clears last to null', () => {
    const r = run({ count: 1, last: TODAY }, TOTAL - 1)
    expect(r.streak).toEqual({ count: 0, last: null })
  })

  it('incomplete day with no completion recorded today changes nothing', () => {
    const r = run({ count: 5, last: YESTERDAY }, 3)
    expect(r.changed).toBe(false)
    expect(r.streak).toEqual({ count: 5, last: YESTERDAY })
  })
})

describe('date keys (prototype parity)', () => {
  afterEach(() => vi.useRealTimers())

  it('todayKey formats as YYYY-MM-DD with zero padding', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 5, 12, 0, 0))
    expect(todayKey()).toBe('2026-01-05')
  })

  it('yesterdayKey crosses month boundaries', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 1, 12, 0, 0))
    expect(yesterdayKey()).toBe('2026-02-28')
  })

  it('dayOfYear matches the prototype formula', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0))
    expect(dayOfYear()).toBe(1)
    vi.setSystemTime(new Date(2026, 11, 31, 12, 0, 0))
    expect(dayOfYear()).toBe(365)
  })
})

describe('storage', () => {
  afterEach(() => localStorage.clear())

  it('roundtrips main state and merges defaults over partial data', async () => {
    const main = defaultMain()
    main.streak = { count: 9, last: '2026-08-12' }
    await saveMain(main)
    expect(await loadMain()).toEqual(main)

    // Partial stored shape (e.g. from an older version) keeps defaults intact.
    await sSet('deen2:main', { streak: { count: 2, last: '2026-08-10' } })
    const merged = await loadMain()
    expect(merged.streak).toEqual({ count: 2, last: '2026-08-10' })
    expect(merged.quran).toEqual({ page: 1, bookmarks: [] })
    expect(merged.hifz).toEqual([])
    expect(merged.duas).toEqual([])
  })

  it('lists day keys by prefix', async () => {
    await sSet(DAY_PREFIX + '2026-08-10', { c: {}, j: null })
    await sSet(DAY_PREFIX + '2026-08-11', { c: {}, j: null })
    await sSet('other:key', 1)
    const keys = await sList(DAY_PREFIX)
    expect(keys.sort()).toEqual([DAY_PREFIX + '2026-08-10', DAY_PREFIX + '2026-08-11'])
  })
})
