import { SURAHS } from '../data/content'
import { todayKey } from '../lib/dates'
import { clampPage } from '../lib/quran'
import type { MainState } from '../lib/storage'
import { useState } from 'react'
import SectionNav from '../components/SectionNav'
import Reader from '../components/quran/Reader'
import ReadingTracker from '../components/quran/ReadingTracker'
import Bookmarks from '../components/quran/Bookmarks'
import HifzGrid from '../components/quran/HifzGrid'
import HifzGuide from '../components/quran/HifzGuide'

export default function QuranTab({
  main,
  onUpdateMain,
  onToast,
}: {
  main: MainState
  onUpdateMain: (next: MainState) => void
  onToast: (msg: string) => void
}) {
  const [surah, setSurah] = useState(1)
  return (
    <>
      <SectionNav
        items={[
          { label: 'Read', id: 'reader' },
          { label: 'Tracker', id: 'tracker' },
          { label: 'Bookmarks', id: 'bookmarks' },
          { label: 'Hifz', id: 'hifz' },
          { label: 'Method', id: 'method' },
        ]}
      />
      <Reader surah={surah} onChangeSurah={setSurah} />
      <ReadingTracker
        page={main.quran.page}
        onSetPage={(p) => onUpdateMain({ ...main, quran: { ...main.quran, page: clampPage(p) } })}
      />
      <Bookmarks
        bookmarks={main.quran.bookmarks}
        onAdd={(surahIx, note) => {
          const s = SURAHS[surahIx]
          onUpdateMain({
            ...main,
            quran: {
              ...main.quran,
              bookmarks: [{ s: s[1], p: s[4], n: note, d: todayKey() }, ...main.quran.bookmarks],
            },
          })
          onToast('Bookmark saved ✓')
        }}
        onRemove={(i) =>
          onUpdateMain({
            ...main,
            quran: { ...main.quran, bookmarks: main.quran.bookmarks.filter((_, ix) => ix !== i) },
          })
        }
      />
      <HifzGrid
        hifz={main.hifz}
        onToggle={(n) =>
          onUpdateMain({
            ...main,
            hifz: main.hifz.includes(n) ? main.hifz.filter((x) => x !== n) : [...main.hifz, n],
          })
        }
      />
      <HifzGuide />
    </>
  )
}
