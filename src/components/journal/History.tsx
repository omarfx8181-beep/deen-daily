import { useEffect, useState } from 'react'
import { TASKS } from '../../data/content'
import { todayKey } from '../../lib/dates'
import { DAY_PREFIX, sGet, sList, type DayLog } from '../../lib/storage'

export default function History({ refreshKey }: { refreshKey: string }) {
  const [keys, setKeys] = useState<string[]>([])
  const [open, setOpen] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    void sList(DAY_PREFIX).then((all) => {
      if (cancelled) return
      const past = all
        .filter((k) => k !== DAY_PREFIX + todayKey())
        .sort()
        .reverse()
        .slice(0, 14)
      setKeys(past)
    })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const toggle = async (k: string) => {
    if (open[k] !== undefined) {
      setOpen(({ [k]: _closed, ...rest }) => rest)
      return
    }
    const d = await sGet<DayLog>(k)
    let txt = ''
    if (d && d.j) {
      const g = (d.j.g || []).filter((x) => x && x.trim())
      if (g.length) txt += 'Shukr: ' + g.join(' · ') + '\n'
      if (d.j.r) txt += 'Reflection: ' + d.j.r + '\n'
      if (d.j.f) txt += d.j.f
    }
    const done = d && d.c ? Object.values(d.c).filter(Boolean).length : 0
    setOpen((o) => ({
      ...o,
      [k]: (txt || '(no journal written)') + '\n— ' + done + '/' + TASKS.length + ' practices completed',
    }))
  }

  return (
    <section>
      <h2>Past Entries</h2>
      <div>
        {keys.length === 0 ? (
          <p className="muted">Entries will appear here as your journal grows.</p>
        ) : (
          keys.map((k) => {
            const date = k.replace(DAY_PREFIX, '')
            return (
              <div className="hist-item" key={k} onClick={() => void toggle(k)}>
                <div className="hd">
                  {date}{' '}
                  <span className="muted" style={{ fontSize: '.72rem' }}>
                    tap to view
                  </span>
                </div>
                {open[k] !== undefined ? <div className="hist-body">{open[k]}</div> : null}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
