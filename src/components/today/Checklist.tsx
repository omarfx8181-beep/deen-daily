import { TASKS } from '../../data/content'

export default function Checklist({
  checks,
  onToggle,
}: {
  checks: Record<string, boolean>
  onToggle: (id: string) => void
}) {
  const done = TASKS.filter((t) => checks[t[0]]).length
  const total = TASKS.length
  return (
    <section id="practice">
      <h2>Daily Practice</h2>
      <div className="check-grid">
        {TASKS.map((t) => (
          <div
            key={t[0]}
            className={'check' + (checks[t[0]] ? ' done' : '')}
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
              {t[2] ? <span className="sub">{t[2]}</span> : null}
            </div>
          </div>
        ))}
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
