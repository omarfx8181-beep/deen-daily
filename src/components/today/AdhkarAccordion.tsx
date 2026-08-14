import { ADHKAR } from '../../data/content'

export default function AdhkarAccordion() {
  return (
    <section id="fortress">
      <h2>The Fortress — Adhkar</h2>
      <div>
        {ADHKAR.map((a) => (
          <details key={a[0]}>
            <summary>{a[0]}</summary>
            <div className="dbody">
              <div className="ar">{a[1]}</div>
              {a[5] ? (
                <>
                  <div className="dlabel">Say it</div>
                  <div className="translit">{a[5]}</div>
                </>
              ) : null}
              <div className="dlabel">Meaning</div>
              <div className="meaning">{a[2]}</div>
              <div className="count">{a[3]}</div>
              <div className="meaning" style={{ marginTop: 8 }}>
                Source: {a[4]}
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
