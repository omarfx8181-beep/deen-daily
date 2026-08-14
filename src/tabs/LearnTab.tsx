import { useState } from 'react'
import { HADITH, MOTIV, NAMES } from '../data/content'
import Roadmap from '../components/learn/Roadmap'
import HadithBrowser from '../components/learn/HadithBrowser'
import MotivBrowser from '../components/learn/MotivBrowser'
import NamesGrid from '../components/learn/NamesGrid'

export default function LearnTab() {
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()
  const has = (...fields: (string | number)[]) =>
    fields.some((f) => String(f).toLowerCase().includes(needle))

  const hadith = needle ? HADITH.filter((h) => has(h[0], h[1], h[2], h[3], h[4])) : HADITH
  const motiv = needle ? MOTIV.filter((m) => has(m[0], m[1])) : MOTIV
  const names = needle ? NAMES.filter((n) => has(n[0], n[1], n[2])) : NAMES
  const none = needle && hadith.length === 0 && motiv.length === 0 && names.length === 0

  return (
    <>
      <div className="search-row">
        <input
          type="search"
          placeholder="Search — hadith, motivation, the Names…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search the collections"
        />
      </div>
      {!needle && <Roadmap />}
      {none ? (
        <p className="muted no-matches">No matches for "{q.trim()}".</p>
      ) : (
        <>
          {hadith.length > 0 && <HadithBrowser items={hadith} filtered={!!needle} />}
          {motiv.length > 0 && <MotivBrowser items={motiv} filtered={!!needle} />}
          {names.length > 0 && <NamesGrid items={names} filtered={!!needle} />}
        </>
      )}
    </>
  )
}
