import { useCallback, useState } from 'react'
import SectionNav from '../components/SectionNav'
import { HADITH, MOTIV, NAMES } from '../data/content'
import HisnBrowser from '../components/learn/HisnBrowser'
import Roadmap from '../components/learn/Roadmap'
import HadithBrowser from '../components/learn/HadithBrowser'
import MotivBrowser from '../components/learn/MotivBrowser'
import NamesGrid from '../components/learn/NamesGrid'

export default function LearnTab() {
  const [q, setQ] = useState('')
  const [hisnMatches, setHisnMatches] = useState(-1)
  const onHisnMatches = useCallback((n: number) => setHisnMatches(n), [])
  const needle = q.trim().toLowerCase()
  const has = (...fields: (string | number)[]) =>
    fields.some((f) => String(f).toLowerCase().includes(needle))

  const hadith = needle ? HADITH.filter((h) => has(h[0], h[1], h[2], h[3], h[4])) : HADITH
  const motiv = needle ? MOTIV.filter((m) => has(m[0], m[1])) : MOTIV
  const names = needle ? NAMES.filter((n) => has(n[0], n[1], n[2])) : NAMES
  // hisnMatches is -1 until the Fortress data has loaded — never claim "no
  // matches" before every collection has actually been searched.
  const none =
    !!needle &&
    hadith.length === 0 &&
    motiv.length === 0 &&
    names.length === 0 &&
    hisnMatches === 0

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
      <SectionNav
        items={[
          { label: 'Hadith', id: 'nawawi' },
          { label: 'Motivation', id: 'motivation' },
          { label: 'Fortress', id: 'fortress-full' },
          { label: 'Names', id: 'names' },
        ]}
      />
      {!needle && <Roadmap />}
      {hadith.length > 0 && <HadithBrowser items={hadith} filtered={!!needle} />}
      {motiv.length > 0 && <MotivBrowser items={motiv} filtered={!!needle} />}
      <HisnBrowser query={q} onMatches={onHisnMatches} />
      {names.length > 0 && <NamesGrid items={names} filtered={!!needle} />}
      {none && <p className="muted no-matches">No matches for "{q.trim()}" in the collections.</p>}
    </>
  )
}
