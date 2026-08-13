import { describe, expect, it } from 'vitest'
import { applyJournal } from './journal'
import type { DayLog } from './storage'

const emptyDay = (): DayLog => ({ c: {}, j: null })

describe('applyJournal (prototype parity)', () => {
  it('stores the journal and marks the journal task when any field has content', () => {
    const d = applyJournal(emptyDay(), { g: ['sun', '', ''], r: '', f: '' })
    expect(d.j).toEqual({ g: ['sun', '', ''], r: '', f: '' })
    expect(d.c.journal).toBe(true)
  })

  it('marks the task for reflection or free text too', () => {
    expect(applyJournal(emptyDay(), { g: ['', '', ''], r: 'thought', f: '' }).c.journal).toBe(true)
    expect(applyJournal(emptyDay(), { g: ['', '', ''], r: '', f: 'note' }).c.journal).toBe(true)
  })

  it('does not mark the task for an all-empty journal', () => {
    const d = applyJournal(emptyDay(), { g: ['', '  ', ''], r: ' ', f: '' })
    expect(d.c.journal).toBeUndefined()
  })

  it('never un-marks a journal task that is already done', () => {
    const day: DayLog = { c: { journal: true }, j: { g: ['x', '', ''], r: '', f: '' } }
    const d = applyJournal(day, { g: ['', '', ''], r: '', f: '' })
    expect(d.c.journal).toBe(true)
  })

  it('does not mutate the input day', () => {
    const day = emptyDay()
    applyJournal(day, { g: ['a', '', ''], r: '', f: '' })
    expect(day.j).toBeNull()
    expect(day.c.journal).toBeUndefined()
  })
})
