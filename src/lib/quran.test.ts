import { describe, expect, it } from 'vitest'
import { clampPage, pageToJuz, surahAtPage } from './quran'

describe('pageToJuz (prototype parity)', () => {
  it('maps boundary pages like the prototype formula', () => {
    expect(pageToJuz(1)).toBe(1)
    expect(pageToJuz(21)).toBe(1)
    expect(pageToJuz(22)).toBe(2)
    expect(pageToJuz(41)).toBe(2)
    expect(pageToJuz(42)).toBe(3)
    expect(pageToJuz(604)).toBe(30)
  })
})

describe('surahAtPage', () => {
  it('returns the surah whose start page is at or before the page', () => {
    expect(surahAtPage(1)[1]).toBe('Al-Fatiha')
    expect(surahAtPage(2)[1]).toBe('Al-Baqarah')
    expect(surahAtPage(49)[1]).toBe('Al-Baqarah')
    expect(surahAtPage(50)[1]).toBe('Aal-Imran')
    expect(surahAtPage(603)[1]).toBe('Al-Masad')
    expect(surahAtPage(604)[1]).toBe('An-Nas')
  })
})

describe('clampPage', () => {
  it('clamps to 1..604', () => {
    expect(clampPage(0)).toBe(1)
    expect(clampPage(1)).toBe(1)
    expect(clampPage(605)).toBe(604)
    expect(clampPage(300)).toBe(300)
  })
})
