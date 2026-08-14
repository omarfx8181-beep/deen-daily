import { MOTIV } from '../../data/content'

export default function MotivCard({ dayIndex }: { dayIndex: number }) {
  const m = MOTIV[dayIndex % MOTIV.length]
  return (
    <div className="motiv" id="light">
      <div className="eyebrow" style={{ color: 'var(--lapis)' }}>
        Light for the day
      </div>
      <div className="mtext">{'“' + m[0] + '”'}</div>
      <div className="msrc">{m[1]}</div>
    </div>
  )
}
