// Prayer times computed ON DEVICE with the adhan library (high-precision
// astronomical calculation), using the ISNA / North America method the spec
// specifies. No API call, no network, nothing about your location ever
// leaves the phone — and times work with no signal at all.

import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan'

export interface GeoLocation {
  lat: number
  lng: number
  label: string
}

/** Twin Cities default, per the spec; user-editable. */
export const DEFAULT_LOCATION: GeoLocation = {
  lat: 44.9778,
  lng: -93.265,
  label: 'Minneapolis, MN',
}

export type PrayerId = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
export const PRAYER_ORDER: PrayerId[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

export interface DayTimes extends Record<PrayerId, Date> {
  sunrise: Date
}

export function timesFor(loc: GeoLocation, date: Date = new Date()): DayTimes {
  const t = new PrayerTimes(
    new Coordinates(loc.lat, loc.lng),
    date,
    CalculationMethod.NorthAmerica(),
  )
  return {
    fajr: t.fajr,
    sunrise: t.sunrise,
    dhuhr: t.dhuhr,
    asr: t.asr,
    maghrib: t.maghrib,
    isha: t.isha,
  }
}

/**
 * The next prayer from `now`, rolling over to tomorrow's Fajr after Isha.
 *
 * Scans yesterday, today and tomorrow rather than only "today", because the
 * underlying library derives the day from the device's calendar date: when
 * the device's timezone differs from the stored location's (travel, or a
 * device set to UTC), a single-day window silently skips or repeats a prayer.
 */
export function nextPrayer(
  loc: GeoLocation,
  now: Date = new Date(),
): { id: PrayerId; time: Date; tomorrow: boolean } {
  const candidates: { id: PrayerId; time: Date }[] = []
  for (const offset of [-1, 0, 1]) {
    const day = timesFor(loc, new Date(now.getTime() + offset * 86_400_000))
    for (const id of PRAYER_ORDER) candidates.push({ id, time: day[id] })
  }
  candidates.sort((a, b) => a.time.getTime() - b.time.getTime())
  const next = candidates.find((c) => c.time.getTime() > now.getTime()) ?? candidates[0]
  return {
    ...next,
    tomorrow: next.time.toDateString() !== now.toDateString(),
  }
}

export const formatTime = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

/** "2h 14m" / "43m" / "now" — how long until `time`. */
export function untilLabel(time: Date, now: Date = new Date()): string {
  const ms = time.getTime() - now.getTime()
  if (ms <= 0) return 'now'
  const mins = Math.floor(ms / 60_000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export const PRAYER_LABEL: Record<PrayerId, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}
