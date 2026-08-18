import { useEffect, useState } from 'react'
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
  reminders,
  onChangeLocation,
  onChangeReminders,
  onToggleTask,
}: {
  day: DayLog
  streakCount: number
  location: GeoLocation
  reminders: boolean
  onChangeLocation: (loc: GeoLocation) => void
  onChangeReminders: (on: boolean) => void
  onToggleTask: (id: string) => void
}) {
  const dayIndex = dayOfYear()
  // Re-render on a slow tick so the times and the "next prayer" highlight
  // move on their own instead of freezing until some unrelated state changes.
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])
  const today = timesFor(location, now)
  const times = Object.fromEntries(
    PRAYER_ORDER.map((id) => [
      id,
      Number.isNaN(today[id].getTime()) ? '' : formatTime(today[id]),
    ]),
  )
  const upcoming = nextPrayer(location, now)
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
      <PrayerCard
        location={location}
        reminders={reminders}
        onChangeLocation={onChangeLocation}
        onChangeReminders={onChangeReminders}
      />
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
