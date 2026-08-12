import { useState } from 'react'
import './styles/app.css'
import Header from './components/Header'
import TabNav, { type TabId } from './components/TabNav'
import Footer from './components/Footer'
import Placeholder from './components/Placeholder'
import TodayTab from './tabs/TodayTab'

export default function App() {
  const [tab, setTab] = useState<TabId>('today')
  return (
    <>
      <div className="wrap">
        <Header />
        <div className="tab active" key={tab}>
          {tab === 'today' && <TodayTab />}
          {tab === 'quran' && <Placeholder title="Quran" />}
          {tab === 'learn' && <Placeholder title="Learn" />}
          {tab === 'journal' && <Placeholder title="Journal" />}
        </div>
        <Footer />
      </div>
      <TabNav active={tab} onChange={setTab} />
    </>
  )
}
