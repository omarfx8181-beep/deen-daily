import { afterEach, describe, expect, it, vi } from 'vitest'
import { ayahAudioUrl, loadSurah } from './quranText'

const surah = (n: number) => ({
  n,
  name: 'Al-Fatiha',
  meaning: 'The Opening',
  ayahs: 1,
  startPage: 1,
  verses: [{ i: 1, ar: 'ا', tr: 'a', en: 'A' }],
})

describe('ayahAudioUrl', () => {
  it('zero-pads surah and ayah to the EveryAyah scheme', () => {
    expect(ayahAudioUrl(1, 1)).toBe('https://everyayah.com/data/Husary_128kbps/001001.mp3')
    expect(ayahAudioUrl(2, 255)).toBe('https://everyayah.com/data/Husary_128kbps/002255.mp3')
    expect(ayahAudioUrl(114, 6)).toBe('https://everyayah.com/data/Husary_128kbps/114006.mp3')
  })
})

describe('loadSurah', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches once and serves repeats from cache', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(surah(3))))
    vi.stubGlobal('fetch', fetchMock)
    const a = await loadSurah(3)
    const b = await loadSurah(3)
    expect(a.n).toBe(3)
    expect(b).toBe(a)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('dedupes concurrent requests for the same surah', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(surah(4))))
    vi.stubGlobal('fetch', fetchMock)
    const [a, b] = await Promise.all([loadSurah(4), loadSurah(4)])
    expect(a).toBe(b)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('rejects on HTTP errors and allows a later retry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('nope', { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(surah(5))))
    vi.stubGlobal('fetch', fetchMock)
    await expect(loadSurah(5)).rejects.toThrow('HTTP 404')
    await expect(loadSurah(5)).resolves.toMatchObject({ n: 5 })
  })
})
