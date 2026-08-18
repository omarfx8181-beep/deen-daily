import { SURAHS } from '../../data/content'
import { buildReview } from '../../lib/review'
import { dayOfYear, todayKey } from '../../lib/dates'

const name = (n: number) => SURAHS[n - 1]?.[1] ?? `Surah ${n}`
const ayat = (n: number) => SURAHS[n - 1]?.[3] ?? 0

function Track({
  label,
  hint,
  items,
  onOpen,
}: {
  label: string
  hint: string
  items: number[]
  onOpen: (n: number) => void
}) {
  return (
    <div className="track">
      <div className="track-head">
        <b>{label}</b>
        <span>{hint}</span>
      </div>
      {items.length === 0 ? (
        <p className="muted track-empty">Nothing yet.</p>
      ) : (
        <div className="track-chips">
          {items.map((n) => (
            <button key={n} className="pill" onClick={() => onOpen(n)}>
              {n}. {name(n)} <span className="track-ayat">{ayat(n)} ayat</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ReviewQueue({
  hifz,
  hifzLog,
  onOpenSurah,
}: {
  hifz: number[]
  hifzLog: Record<string, string>
  onOpenSurah: (n: number) => void
}) {
  const q = buildReview(hifz, hifzLog, todayKey(), dayOfYear())

  return (
    <section id="review">
      <h2>Today's Review</h2>
      {hifz.length === 0 ? (
        <div className="card">
          <p className="muted">
            Mark a surah in the Hifz tracker below and your daily sabaq · sabqi · manzil list
            appears here automatically.
          </p>
        </div>
      ) : (
        <div className="card review-card">
          <Track
            label="Sabaq"
            hint="today's portion — make it perfect"
            items={q.sabaq ? [q.sabaq] : []}
            onOpen={onOpenSurah}
          />
          <Track
            label="Sabqi"
            hint="the last 7 days — recite once"
            items={q.sabqi}
            onOpen={onOpenSurah}
          />
          <Track
            label="Manzil"
            hint="older hifz, on rotation"
            items={q.manzil}
            onOpen={onOpenSurah}
          />
          <p className="muted review-foot">
            Tap any surah to open it in the reader. Review outranks progress — never add new until
            yesterday's is solid.
            {q.undated > 0
              ? ` (${q.undated} surah${q.undated === 1 ? '' : 's'} tracked before dates were kept — they rotate as manzil.)`
              : ''}
          </p>
        </div>
      )}
    </section>
  )
}
