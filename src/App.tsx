import { useCallback, useEffect, useRef, useState } from 'react'
import './styles/app.css'
import './styles/additions.css'
import Header from './components/Header'
import TabNav, { type TabId } from './components/TabNav'
import Footer from './components/Footer'
import TodayTab from './tabs/TodayTab'
import QuranTab from './tabs/QuranTab'
import LearnTab from './tabs/LearnTab'
import JournalTab from './tabs/JournalTab'
import { todayKey, yesterdayKey } from './lib/dates'
import { applyJournal } from './lib/journal'
import { countDone, updateStreak } from './lib/streak'
import { TASKS } from './data/content'
import {
  loadDay,
  loadMain,
  saveDay,
  saveMain,
  type DayLog,
  type Journal,
  type MainState,
} from './lib/storage'

// Single shared state for the whole app, like the prototype's globals: all
// tabs read and write the same day/main, and stay mounted (CSS-toggled) so
// unsaved drafts survive tab switches.
export default function App() {
  const [tab, setTab] = useState<TabId>('today')
  const [dateKey, setDateKey] = useState(todayKey())
  const [day, setDay] = useState<DayLog | null>(null)
  const [main, setMain] = useState<MainState | null>(null)
  const [toast, setToast] = useState({ msg: 'Saved ✓', show: false })
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

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

  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current)
    setToast({ msg, show: true })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 1600)
  }, [])

  const commitMain = (next: MainState) => {
    setMain(next)
    void saveMain(next)
  }

  // Rollover-safe day mutation: if the calendar day changed since load, the
  // mutation applies to the NEW day's stored log (usually empty), never to
  // stale state — so a save after midnight can't copy yesterday's checkmarks
  // into the new date or earn a phantom streak.
  const commitDay = async (mutate: (d: DayLog) => DayLog) => {
    const tk = todayKey()
    let base = day ?? { c: {}, j: null }
    if (tk !== dateKey) {
      base = await loadDay(tk)
      setDateKey(tk)
    }
    const next = mutate(base)
    setDay(next)
    await saveDay(tk, next)
    if (main) {
      const r = updateStreak(main.streak, countDone(next.c), TASKS.length, tk, yesterdayKey())
      if (r.changed) commitMain({ ...main, streak: r.streak })
    }
  }

  const saveJournal = (j: Journal) => {
    void commitDay((d) => applyJournal(d, j))
    showToast('Saved ✓')
  }

  const tabClass = (id: TabId) => 'tab' + (tab === id ? ' active' : '')
  const ready = day !== null && main !== null

  return (
    <>
      <div className="wrap">
        <Header />
        <div className={tabClass('today')}>
          {ready && (
            <TodayTab
              day={day}
              streakCount={main.streak.count}
              onToggleTask={(id) => void commitDay((d) => ({ ...d, c: { ...d.c, [id]: !d.c[id] } }))}
            />
          )}
        </div>
        <div className={tabClass('quran')}>
          {ready && <QuranTab main={main} onUpdateMain={commitMain} onToast={showToast} />}
        </div>
        <div className={tabClass('learn')}>
          <LearnTab />
        </div>
        <div className={tabClass('journal')}>
          {ready && (
            <JournalTab
              day={day}
              main={main}
              dateKey={dateKey}
              onSaveJournal={saveJournal}
              onUpdateMain={commitMain}
            />
          )}
        </div>
        <Footer />
      </div>
      <div className={'save-toast' + (toast.show ? ' show' : '')}>{toast.msg}</div>
      <TabNav active={tab} onChange={setTab} />
    </>
  )
}
