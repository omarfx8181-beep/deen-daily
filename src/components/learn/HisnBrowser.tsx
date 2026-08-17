import { useEffect, useState } from 'react'
import { filterHisn, loadHisn, type HisnData } from '../../lib/hisn'

export default function HisnBrowser({
  query,
  onMatches,
}: {
  query: string
  onMatches?: (count: number) => void
}) {
  const [data, setData] = useState<HisnData | null>(null)
  const [error, setError] = useState(false)
  const [openChapter, setOpenChapter] = useState<number | null>(null)

  useEffect(() => {
    if (!onMatches) return
    onMatches(data ? filterHisn(data, query).duas.length : 0)
  }, [data, query, onMatches])

  useEffect(() => {
    let cancelled = false
    loadHisn()
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [])

  if (error) return null
  if (!data) return null

  const { chapters, duas } = filterHisn(data, query)
  if (query.trim() && chapters.length === 0) return null

  const byChapter = new Map<number, typeof duas>()
  for (const d of duas) {
    const list = byChapter.get(d.ch)
    if (list) list.push(d)
    else byChapter.set(d.ch, [d])
  }
  const searching = !!query.trim()

  return (
    <section id="fortress-full">
      <h2>
        Hisn al-Muslim — The Fortress
        {searching ? ` — ${duas.length} match${duas.length === 1 ? '' : 'es'}` : ''}
      </h2>
      <p className="muted" style={{ marginBottom: 10 }}>
        The complete collection: {data.duas.length} du'as across {data.chapters.length} occasions,
        with the Arabic, a line to say it from, the meaning and its reference — copied verbatim from
        the sunnah.com corpus.
      </p>
      <div>
        {chapters.map((c) => {
          const items = byChapter.get(c.n) ?? []
          const open = searching || openChapter === c.n
          return (
            <details
              key={c.n}
              open={open}
              onToggle={(e) => {
                if (searching) return
                setOpenChapter((e.currentTarget as HTMLDetailsElement).open ? c.n : null)
              }}
            >
              <summary>
                <span>
                  <span className="pill" style={{ marginRight: 8 }}>
                    {c.n}
                  </span>
                  {c.title}
                </span>
              </summary>
              <div className="dbody">
                {items.map((d) => (
                  <div className="hisn-dua" key={d.n}>
                    <div className="ar">{d.ar}</div>
                    {d.translit ? (
                      <>
                        <div className="dlabel">Say it</div>
                        <div className="translit">{d.translit}</div>
                      </>
                    ) : null}
                    <div className="dlabel">Meaning</div>
                    <div className="meaning">{d.meaning}</div>
                    {d.ref ? (
                      <div className="meaning" style={{ marginTop: 6 }}>
                        Source: {d.ref}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </details>
          )
        })}
      </div>
    </section>
  )
}
