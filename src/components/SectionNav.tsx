export default function SectionNav({ items }: { items: { label: string; id: string }[] }) {
  const jump = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // 'instant' (not 'auto') so the CSS html{scroll-behavior:smooth} cannot
    // override the reduced-motion preference.
    el.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' })
  }
  return (
    <div className="section-nav">
      {items.map((it) => (
        <button key={it.id} className="pill" onClick={() => jump(it.id)}>
          {it.label}
        </button>
      ))}
    </div>
  )
}
