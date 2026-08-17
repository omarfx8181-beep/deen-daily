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
  defaultDay,
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
  // Which day `day` actually holds, and which day is mid-load — the rollover
  // check reads these instead of stale closure values.
  const dateKeyRef = useRef(dateKey)
  const loadingRef = useRef<string | null>(null)
  const visitedRef = useRef<Set<TabId>>(new Set())
  dateKeyRef.current = dateKey

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

  // Midnight rollover: when the calendar day changes while the app stays
  // open (PWA left running), reload the day log and re-key the journal form
  // so the UI never shows yesterday's checks or entry as today's.
  // `dateKey` is only advanced once the new day's log has actually loaded —
  // advancing it first would leave a window where the clock says "today" but
  // `day` still holds yesterday, and a toggle in that window would copy
  // yesterday's checks into today and earn a phantom streak.
  useEffect(() => {
    let cancelled = false
    const checkDate = () => {
      const tk = todayKey()
      if (tk === dateKeyRef.current || loadingRef.current === tk) return
      loadingRef.current = tk
      void loadDay(tk).then((d) => {
        loadingRef.current = null
        if (cancelled || todayKey() !== tk) return
        setDay(d)
        setDateKey(tk)
      })
    }
    const interval = setInterval(checkDate, 60_000)
    document.addEventListener('visibilitychange', checkDate)
    window.addEventListener('focus', checkDate)
    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', checkDate)
      window.removeEventListener('focus', checkDate)
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
    let base = day ?? defaultDay()
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
  // Tabs stay mounted so drafts survive switching, but their heavy data
  // (a surah, the Fortress collection) is only fetched once you actually
  // open that tab — a Today-only session pays nothing for them.
  visitedRef.current.add(tab)
  const visited = (id: TabId) => visitedRef.current.has(id)

  return (
    <>
      <div className="wrap">
        <Header />
        <div className={tabClass('today')}>
          {ready && (
            <TodayTab
              day={day}
              streakCount={main.streak.count}
              location={main.location}
              onChangeLocation={(location) => commitMain({ ...main, location })}
              onToggleTask={(id) => void commitDay((d) => ({ ...d, c: { ...d.c, [id]: !d.c[id] } }))}
            />
          )}
        </div>
        <div className={tabClass('quran')}>
          {ready && visited('quran') && (
            <QuranTab main={main} onUpdateMain={commitMain} onToast={showToast} />
          )}
        </div>
        <div className={tabClass('learn')}>{visited('learn') && <LearnTab />}</div>
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
