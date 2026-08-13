// Date helpers ported 1:1 from the prototype. dayOfYear keeps the
// prototype's exact formula (including its DST behavior) so the daily
// hadith/motivation/name rotation matches the prototype on every date.

const keyOf = (d: Date) =>
  d.getFullYear() +
  '-' +
  String(d.getMonth() + 1).padStart(2, '0') +
  '-' +
  String(d.getDate()).padStart(2, '0')

export const todayKey = () => keyOf(new Date())

export const yesterdayKey = () => {
  const y = new Date()
  y.setDate(y.getDate() - 1)
  return keyOf(y)
}

export const dayOfYear = () => {
  const d = new Date()
  return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 864e5)
}
