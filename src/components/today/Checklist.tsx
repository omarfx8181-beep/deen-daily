import { TASKS } from '../../data/content'

export default function Checklist({
  checks,
  times,
  nextPrayerId,
  onToggle,
}: {
  checks: Record<string, boolean>
  times?: Record<string, string>
  nextPrayerId?: string
  onToggle: (id: string) => void
}) {
  const done = TASKS.filter((t) => checks[t[0]]).length
  const total = TASKS.length
  return (
    <section id="practice">
      <h2>Daily Practice</h2>
      <div className="check-grid">
        {TASKS.map((t) => {
          const time = times?.[t[0]]
          const isNext = !checks[t[0]] && nextPrayerId === t[0]
          return (
            <div
              key={t[0]}
              className={'check' + (checks[t[0]] ? ' done' : '') + (isNext ? ' next-prayer' : '')}
              role="checkbox"
              aria-checked={!!checks[t[0]]}
              tabIndex={0}
              onClick={() => onToggle(t[0])}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  onToggle(t[0])
                }
              }}
            >
              <div className="box">✓</div>
              <div className="lbl">
                {t[1]}
                {time || t[2] ? (
                  <span className="sub">
                    {time ? <span className="time">{time}</span> : null}
                    {time && t[2] ? ' · ' : null}
                    {t[2]}
                  </span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
      {done === total ? (
        <div className="progress-note complete">✓ Day complete — may Allah accept it.</div>
      ) : (
        <div className="progress-note">
          {done} of {total} — small and consistent.
        </div>
      )}
    </section>
  )
}
