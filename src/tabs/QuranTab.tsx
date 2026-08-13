import { useEffect, useState } from 'react'
import { SURAHS } from '../data/content'
import { todayKey } from '../lib/dates'
import { clampPage } from '../lib/quran'
import { loadMain, saveMain, type MainState } from '../lib/storage'
import ReadingTracker from '../components/quran/ReadingTracker'
import Bookmarks from '../components/quran/Bookmarks'
import HifzGrid from '../components/quran/HifzGrid'
import HifzGuide from '../components/quran/HifzGuide'

export default function QuranTab({ onToast }: { onToast: (msg: string) => void }) {
  const [main, setMain] = useState<MainState | null>(null)

  useEffect(() => {
    let cancelled = false
    void loadMain().then((m) => {
      if (!cancelled) setMain(m)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!main) return null

  const update = (next: MainState) => {
    setMain(next)
    void saveMain(next)
  }

  return (
    <>
      <ReadingTracker
        page={main.quran.page}
        onSetPage={(p) =>
          update({ ...main, quran: { ...main.quran, page: clampPage(p) } })
        }
      />
      <Bookmarks
        bookmarks={main.quran.bookmarks}
        onAdd={(surahIx, note) => {
          const s = SURAHS[surahIx]
          update({
            ...main,
            quran: {
              ...main.quran,
              bookmarks: [
                { s: s[1], p: s[4], n: note, d: todayKey() },
                ...main.quran.bookmarks,
              ],
            },
          })
          onToast('Bookmark saved ✓')
        }}
        onRemove={(i) =>
          update({
            ...main,
            quran: {
              ...main.quran,
              bookmarks: main.quran.bookmarks.filter((_, ix) => ix !== i),
            },
          })
        }
      />
      <HifzGrid
        hifz={main.hifz}
        onToggle={(n) =>
          update({
            ...main,
            hifz: main.hifz.includes(n) ? main.hifz.filter((x) => x !== n) : [...main.hifz, n],
          })
        }
      />
      <HifzGuide />
    </>
  )
}
