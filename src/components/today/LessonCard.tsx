import { HADITH, SOURCES } from '../../data/content'

export default function LessonCard({ dayIndex }: { dayIndex: number }) {
  const h = HADITH[dayIndex % HADITH.length]
  return (
    <div className="mihrab" id="lesson">
      <div className="eyebrow">Today's Lesson · Nawawi's Forty</div>
      <div className="hnum">Hadith {h[0]} of 42</div>
      <div className="htitle">{h[1]}</div>
      <div className="htext">{'“' + h[2] + '”'}</div>
      <div className="hlesson">{h[3]}</div>
      <div className="haction">
        <b>Apply it today</b>
        <span>{h[4]}</span>
      </div>
      <div className="hsource">Source: {SOURCES[h[0] - 1]}</div>
    </div>
  )
}
