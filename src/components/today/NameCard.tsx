import { NAMES } from '../../data/content'

export default function NameCard({ dayIndex }: { dayIndex: number }) {
  const n = NAMES[dayIndex % NAMES.length]
  return (
    <div className="name-card">
      <div className="name-ar">{n[0]}</div>
      <div className="name-info">
        <div className="tr">{n[1]}</div>
        <div className="mn">{n[2]}</div>
      </div>
    </div>
  )
}
