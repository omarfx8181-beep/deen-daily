import { SOURCES } from '../../data/content'
import type { Hadith } from '../../data/content'

export default function HadithBrowser({
  items,
  filtered = false,
}: {
  items: Hadith[]
  filtered?: boolean
}) {
  return (
    <section>
      <h2>Nawawi's Forty{filtered ? ` — ${items.length} match${items.length === 1 ? '' : 'es'}` : ' — Browse All'}</h2>
      <div>
        {items.map((h) => (
          <details key={h[0]}>
            <summary>
              <span>
                <span className="pill" style={{ marginRight: 8 }}>
                  {h[0]}
                </span>
                {h[1]}
              </span>
            </summary>
            <div className="dbody">
              <p
                style={{
                  fontFamily: 'Amiri,serif',
                  fontStyle: 'italic',
                  fontSize: '1.02rem',
                  marginTop: 10,
                }}
              >
                {'“' + h[2] + '”'}
              </p>
              <p style={{ marginTop: 8 }}>{h[3]}</p>
              <div className="meaning" style={{ marginTop: 8 }}>
                Source: {SOURCES[h[0] - 1]}
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
