import type { DayLog, Journal, MainState } from '../lib/storage'
import TodayJournal from '../components/journal/TodayJournal'
import DuaList from '../components/journal/DuaList'
import History from '../components/journal/History'

export default function JournalTab({
  day,
  main,
  dateKey,
  onSaveJournal,
  onUpdateMain,
}: {
  day: DayLog
  main: MainState
  dateKey: string
  onSaveJournal: (j: Journal) => void
  onUpdateMain: (next: MainState) => void
}) {
  return (
    <>
      <TodayJournal key={dateKey} journal={day.j} onSave={onSaveJournal} />
      <DuaList
        duas={main.duas}
        onAdd={(dua) => onUpdateMain({ ...main, duas: [...main.duas, dua] })}
        onRemove={(i) => onUpdateMain({ ...main, duas: main.duas.filter((_, ix) => ix !== i) })}
      />
      <History refreshKey={dateKey} />
    </>
  )
}
