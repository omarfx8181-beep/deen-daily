import { useEffect, useRef, useState } from 'react'
import { SURAHS } from '../../data/content'
import { ayahAudioUrl, loadSurah, type SurahText } from '../../lib/quranText'

type Display = { arabic: boolean; translit: boolean; english: boolean }

export default function Reader({
  surah,
  onChangeSurah,
}: {
  surah: number
  onChangeSurah: (n: number) => void
}) {
  const [text, setText] = useState<SurahText | null>(null)
  const [error, setError] = useState('')
  const [show, setShow] = useState<Display>({ arabic: true, translit: true, english: true })
  const [playing, setPlaying] = useState<number | null>(null)
  const [repeats, setRepeats] = useState('1')
  const [audioError, setAudioError] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const leftRef = useRef(0)

  useEffect(() => {
    let cancelled = false
    setText(null)
    setError('')
    loadSurah(surah)
      .then((s) => {
        if (!cancelled) setText(s)
      })
      .catch(() => {
        if (!cancelled) setError('This surah is not downloaded yet and you appear to be offline.')
      })
    return () => {
      cancelled = true
    }
  }, [surah])

  // Stop any playback when the surah changes or the reader unmounts, and
  // clear the playing/error state with it — otherwise an unrelated ayah in
  // the new surah renders as "playing" and needs two taps to start.
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
      setPlaying(null)
      setAudioError('')
    }
  }, [surah])

  const stop = () => {
    audioRef.current?.pause()
    audioRef.current = null
    setPlaying(null)
  }

  const play = (ayah: number) => {
    if (playing === ayah) {
      stop()
      return
    }
    audioRef.current?.pause()
    setAudioError('')
    const el = new Audio(ayahAudioUrl(surah, ayah))
    audioRef.current = el
    leftRef.current = Math.max(1, parseInt(repeats) || 1)
    el.onended = () => {
      leftRef.current -= 1
      if (leftRef.current > 0 && audioRef.current === el) {
        el.currentTime = 0
        void el.play()
      } else {
        setPlaying(null)
      }
    }
    el.onerror = () => {
      setAudioError('Recitation needs a connection the first time — check your signal and retry.')
      setPlaying(null)
    }
    setPlaying(ayah)
    void el.play().catch(() => {
      setAudioError('Recitation could not start on this device.')
      setPlaying(null)
    })
  }

  const meta = SURAHS[surah - 1]

  return (
    <section id="reader">
      <h2>Read the Qur'an</h2>
      <div className="qrow">
        <select
          value={surah}
          onChange={(e) => onChangeSurah(Number(e.target.value))}
          aria-label="Surah"
        >
          {SURAHS.map((s) => (
            <option key={s[0]} value={s[0]}>
              {s[0]}. {s[1]} — {s[2]}
            </option>
          ))}
        </select>
        <button className="btn small" onClick={() => onChangeSurah(Math.max(1, surah - 1))}>
          ‹ prev
        </button>
        <button className="btn small" onClick={() => onChangeSurah(Math.min(114, surah + 1))}>
          next ›
        </button>
      </div>

      <div className="reader-toggles">
        {(
          [
            ['arabic', 'Arabic'],
            ['translit', 'Say it'],
            ['english', 'Meaning'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            className={'pill' + (show[key] ? ' on' : '')}
            aria-pressed={show[key]}
            onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
          >
            {label}
          </button>
        ))}
        <label className="repeat-row">
          repeat
          <select value={repeats} onChange={(e) => setRepeats(e.target.value)} aria-label="Repeat count">
            <option value="1">1×</option>
            <option value="3">3×</option>
            <option value="5">5×</option>
            <option value="10">10× (hifz)</option>
          </select>
        </label>
      </div>

      {audioError ? <p className="muted">{audioError}</p> : null}
      {error ? <p className="muted">{error}</p> : null}
      {!text && !error ? <p className="muted">Loading {meta?.[1]}…</p> : null}

      {text && (
        <div className="ayah-list">
          <p className="muted reader-head">
            {text.n}. {text.name} — {text.meaning} · {text.ayahs} ayat · page {text.startPage}
          </p>
          {show.translit && (
            <p className="muted translit-note">
              Reading the "Say it" line: Tanzil writes the letter ʿayn as <b>AA</b> (alAAalameen =
              al-ʿālamīn) and doubles vowels for long ones. Recitation needs a connection the first
              time.
            </p>
          )}
          {text.verses.map((v) => (
            <div className={'ayah' + (playing === v.i ? ' playing' : '')} key={v.i}>
              <div className="ayah-head">
                <span className="pill">{text.n}:{v.i}</span>
                <button
                  className="btn small"
                  onClick={() => play(v.i)}
                  aria-label={playing === v.i ? `Stop ayah ${v.i}` : `Play ayah ${v.i}`}
                >
                  {playing === v.i ? '■ stop' : '▶ listen'}
                </button>
              </div>
              {show.arabic && <div className="ar">{v.ar}</div>}
              {show.translit && <div className="translit">{v.tr}</div>}
              {show.english && <div className="meaning">{v.en}</div>}
            </div>
          ))}
          <p className="muted reader-foot">
            Arabic: King Fahd Complex (Uthmani) · Transliteration: Tanzil · Translation: Saheeh
            International · Recitation: Al-Husary
          </p>
        </div>
      )}
    </section>
  )
}
