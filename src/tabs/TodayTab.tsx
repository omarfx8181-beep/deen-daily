import { TASKS } from '../data/content'
import { dayOfYear } from '../lib/dates'
import { countDone } from '../lib/streak'
import { PRAYER_ORDER, formatTime, nextPrayer, timesFor, type GeoLocation } from '../lib/prayer'
import type { DayLog } from '../lib/storage'
import SectionNav from '../components/SectionNav'
import PrayerCard from '../components/today/PrayerCard'
import StreakRing from '../components/today/StreakRing'
import LessonCard from '../components/today/LessonCard'
import MotivCard from '../components/today/MotivCard'
import NameCard from '../components/today/NameCard'
import Checklist from '../components/today/Checklist'
import AdhkarAccordion from '../components/today/AdhkarAccordion'

export default function TodayTab({
  day,
  streakCount,
  location,
  onChangeLocation,
  onToggleTask,
}: {
  day: DayLog
  streakCount: number
  location: GeoLocation
  onChangeLocation: (loc: GeoLocation) => void
  onToggleTask: (id: string) => void
}) {
  const dayIndex = dayOfYear()
  const today = timesFor(location)
  const times = Object.fromEntries(PRAYER_ORDER.map((id) => [id, formatTime(today[id])]))
  const upcoming = nextPrayer(location)
  return (
    <>
      <StreakRing count={streakCount} done={countDone(day.c)} total={TASKS.length} />
      <SectionNav
        items={[
          { label: 'Prayers', id: 'prayers' },
          { label: 'Lesson', id: 'lesson' },
          { label: 'Light', id: 'light' },
          { label: 'Name', id: 'name' },
          { label: 'Practice', id: 'practice' },
          { label: 'Fortress', id: 'fortress' },
        ]}
      />
      <PrayerCard location={location} onChangeLocation={onChangeLocation} />
      <LessonCard dayIndex={dayIndex} />
      <MotivCard dayIndex={dayIndex} />
      <NameCard dayIndex={dayIndex} />
      <Checklist
        checks={day.c}
        times={times}
        nextPrayerId={upcoming.tomorrow ? undefined : upcoming.id}
        onToggle={onToggleTask}
      />
      <AdhkarAccordion />
    </>
  )
}
