import { useState } from 'react'
import { pageToJuz, surahAtPage, TOTAL_PAGES } from '../../lib/quran'

export default function ReadingTracker({
  page,
  onSetPage,
}: {
  page: number
  onSetPage: (p: number) => void
}) {
  const [jump, setJump] = useState('')
  const [ppd, setPpd] = useState('2')
  const s = surahAtPage(page)
  const remaining = TOTAL_PAGES - page
  const days = Math.ceil(remaining / parseInt(ppd))
  const fin = new Date()
  fin.setDate(fin.getDate() + days)
  const finStr = fin.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return (
    <section style={{ marginTop: 16 }}>
      <h2>Reading Tracker</h2>
      <div className="qstat">
        <div className="card">
          <b>{page}</b>
          <span>current page</span>
        </div>
        <div className="card">
          <b>{pageToJuz(page)}</b>
          <span>juz</span>
        </div>
        <div className="card">
          <b>{Math.floor((page / TOTAL_PAGES) * 100)}%</b>
          <span>of mushaf</span>
        </div>
      </div>
      <div className="qbar">
        <div style={{ width: `${(page / TOTAL_PAGES) * 100}%` }} />
      </div>
      <div className="qrow">
        <button className="btn" onClick={() => onSetPage(page - 1)}>
          −1 page
        </button>
        <button className="btn gold" onClick={() => onSetPage(page + 1)}>
          +1 page read
        </button>
        <input
          type="number"
          min={1}
          max={TOTAL_PAGES}
          placeholder="jump to page"
          style={{ maxWidth: 130 }}
          value={jump}
          onChange={(e) => setJump(e.target.value)}
        />
        <button
          className="btn small"
          onClick={() => {
            const v = parseInt(jump)
            if (v) onSetPage(v)
          }}
        >
          Set
        </button>
      </div>
      <p className="muted">
        You are in Surah {s[1]} ({s[2]}) — {s[3]} ayat.
      </p>
      <div className="card" style={{ marginTop: 12 }}>
        <span className="jlabel" style={{ marginTop: 0 }}>
          Khatmah calculator
        </span>
        <div className="qrow">
          <select style={{ maxWidth: 160 }} value={ppd} onChange={(e) => setPpd(e.target.value)}>
            <option value="1">1 page/day</option>
            <option value="2">2 pages/day</option>
            <option value="4">4 pages/day (~khatmah in 5 months)</option>
            <option value="10">10 pages/day</option>
            <option value="20">20 pages/day (khatmah/month)</option>
          </select>
          <span className="muted">
            → khatmah in {days} days ({finStr}), inshaAllah
          </span>
        </div>
      </div>
    </section>
  )
}
