import { useCallback, useRef, useState } from 'react'
import './styles/app.css'
import Header from './components/Header'
import TabNav, { type TabId } from './components/TabNav'
import Footer from './components/Footer'
import TodayTab from './tabs/TodayTab'
import QuranTab from './tabs/QuranTab'
import LearnTab from './tabs/LearnTab'
import JournalTab from './tabs/JournalTab'

export default function App() {
  const [tab, setTab] = useState<TabId>('today')
  const [toast, setToast] = useState({ msg: 'Saved ✓', show: false })
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current)
    setToast({ msg, show: true })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 1600)
  }, [])
  return (
    <>
      <div className="wrap">
        <Header />
        <div className="tab active" key={tab}>
          {tab === 'today' && <TodayTab />}
          {tab === 'quran' && <QuranTab onToast={showToast} />}
          {tab === 'learn' && <LearnTab />}
          {tab === 'journal' && <JournalTab onToast={showToast} />}
        </div>
        <Footer />
      </div>
      <div className={'save-toast' + (toast.show ? ' show' : '')}>{toast.msg}</div>
      <TabNav active={tab} onChange={setTab} />
    </>
  )
}
