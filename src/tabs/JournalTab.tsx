import { useEffect, useState } from 'react'
import { TASKS } from '../data/content'
import { todayKey, yesterdayKey } from '../lib/dates'
import { applyJournal } from '../lib/journal'
import { updateStreak } from '../lib/streak'
import {
  loadDay,
  loadMain,
  saveDay,
  saveMain,
  type DayLog,
  type Journal,
  type MainState,
} from '../lib/storage'
import TodayJournal from '../components/journal/TodayJournal'
import DuaList from '../components/journal/DuaList'
import History from '../components/journal/History'

const countDone = (checks: Record<string, boolean>) => TASKS.filter((t) => checks[t[0]]).length

export default function JournalTab({ onToast }: { onToast: (msg: string) => void }) {
  const [day, setDay] = useState<DayLog | null>(null)
  const [main, setMain] = useState<MainState | null>(null)
  const [historyRefresh, setHistoryRefresh] = useState(0)

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

  const save = (j: Journal) => {
    const nextDay = applyJournal(day, j)
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
    onToast('Saved ✓')
    setHistoryRefresh((n) => n + 1)
  }

  return (
    <>
      <TodayJournal journal={day.j} onSave={save} />
      <DuaList
        duas={main.duas}
        onAdd={(dua) => {
          const nextMain: MainState = { ...main, duas: [...main.duas, dua] }
          setMain(nextMain)
          void saveMain(nextMain)
        }}
        onRemove={(i) => {
          const nextMain: MainState = { ...main, duas: main.duas.filter((_, ix) => ix !== i) }
          setMain(nextMain)
          void saveMain(nextMain)
        }}
      />
      <History refreshKey={historyRefresh} />
    </>
  )
}
