import { useEffect, useState } from 'react'
import { TASKS } from '../data/content'
import { dayOfYear, todayKey, yesterdayKey } from '../lib/dates'
import { updateStreak } from '../lib/streak'
import {
  loadDay,
  loadMain,
  saveDay,
  saveMain,
  type DayLog,
  type MainState,
} from '../lib/storage'
import StreakRing from '../components/today/StreakRing'
import LessonCard from '../components/today/LessonCard'
import MotivCard from '../components/today/MotivCard'
import NameCard from '../components/today/NameCard'
import Checklist from '../components/today/Checklist'
import AdhkarAccordion from '../components/today/AdhkarAccordion'

const countDone = (checks: Record<string, boolean>) => TASKS.filter((t) => checks[t[0]]).length

export default function TodayTab() {
  const [day, setDay] = useState<DayLog | null>(null)
  const [main, setMain] = useState<MainState | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const [d, m] = await Promise.all([loadDay(todayKey()), loadMain()])
      if (!cancelled) {
        setDay(d)
        setMain(m)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!day || !main) return null

  const dayIndex = dayOfYear()

  const toggle = (id: string) => {
    const nextDay: DayLog = { ...day, c: { ...day.c, [id]: !day.c[id] } }
    setDay(nextDay)
    void saveDay(todayKey(), nextDay)
    const r = updateStreak(
      main.streak,
      countDone(nextDay.c),
      TASKS.length,
      todayKey(),
      yesterdayKey(),
    )
    if (r.changed) {
      const nextMain: MainState = { ...main, streak: r.streak }
      setMain(nextMain)
      void saveMain(nextMain)
    }
  }

  return (
    <>
      <StreakRing count={main.streak.count} done={countDone(day.c)} total={TASKS.length} />
      <LessonCard dayIndex={dayIndex} />
      <MotivCard dayIndex={dayIndex} />
      <NameCard dayIndex={dayIndex} />
      <Checklist checks={day.c} onToggle={toggle} />
      <AdhkarAccordion />
    </>
  )
}
