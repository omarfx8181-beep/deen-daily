import { MOTIV } from '../../data/content'

export default function MotivBrowser() {
  return (
    <section>
      <h2>Hope & Motivation — The Collection</h2>
      <div>
        {MOTIV.map((m) => (
          <div className="card" style={{ marginBottom: 8 }} key={m[1] + m[0].slice(0, 24)}>
            <div className="mtext" style={{ fontFamily: 'Amiri,serif', fontStyle: 'italic' }}>
              {'“' + m[0] + '”'}
            </div>
            <div
              className="msrc"
              style={{
                fontSize: '.66rem',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: 'var(--lapis)',
                marginTop: 6,
              }}
            >
              {m[1]}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
