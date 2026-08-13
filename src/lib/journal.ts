// Journal save logic — pure transcription of the prototype's saveJournal():
// writing any journal content marks the "journal" practice task as done
// (never un-marks it).

import type { DayLog, Journal } from './storage'

export function applyJournal(day: DayLog, j: Journal): DayLog {
  const next: DayLog = { ...day, c: { ...day.c }, j }
  const has = j.g.some((x) => x.trim()) || j.r.trim() || j.f.trim()
  if (has && !next.c.journal) next.c.journal = true
  return next
}
