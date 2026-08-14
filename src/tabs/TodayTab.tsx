import { TASKS } from '../data/content'
import { dayOfYear } from '../lib/dates'
import { countDone } from '../lib/streak'
import type { DayLog } from '../lib/storage'
import SectionNav from '../components/SectionNav'
import StreakRing from '../components/today/StreakRing'
import LessonCard from '../components/today/LessonCard'
import MotivCard from '../components/today/MotivCard'
import NameCard from '../components/today/NameCard'
import Checklist from '../components/today/Checklist'
import AdhkarAccordion from '../components/today/AdhkarAccordion'

export default function TodayTab({
  day,
  streakCount,
  onToggleTask,
}: {
  day: DayLog
  streakCount: number
  onToggleTask: (id: string) => void
}) {
  const dayIndex = dayOfYear()
  return (
    <>
      <StreakRing count={streakCount} done={countDone(day.c)} total={TASKS.length} />
      <SectionNav
        items={[
          { label: 'Lesson', id: 'lesson' },
          { label: 'Light', id: 'light' },
          { label: 'Name', id: 'name' },
          { label: 'Practice', id: 'practice' },
          { label: 'Fortress', id: 'fortress' },
        ]}
      />
      <LessonCard dayIndex={dayIndex} />
      <MotivCard dayIndex={dayIndex} />
      <NameCard dayIndex={dayIndex} />
      <Checklist checks={day.c} onToggle={onToggleTask} />
      <AdhkarAccordion />
    </>
  )
}
