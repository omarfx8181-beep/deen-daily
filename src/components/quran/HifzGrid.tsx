import { SURAHS } from '../../data/content'

export default function HifzGrid({
  hifz,
  onToggle,
}: {
  hifz: number[]
  onToggle: (surahNumber: number) => void
}) {
  return (
    <section id="hifz">
      <h2>Hifz — Memorization</h2>
      <p className="muted" style={{ marginBottom: 10 }}>
        <span>{hifz.length}</span> of 114 surahs memorized · tap a surah to toggle
      </p>
      <div className="surah-grid">
        {SURAHS.map((s) => (
          <div
            key={s[0]}
            className={'schip' + (hifz.includes(s[0]) ? ' memo' : '')}
            title={s[2]}
            onClick={() => onToggle(s[0])}
          >
            <span className="sn">{s[0]}</span>
            <br />
            {s[1]}
            <br />
            <span className="sn">{s[3]} ayat</span>
          </div>
        ))}
      </div>
    </section>
  )
}
