import type { Name } from '../../data/content'

export default function NamesGrid({
  items,
  filtered = false,
}: {
  items: Name[]
  filtered?: boolean
}) {
  return (
    <section id="names">
      <h2>{filtered ? `The Names of Allah — ${items.length} match${items.length === 1 ? '' : 'es'}` : 'The 99 Names of Allah'}</h2>
      {!filtered && (
        <p className="muted" style={{ marginBottom: 10 }}>
          The authentic hadith (Bukhari & Muslim) gives the number 99 without an itemized list — the
          famous enumeration is a later compilation. This grid gathers names established in the
          Quran and Sunnah.
        </p>
      )}
      <div className="names-grid">
        {items.map((n) => (
          <div className="ncell" key={n[1]}>
            <div className="a">{n[0]}</div>
            <div className="t">{n[1]}</div>
            <div className="m">{n[2]}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
