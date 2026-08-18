// Local notifications for prayer times and the two adhkar reminders.
//
// The schedule itself is a pure function so it can be tested without a
// device. Delivery needs the native shell: browsers cannot reliably fire a
// notification while the app is closed (iOS in particular), so on the web
// this reports 'unsupported' rather than pretending to work.

import { PRAYER_LABEL, PRAYER_ORDER, timesFor, type GeoLocation, type PrayerId } from './prayer'

export interface ScheduledNotification {
  id: number
  title: string
  body: string
  at: Date
  /** which part of the app the notification belongs to */
  kind: 'prayer' | 'adhkar'
}

/** Morning adhkar land after Fajr; evening adhkar before Maghrib. */
export const MORNING_ADHKAR_AFTER_FAJR_MIN = 30
export const EVENING_ADHKAR_BEFORE_MAGHRIB_MIN = 60

const PRAYER_SLOT: Record<PrayerId, number> = {
  fajr: 0,
  dhuhr: 1,
  asr: 2,
  maghrib: 3,
  isha: 4,
}

/**
 * Every notification to schedule over the next `days` days, skipping any
 * moment already past. IDs are stable per day+slot so re-scheduling
 * replaces rather than duplicates.
 */
export function buildSchedule(
  loc: GeoLocation,
  now: Date = new Date(),
  days = 7,
): ScheduledNotification[] {
  const out: ScheduledNotification[] = []

  for (let offset = 0; offset < days; offset++) {
    // Step the local CALENDAR date, not a fixed 24h of milliseconds: across a
    // daylight-saving change a fixed offset skips a day entirely (spring
    // forward) or covers one twice (fall back). Noon keeps us clear of the
    // transition itself.
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12, 0, 0, 0)
    const times = timesFor(loc, date)
    const dayId = (offset + 1) * 10

    for (const id of PRAYER_ORDER) {
      const at = times[id]
      if (Number.isNaN(at.getTime()) || at.getTime() <= now.getTime()) continue
      out.push({
        id: dayId + PRAYER_SLOT[id],
        title: `${PRAYER_LABEL[id]} — time to pray`,
        body: 'Answer the call. The most beloved deeds are the most consistent.',
        at,
        kind: 'prayer',
      })
    }

    const morning = new Date(times.fajr.getTime() + MORNING_ADHKAR_AFTER_FAJR_MIN * 60_000)
    if (!Number.isNaN(morning.getTime()) && morning.getTime() > now.getTime()) {
      out.push({
        id: dayId + 5,
        title: 'Morning adhkar',
        body: 'The Fortress — your protection for the day.',
        at: morning,
        kind: 'adhkar',
      })
    }

    const evening = new Date(times.maghrib.getTime() - EVENING_ADHKAR_BEFORE_MAGHRIB_MIN * 60_000)
    if (!Number.isNaN(evening.getTime()) && evening.getTime() > now.getTime()) {
      out.push({
        id: dayId + 6,
        title: 'Evening adhkar',
        body: 'Before Maghrib — close the day in the Fortress.',
        at: evening,
        kind: 'adhkar',
      })
    }
  }

  return out.sort((a, b) => a.at.getTime() - b.at.getTime())
}

export type ScheduleResult =
  | { status: 'scheduled'; count: number }
  /** Scheduled, but the OS refused exact alarms — delivery may drift. */
  | { status: 'inexact'; count: number }
  | { status: 'denied' }
  | { status: 'unsupported' }
  | { status: 'error'; message: string }

/** True only inside the native shell, where scheduling actually works. */
export async function isNative(): Promise<boolean> {
  try {
    const { Capacitor } = await import('@capacitor/core')
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}

export async function scheduleReminders(
  loc: GeoLocation,
  now: Date = new Date(),
): Promise<ScheduleResult> {
  if (!(await isNative())) return { status: 'unsupported' }
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const permission = await LocalNotifications.requestPermissions()
    if (permission.display !== 'granted') return { status: 'denied' }

    const before = await LocalNotifications.getPending()
    const schedule = buildSchedule(loc, now)

    // Schedule FIRST (ids are stable, so this replaces same-id alarms), then
    // clear only the leftovers. Cancelling up front would leave the user with
    // no reminders at all if scheduling then failed.
    let result: Awaited<ReturnType<typeof LocalNotifications.schedule>> | undefined
    if (schedule.length) {
      result = await LocalNotifications.schedule({
        notifications: schedule.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          schedule: { at: n.at, allowWhileIdle: true },
          extra: { kind: n.kind },
        })),
      })
    }

    const keep = new Set(schedule.map((n) => n.id))
    const stale = before.notifications.filter((n) => !keep.has(n.id))
    if (stale.length) await LocalNotifications.cancel({ notifications: stale })

    // The plugin downgrades to inexact alarms when exact-alarm permission is
    // refused; say so rather than promising times we cannot keep.
    const warning = (result as { warning?: string } | undefined)?.warning
    if (warning) return { status: 'inexact', count: schedule.length }
    return { status: 'scheduled', count: schedule.length }
  } catch (e) {
    return { status: 'error', message: e instanceof Error ? e.message : String(e) }
  }
}

export async function cancelReminders(): Promise<void> {
  if (!(await isNative())) return
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const pending = await LocalNotifications.getPending()
    if (pending.notifications.length) {
      await LocalNotifications.cancel({ notifications: pending.notifications })
    }
  } catch {
    /* nothing scheduled */
  }
}
