// Streak logic — pure transcription of the prototype's updateStreak().
// Completing all tasks increments the streak (continues if yesterday was the
// last completed day, otherwise restarts at 1). Un-checking after today was
// counted decrements and rolls `last` back.

import { TASKS } from '../data/content'

export interface Streak {
  count: number
  last: string | null
}

export const countDone = (checks: Record<string, boolean>) =>
  TASKS.filter((t) => checks[t[0]]).length

export function updateStreak(
  streak: Streak,
  doneCount: number,
  total: number,
  today: string,
  yesterday: string,
): { streak: Streak; changed: boolean } {
  if (doneCount === total) {
    if (streak.last !== today) {
      return {
        streak: { count: streak.last === yesterday ? streak.count + 1 : 1, last: today },
        changed: true,
      }
    }
  } else if (streak.last === today) {
    const count = Math.max(0, streak.count - 1)
    return { streak: { count, last: count > 0 ? yesterday : null }, changed: true }
  }
  return { streak, changed: false }
}
