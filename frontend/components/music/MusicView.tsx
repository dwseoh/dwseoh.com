'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { audioSrc, type Collection, type Section, type Track } from '@/app/music/data'
import Cover from './Cover'
import PlayerBar from './PlayerBar'
import { PauseIcon, PlayIcon, ShuffleIcon, ArrowLeftIcon, NoteIcon, ExternalIcon } from './Icons'

export interface QueueItem {
  track: Track
  collection: Collection
}

interface Props {
  sections: Section[]
  intro: { eyebrow: string; title: string; body: string }
  background: string
}

export default function MusicView({ sections, intro, background }: Props) {
  const collections = useMemo(() => sections.flatMap((s) => s.collections), [sections])
  const queue = useMemo<QueueItem[]>(
    () => collections.flatMap((collection) => collection.tracks.map((track) => ({ track, collection }))),
    [collections],
  )

  const audioRef = useRef<HTMLAudioElement>(null)
  const [current, setCurrent] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.9)
  const [missing, setMissing] = useState<Set<string>>(() => new Set())
  const [openNotes, setOpenNotes] = useState<Set<string>>(() => new Set())

  const playIndex = useCallback(
    (i: number) => {
      const audio = audioRef.current
      if (!audio) return
      if (i === current) {
        if (audio.paused) audio.play().catch(() => {})
        else audio.pause()
        return
      }
      const { track } = queue[i]
      setCurrent(i)
      setTime(0)
      setDuration(0)
      audio.src = audioSrc(track)
      audio.play().catch(() => {})
    },
    [current, queue],
  )

  const step = useCallback(
    (dir: 1 | -1) => {
      if (current === null) return
      const audio = audioRef.current
      if (dir === -1 && audio && audio.currentTime > 3) {
        audio.currentTime = 0
        return
      }
      for (let i = current + dir; i >= 0 && i < queue.length; i += dir) {
        if (!missing.has(queue[i].track.slug)) return playIndex(i)
      }
    },
    [current, missing, playIndex, queue],
  )

  const shuffle = () => {
    const pool = queue.map((_, i) => i).filter((i) => i !== current && !missing.has(queue[i].track.slug))
    if (pool.length) playIndex(pool[Math.floor(Math.random() * pool.length)])
  }

  const seek = (t: number) => {
    if (audioRef.current) audioRef.current.currentTime = t
  }

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  // Space toggles playback when focus isn't on something that wants it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || current === null) return
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, button, a, [contenteditable]')) return
      e.preventDefault()
      playIndex(current)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, playIndex])

  // Lock-screen / media-key controls.
  useEffect(() => {
    if (current === null || !('mediaSession' in navigator)) return
    const { track, collection } = queue[current]
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: 'Jamie Seoh',
      album: collection.title,
    })
    navigator.mediaSession.setActionHandler('nexttrack', () => step(1))
    navigator.mediaSession.setActionHandler('previoustrack', () => step(-1))
  }, [current, queue, step])

  const toggleNote = (slug: string) =>
    setOpenNotes((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })

  const currentItem = current === null ? null : queue[current]
  const totalPieces = queue.length
  // Where each collection's first track sits in the flat queue, and its
  // position overall (for the "Vol. 0n" on its cover).
  const starts = new Map<string, { start: number; vol: number }>()
  collections.reduce((start, c, vol) => {
    starts.set(c.slug, { start, vol })
    return start + c.tracks.length
  }, 0)

  return (
    <div className="mus-root" style={{ '--mus-bg-url': `url("${background}")` } as React.CSSProperties}>
      <div className="mus-bg" aria-hidden="true">
        <div className="mus-bg-image" />
        <div className="mus-bg-tint" />
        <div className="mus-bg-grain" />
      </div>

      <header className="mus-topbar">
        <Link href="/" className="mus-back">
          <ArrowLeftIcon /> dwseoh.com
        </Link>
        <nav className="mus-sections" aria-label="Sections">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.title}
            </a>
          ))}
        </nav>
      </header>

      <main className="mus-main">
        <section className="mus-hero">
          <p className="mus-eyebrow">{intro.eyebrow}</p>
          <h1 className="mus-title">{intro.title}</h1>
          <p className="mus-intro">{intro.body}</p>
          <div className="mus-hero-actions">
            <button className="mus-play-big" onClick={() => playIndex(0)} aria-label="Play all">
              {playing && current !== null ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button className="mus-ghost" onClick={shuffle}>
              <ShuffleIcon /> Shuffle
            </button>
            <span className="mus-stats">
              {totalPieces} pieces · {collections.length} collections
            </span>
          </div>
        </section>

        {sections.map((section, si) => (
          <section key={section.id} id={section.id} className="mus-section">
            <header className="mus-section-head">
              <span className="mus-section-num">{String(si + 1).padStart(2, '0')}</span>
              <div>
                <h2 className="mus-section-title">{section.title}</h2>
                <p className="mus-section-blurb">{section.blurb}</p>
              </div>
            </header>

            {section.collections.length > 1 && (
              <div className="mus-shelf">
                {section.collections.map((c) => (
                  <a key={c.slug} href={`#${c.slug}`} className="mus-shelf-card">
                    <Cover collection={c} index={starts.get(c.slug)!.vol} />
                    <span className="mus-shelf-title">{c.title}</span>
                    <span className="mus-shelf-meta">
                      {c.kind} · {c.tracks.length} pieces
                    </span>
                  </a>
                ))}
              </div>
            )}

            {section.collections.map((c) => {
              const { start, vol: ci } = starts.get(c.slug)!
              const collectionPlaying =
                playing && current !== null && current >= start && current < start + c.tracks.length

              return (
                <article key={c.slug} id={c.slug} className="mus-album">
                  <div className="mus-album-head">
                    <Cover collection={c} index={ci} large />
                    <div className="mus-album-text">
                      <p className="mus-eyebrow">{c.kind}</p>
                      <h3 className="mus-album-title">{c.title}</h3>
                      <p className="mus-blurb">{c.blurb}</p>
                      <p className="mus-album-meta">
                        <strong>Jamie Seoh</strong> · {c.years} · {c.tracks.length} pieces
                      </p>
                    </div>
                  </div>

                  <div className="mus-album-actions">
                    <button
                      className="mus-play-big"
                      onClick={() => (collectionPlaying ? playIndex(current!) : playIndex(start))}
                      aria-label={collectionPlaying ? `Pause ${c.title}` : `Play ${c.title}`}
                    >
                      {collectionPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                  </div>

                  <ol className="mus-tracks">
                    {c.tracks.map((t, ti) => {
                      const qi = start + ti
                      const isCurrent = qi === current
                      const isMissing = missing.has(t.slug)
                      const noteOpen = openNotes.has(t.slug)
                      return (
                        <li
                          key={t.slug}
                          className={`mus-track${isCurrent ? ' is-current' : ''}${isMissing ? ' is-missing' : ''}`}
                        >
                          <div className="mus-track-row">
                            <button className="mus-track-main" onClick={() => playIndex(qi)}>
                              <span className="mus-track-num">
                                {isCurrent && playing ? (
                                  <span className="mus-eq" aria-label="Now playing">
                                    <i />
                                    <i />
                                    <i />
                                  </span>
                                ) : (
                                  <>
                                    <span className="mus-num-text">{ti + 1}</span>
                                    <span className="mus-num-play">
                                      {isCurrent ? <PauseIcon /> : <PlayIcon />}
                                    </span>
                                  </>
                                )}
                              </span>
                              <span className="mus-track-text">
                                <span className="mus-track-title">{t.title}</span>
                                <span className="mus-track-sub">
                                  {isMissing ? 'Audio coming soon' : t.ensemble}
                                </span>
                              </span>
                            </button>
                            <span className="mus-track-year">{t.year ?? ''}</span>
                            <span className="mus-track-actions">
                              {t.links?.map((l) => (
                                <a
                                  key={l.href}
                                  href={l.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mus-icon-btn"
                                  title={l.label}
                                  aria-label={`${l.label} — ${t.title}`}
                                >
                                  <ExternalIcon />
                                </a>
                              ))}
                              {t.note && (
                                <button
                                  className={`mus-icon-btn${noteOpen ? ' is-on' : ''}`}
                                  onClick={() => toggleNote(t.slug)}
                                  aria-expanded={noteOpen}
                                  aria-label={`Notes on ${t.title}`}
                                  title="Notes"
                                >
                                  <NoteIcon />
                                </button>
                              )}
                            </span>
                            <span className="mus-track-dur">{t.duration ?? '—'}</span>
                          </div>
                          {t.note && noteOpen && <p className="mus-track-note">{t.note}</p>}
                        </li>
                      )
                    })}
                  </ol>
                </article>
              )
            })}
          </section>
        ))}

        <footer className="mus-footer">
          <p>Scores and parts available on request — say hi.</p>
          <Link href="/">← Back to dwseoh.com</Link>
        </footer>
      </main>

      <PlayerBar
        item={currentItem}
        index={current}
        playing={playing}
        missing={currentItem ? missing.has(currentItem.track.slug) : false}
        time={time}
        duration={duration}
        volume={volume}
        onToggle={() => (current === null ? playIndex(0) : playIndex(current))}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        onSeek={seek}
        onVolume={setVolume}
      />

      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => step(1)}
        onError={() => {
          setPlaying(false)
          if (currentItem) setMissing((prev) => new Set(prev).add(currentItem.track.slug))
        }}
      />
    </div>
  )
}
