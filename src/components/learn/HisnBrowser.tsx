import { useEffect, useMemo, useState } from 'react'
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

  // One filter pass per query, shared by the count callback and the render.
  const result = useMemo(() => (data ? filterHisn(data, query) : null), [data, query])

  useEffect(() => {
    // While loading, report -1 ("unknown") rather than 0, so the Learn tab
    // does not flash "No matches" for a term that only the Fortress has.
    if (onMatches) onMatches(result ? result.duas.length : -1)
  }, [result, onMatches])

  useEffect(() => {
    let cancelled = false
    loadHisn()
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [])

  if (error)
    return (
      <section id="fortress-full">
        <h2>Hisn al-Muslim — The Fortress</h2>
        <p className="muted">
          The collection could not be loaded. It is stored on your device — reopen the app once
          you have a connection and it will be saved for offline use.
        </p>
      </section>
    )
  if (!data || !result) return null

  const { chapters, duas } = result
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
