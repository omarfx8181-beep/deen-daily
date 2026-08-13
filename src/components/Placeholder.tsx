export default function Placeholder({ title }: { title: string }) {
  return (
    <section style={{ marginTop: 16 }}>
      <h2>{title}</h2>
      <div className="card">
        <p className="muted">This tab arrives in a later phase, inshaAllah.</p>
      </div>
    </section>
  )
}
