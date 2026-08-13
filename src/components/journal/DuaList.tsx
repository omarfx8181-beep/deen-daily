import { useState } from 'react'

export default function DuaList({
  duas,
  onAdd,
  onRemove,
}: {
  duas: string[]
  onAdd: (dua: string) => void
  onRemove: (index: number) => void
}) {
  const [draft, setDraft] = useState('')
  return (
    <section>
      <h2>My Du'a List</h2>
      <p className="muted" style={{ marginBottom: 8 }}>
        The du'as you refuse to stop making. Read this list after every salah — persistence is
        answered.
      </p>
      <div className="card">
        <div>
          {duas.length === 0 ? (
            <p className="muted">Add the du’as you will not stop making.</p>
          ) : (
            duas.map((d, i) => (
              <div className="dua-item" key={`${i}-${d.slice(0, 16)}`}>
                <span>{d}</span>
                <button
                  className="del"
                  style={{ background: 'none', border: 'none', color: 'var(--rose)', fontSize: '.72rem' }}
                  onClick={() => onRemove(i)}
                >
                  remove
                </button>
              </div>
            ))
          )}
        </div>
        <div className="qrow" style={{ marginTop: 10 }}>
          <input
            type="text"
            placeholder="e.g., righteous children · the supervisor role if it's khayr · the house..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            className="btn small gold"
            onClick={() => {
              const v = draft.trim()
              if (!v) return
              onAdd(v)
              setDraft('')
            }}
          >
            Add
          </button>
        </div>
      </div>
    </section>
  )
}
