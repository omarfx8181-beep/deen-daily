const d = new Date()
const dateLine = d.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
let hijriLine = ''
try {
  hijriLine =
    new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d) + ' AH'
} catch {
  hijriLine = ''
}

export default function Header() {
  return (
    <header>
      <div className="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
      <h1>Deen Daily</h1>
      <div className="date-line">{dateLine}</div>
      <div className="hijri">{hijriLine}</div>
    </header>
  )
}
