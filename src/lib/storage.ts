// Persistence layer. localStorage for now, behind the same async contract and
// the same keys/JSON shapes as the prototype's window.storage — so a later
// swap to Capacitor Preferences is a drop-in with no data migration.

import type { Streak } from './streak'
import { DEFAULT_LOCATION, type GeoLocation } from './prayer'

export const DAY_PREFIX = 'deen2:d:'
export const MAIN_KEY = 'deen2:main'

export interface Journal {
  g: string[]
  r: string
  f: string
}

export interface DayLog {
  c: Record<string, boolean>
  j: Journal | null
}

export interface Bookmark {
  s: string
  p: number
  n: string
  d: string
}

export interface MainState {
  streak: Streak
  quran: { page: number; bookmarks: Bookmark[] }
  hifz: number[]
  /** surah number -> date it was marked memorized (drives the review queue) */
  hifzLog: Record<string, string>
  duas: string[]
  /** Stored on-device only; used to compute prayer times locally. */
  location: GeoLocation
  /** Whether the user asked for prayer/adhkar reminders (native builds). */
  reminders: boolean
}

export async function sGet<T>(key: string): Promise<T | null> {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export async function sSet(key: string, value: unknown): Promise<void> {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('storage', e)
  }
}

export async function sList(prefix: string): Promise<string[]> {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(prefix)) keys.push(k)
  }
  return keys
}

export const defaultDay = (): DayLog => ({ c: {}, j: null })

export const defaultMain = (): MainState => ({
  streak: { count: 0, last: null },
  quran: { page: 1, bookmarks: [] },
  hifz: [],
  hifzLog: {},
  duas: [],
  location: { ...DEFAULT_LOCATION },
  reminders: false,
})

export async function loadDay(dateKey: string): Promise<DayLog> {
  return (await sGet<DayLog>(DAY_PREFIX + dateKey)) ?? defaultDay()
}

export async function saveDay(dateKey: string, day: DayLog): Promise<void> {
  await sSet(DAY_PREFIX + dateKey, day)
}

// Merges stored state over defaults exactly like the prototype's init, so
// partial/older stored shapes never lose fields for later phases.
export async function loadMain(): Promise<MainState> {
  const main = defaultMain()
  const m = await sGet<Partial<MainState>>(MAIN_KEY)
  if (m) {
    Object.assign(main, m)
    main.streak = m.streak || { count: 0, last: null }
    main.quran = Object.assign({ page: 1, bookmarks: [] }, m.quran)
    main.hifz = m.hifz || []
    main.hifzLog = m.hifzLog || {}
    main.duas = m.duas || []
    main.location = { ...DEFAULT_LOCATION, ...(m.location ?? {}) }
    main.reminders = m.reminders ?? false
  }
  return main
}

export async function saveMain(main: MainState): Promise<void> {
  await sSet(MAIN_KEY, main)
}
