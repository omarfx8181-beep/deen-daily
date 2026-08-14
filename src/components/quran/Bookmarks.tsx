import { useState } from 'react'
import { SURAHS } from '../../data/content'
import type { Bookmark } from '../../lib/storage'

export default function Bookmarks({
  bookmarks,
  onAdd,
  onRemove,
}: {
  bookmarks: Bookmark[]
  onAdd: (surahIndex: number, note: string) => void
  onRemove: (index: number) => void
}) {
  const [surahIx, setSurahIx] = useState('0')
  const [note, setNote] = useState('')
  return (
    <section id="bookmarks">
      <h2>Bookmarks</h2>
      <div className="qrow">
        <select value={surahIx} onChange={(e) => setSurahIx(e.target.value)}>
          {SURAHS.map((s, i) => (
            <option key={s[0]} value={i}>
              {s[0]}. {s[1]} (p.{s[4]})
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="note — 'ayah about patience...'"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          className="btn gold small"
          onClick={() => {
            onAdd(parseInt(surahIx), note.trim())
            setNote('')
          }}
        >
          Save
        </button>
      </div>
      <div>
        {bookmarks.length === 0 ? (
          <p className="muted">No bookmarks yet. Mark where an ayah stopped you.</p>
        ) : (
          bookmarks.map((b, i) => (
            <div className="bm-item" key={`${b.d}-${b.s}-${i}`}>
              <div>
                <b style={{ fontSize: '.85rem' }}>{b.s}</b> <span className="pill">p. {b.p}</span>
                {b.n ? (
                  <div className="muted" style={{ marginTop: 2 }}>
                    {b.n}
                  </div>
                ) : null}
                <div className="muted" style={{ fontSize: '.68rem', marginTop: 2 }}>
                  {b.d}
                </div>
              </div>
              <button className="del" onClick={() => onRemove(i)}>
                remove
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
