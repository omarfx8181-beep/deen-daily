import { describe, expect, it } from 'vitest'
import { buildReview, daysBetween } from './review'

const log = (entries: Record<number, string>) =>
  Object.fromEntries(Object.entries(entries).map(([k, v]) => [String(k), v]))

describe('daysBetween', () => {
  it('counts whole days regardless of timezone', () => {
    expect(daysBetween('2026-08-10', '2026-08-17')).toBe(7)
    expect(daysBetween('2026-08-17', '2026-08-17')).toBe(0)
    expect(daysBetween('2026-02-28', '2026-03-01')).toBe(1)
  })

  it('treats a missing or malformed date as infinitely old', () => {
    expect(daysBetween('', '2026-08-17')).toBe(Number.POSITIVE_INFINITY)
    expect(daysBetween('not-a-date', '2026-08-17')).toBe(Number.POSITIVE_INFINITY)
  })
})

describe('buildReview', () => {
  const today = '2026-08-17'

  it('is empty when nothing is memorized', () => {
    expect(buildReview([], {}, today, 1)).toEqual({
      sabaq: null,
      sabqi: [],
      manzil: [],
      undated: 0,
    })
  })

  it('makes the most recently memorized surah the sabaq', () => {
    const q = buildReview(
      [114, 113, 112],
      log({ 114: '2026-08-10', 113: '2026-08-16', 112: '2026-08-01' }),
      today,
      1,
    )
    expect(q.sabaq).toBe(113)
  })

  it('puts the last seven days in sabqi and older ones in manzil', () => {
    const q = buildReview(
      [114, 113, 112, 111],
      log({ 114: '2026-08-15', 113: '2026-08-16', 112: '2026-08-11', 111: '2026-06-01' }),
      today,
      0,
    )
    expect(q.sabaq).toBe(113)
    expect(q.sabqi.sort()).toEqual([112, 114])
    expect(q.manzil).toEqual([111])
  })

  it('counts the seven-day window inclusively', () => {
    const q = buildReview(
      [1, 2, 3],
      log({ 1: '2026-08-16', 2: '2026-08-10', 3: '2026-08-09' }),
      today,
      0,
    )
    expect(q.sabaq).toBe(1)
    expect(q.sabqi).toEqual([2]) // exactly 7 days old — still sabqi
    expect(q.manzil).toEqual([3]) // 8 days — rotates as manzil
  })

  it('rotates manzil across days so every old surah comes round', () => {
    const hifz = [1, 2, 3, 4, 5, 6, 7]
    const entries = log(Object.fromEntries(hifz.map((n) => [n, '2026-01-01'])))
    const q = buildReview(hifz, entries, today, 0, 3)
    const older = hifz.filter((n) => n !== q.sabaq) // the sabaq is reviewed as sabaq, not manzil
    const seen = new Set<number>()
    for (let day = 0; day < 10; day++) {
      for (const n of buildReview(hifz, entries, today, day, 3).manzil) seen.add(n)
    }
    expect([...seen].sort((a, b) => a - b)).toEqual(older)
  })

  it('is deterministic for a given day', () => {
    const hifz = [1, 2, 3, 4, 5]
    const entries = log(Object.fromEntries(hifz.map((n) => [n, '2026-01-01'])))
    expect(buildReview(hifz, entries, today, 42, 3).manzil).toEqual(
      buildReview(hifz, entries, today, 42, 3).manzil,
    )
  })

  it('never asks for more manzil than there are old surahs', () => {
    const q = buildReview([5, 6], log({ 5: '2026-01-01', 6: '2026-01-02' }), today, 3, 3)
    expect(q.manzil.length).toBeLessThanOrEqual(2)
    expect(new Set(q.manzil).size).toBe(q.manzil.length)
  })

  it('treats surahs tracked before dates were recorded as old, and counts them', () => {
    const q = buildReview([1, 2, 3], log({ 3: '2026-08-16' }), today, 0)
    expect(q.sabaq).toBe(3)
    expect(q.sabqi).toEqual([])
    expect(q.manzil.sort()).toEqual([1, 2])
    expect(q.undated).toBe(2)
  })

  it('ignores duplicates and out-of-range surah numbers', () => {
    const q = buildReview([1, 1, 0, 115, -3], log({ 1: '2026-08-16' }), today, 0)
    expect(q.sabaq).toBe(1)
    expect(q.manzil).toEqual([])
    expect(q.undated).toBe(0)
  })

  it('handles a full 114-surah tracker', () => {
    const hifz = Array.from({ length: 114 }, (_, i) => i + 1)
    const entries = log(Object.fromEntries(hifz.map((n) => [n, '2026-01-01'])))
    const q = buildReview(hifz, entries, today, 5, 3)
    expect(q.sabaq).toBe(1)
    expect(q.manzil).toHaveLength(3)
  })
})
