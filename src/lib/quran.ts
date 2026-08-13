// Quran page math ported 1:1 from the prototype (604-page Madani mushaf).

import { SURAHS } from '../data/content'
import type { Surah } from '../data/content'

export const TOTAL_PAGES = 604

export const pageToJuz = (p: number) => (p <= 21 ? 1 : Math.min(30, Math.floor((p - 2) / 20) + 1))

export function surahAtPage(p: number): Surah {
  let s = SURAHS[0]
  for (const x of SURAHS) {
    if (x[4] <= p) s = x
    else break
  }
  return s
}

export const clampPage = (p: number) => Math.min(TOTAL_PAGES, Math.max(1, p))
