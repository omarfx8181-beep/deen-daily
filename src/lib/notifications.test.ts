import { describe, expect, it } from 'vitest'
import {
  EVENING_ADHKAR_BEFORE_MAGHRIB_MIN,
  MORNING_ADHKAR_AFTER_FAJR_MIN,
  buildSchedule,
  scheduleReminders,
} from './notifications'
import { DEFAULT_LOCATION, timesFor } from './prayer'

const NOW = new Date('2026-08-17T09:00:00Z') // 4:00am in the default location

describe('buildSchedule', () => {
  it('covers seven prayers-plus-adhkar entries per full day', () => {
    const s = buildSchedule(DEFAULT_LOCATION, NOW, 3)
    // day 0 starts before Fajr, so all 7 fire; days 1 and 2 are complete too
    expect(s.filter((n) => n.kind === 'prayer')).toHaveLength(15)
    expect(s.filter((n) => n.kind === 'adhkar')).toHaveLength(6)
  })

  it('never schedules a moment that has already passed', () => {
    const afternoon = new Date('2026-08-17T20:00:00Z')
    const s = buildSchedule(DEFAULT_LOCATION, afternoon, 1)
    expect(s.every((n) => n.at.getTime() > afternoon.getTime())).toBe(true)
    expect(s.map((n) => n.title)).not.toContain('Fajr — time to pray')
  })

  it('is ordered by time', () => {
    const s = buildSchedule(DEFAULT_LOCATION, NOW, 4)
    const times = s.map((n) => n.at.getTime())
    expect(times).toEqual([...times].sort((a, b) => a - b))
  })

  it('gives every notification a unique, stable id', () => {
    const a = buildSchedule(DEFAULT_LOCATION, NOW, 7)
    const b = buildSchedule(DEFAULT_LOCATION, NOW, 7)
    expect(new Set(a.map((n) => n.id)).size).toBe(a.length)
    expect(a.map((n) => n.id)).toEqual(b.map((n) => n.id))
  })

  it('places the adhkar reminders around Fajr and Maghrib as the spec says', () => {
    const s = buildSchedule(DEFAULT_LOCATION, NOW, 1)
    const times = timesFor(DEFAULT_LOCATION, NOW)
    const morning = s.find((n) => n.title === 'Morning adhkar')!
    const evening = s.find((n) => n.title === 'Evening adhkar')!
    expect(morning.at.getTime() - times.fajr.getTime()).toBe(MORNING_ADHKAR_AFTER_FAJR_MIN * 60_000)
    expect(times.maghrib.getTime() - evening.at.getTime()).toBe(
      EVENING_ADHKAR_BEFORE_MAGHRIB_MIN * 60_000,
    )
  })

  it('produces nothing invalid at extreme latitudes', () => {
    const s = buildSchedule({ lat: 69.6492, lng: 18.9553, label: 'Tromsø' }, NOW, 3)
    expect(s.every((n) => !Number.isNaN(n.at.getTime()))).toBe(true)
    expect(s.length).toBeGreaterThan(0)
  })

  it('carries a title and body for every entry', () => {
    for (const n of buildSchedule(DEFAULT_LOCATION, NOW, 2)) {
      expect(n.title.length).toBeGreaterThan(0)
      expect(n.body.length).toBeGreaterThan(0)
    }
  })
})

describe('scheduleReminders on the web', () => {
  it('reports unsupported instead of pretending to schedule', async () => {
    // jsdom is not the native shell, so this exercises the real web path.
    await expect(scheduleReminders(DEFAULT_LOCATION, NOW)).resolves.toEqual({
      status: 'unsupported',
    })
  })
})

describe('daylight saving transitions', () => {
  // The suite runs in America/Chicago (vite.config.ts), so these are real
  // transitions: 2027-03-14 springs forward, 2026-11-01 falls back.
  const days = (from: string) =>
    [...new Set(
      buildSchedule(DEFAULT_LOCATION, new Date(from), 7).map((n) =>
        n.at.toLocaleDateString('en-CA'),
      ),
    )].sort()

  it('covers the day the clocks go forward instead of skipping it', () => {
    expect(days('2027-03-13T23:30:00-06:00')).toContain('2027-03-14')
  })

  it('never schedules two reminders at the same instant when clocks go back', () => {
    const s = buildSchedule(DEFAULT_LOCATION, new Date('2026-11-01T00:30:00-05:00'), 7)
    const stamps = s.map((n) => n.at.getTime())
    expect(new Set(stamps).size).toBe(stamps.length)
    expect(s.filter((n) => n.at.toLocaleDateString('en-CA') === '2026-11-01').length).toBeLessThanOrEqual(7)
  })

  it('covers consecutive days with no gap across a transition', () => {
    for (const start of [
      '2026-08-17T09:00:00Z',
      '2027-03-13T23:30:00-06:00',
      '2026-11-01T00:30:00-05:00',
    ]) {
      const covered = days(start)
      for (let i = 1; i < covered.length; i++) {
        const prev = new Date(`${covered[i - 1]}T12:00:00Z`).getTime()
        const cur = new Date(`${covered[i]}T12:00:00Z`).getTime()
        expect(Math.round((cur - prev) / 86_400_000), `gap after ${covered[i - 1]} (from ${start})`).toBe(1)
      }
      expect(covered.length, `from ${start}`).toBeGreaterThanOrEqual(6)
    }
  })
})
