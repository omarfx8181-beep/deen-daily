// "The Path — Roadmap": static content copied verbatim from the prototype.
// Do not reword — verified element-by-element against the prototype's DOM.

const STEPS = [
  {
    n: '١',
    title: 'Aqeedah — know Him first',
    body: 'The 99 Names and the meaning of la ilaha illa Allah. Everything else is a branch of this root.',
    res: 'Daily Name below · "Explanation of the Beautiful Names" (as-Sa\'di)',
  },
  {
    n: '٢',
    title: 'Salah — the anchor',
    body: 'Perfect the five before adding extras. Learn what you recite so prayer becomes conversation.',
    res: 'Goal: all five on time, 30 days straight',
  },
  {
    n: '٣',
    title: 'Quran — small & consistent',
    body: 'One page with tafsir beats a juz without understanding.',
    res: 'Tafsir as-Sa\'di · Ibn Kathir (abridged)',
  },
  {
    n: '٤',
    title: 'Adhkar — the fortress',
    body: 'Morning and evening protection built into routine like brushing your teeth.',
    res: 'Fortress on Today tab · Hisnul Muslim',
  },
  {
    n: '٥',
    title: 'Seerah — the application layer',
    body: 'His ﷺ life shows the deen in traffic, business, family, conflict.',
    res: '"The Sealed Nectar" (ar-Raheeq al-Makhtum)',
  },
  {
    n: '٦',
    title: 'Hadith — one a day',
    body: "Nawawi's Forty are the pillars. This app cycles all 42 automatically.",
    res: 'Full collection below · sunnah.com for complete texts',
  },
]

export default function Roadmap() {
  return (
    <section style={{ marginTop: 16 }}>
      <h2>The Path — Roadmap</h2>
      <div className="card">
        {STEPS.map((s) => (
          <div className="step" key={s.n}>
            <div className="n">{s.n}</div>
            <div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <div className="res">{s.res}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
