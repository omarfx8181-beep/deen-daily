import { useState } from 'react'
import { PROMPTS } from '../../data/content'
import { dayOfYear } from '../../lib/dates'
import type { Journal } from '../../lib/storage'

export default function TodayJournal({
  journal,
  onSave,
}: {
  journal: Journal | null
  onSave: (j: Journal) => void
}) {
  const [g1, setG1] = useState(journal?.g[0] ?? '')
  const [g2, setG2] = useState(journal?.g[1] ?? '')
  const [g3, setG3] = useState(journal?.g[2] ?? '')
  const [r, setR] = useState(journal?.r ?? '')
  const [f, setF] = useState(journal?.f ?? '')
  const prompt = PROMPTS[dayOfYear() % PROMPTS.length]
  return (
    <section style={{ marginTop: 16 }}>
      <h2>Today's Journal</h2>
      <div className="card">
        <span className="jlabel" style={{ marginTop: 0 }}>
          Shukr — three blessings today
        </span>
        <p className="muted" style={{ marginBottom: 8 }}>
          "If you are grateful, I will surely increase you." (14:7)
        </p>
        <div className="jgrat">
          <input type="text" placeholder="1." value={g1} onChange={(e) => setG1(e.target.value)} />
          <input type="text" placeholder="2." value={g2} onChange={(e) => setG2(e.target.value)} />
          <input type="text" placeholder="3." value={g3} onChange={(e) => setG3(e.target.value)} />
        </div>

        <span className="jlabel">Muhasabah — today's reflection</span>
        <div className="jprompt">{prompt}</div>
        <textarea
          placeholder="Write honestly. Umar (ra) said: take account of yourselves before you are taken to account."
          value={r}
          onChange={(e) => setR(e.target.value)}
        />

        <span className="jlabel">Free space</span>
        <textarea
          placeholder="Anything on your heart — worries handed to Allah, wins, intentions for tomorrow..."
          value={f}
          onChange={(e) => setF(e.target.value)}
        />

        <div style={{ marginTop: 14, textAlign: 'right' }}>
          <button className="btn gold" onClick={() => onSave({ g: [g1, g2, g3], r, f })}>
            Save today's entry
          </button>
        </div>
      </div>
    </section>
  )
}
