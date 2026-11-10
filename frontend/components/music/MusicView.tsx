'use client'

import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import PageHeading from '@/components/subpage/PageHeading'
import SubpageBar from '@/components/subpage/SubpageBar'
import Tabs from '@/components/subpage/Tabs'
import { isModifiedClick } from '@/components/subpage/url'
import {
  ME,
  PAGE_TITLE,
  creditsOf,
  inSection,
  isMine,
  sections,
  type Collection,
  type Piece,
  type SectionKey,
} from '@/app/music/data'
import Cover from './Cover'
import DetailPanel from './DetailPanel'
import Drum from './Drum'
import { ClockIcon, CloseIcon, PauseIcon, PinIcon, PlayIcon } from './Icons'
import NowPlaying from './NowPlaying'
import Visualizer from './Visualizer'

const pad = (n: number) => String(n).padStart(2, '0')

function Eq() {
  return (
    <span className="cw-eq" aria-label="Now playing">
      <i />
      <i />
      <i />
    </span>
  )
}

/** A section's pieces: featured ones pinned to the top, the rest in catalogue order. */
function sectionList(pieces: Piece[], key: SectionKey) {
  return pieces.filter((p) => inSection(p, key)).sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
}

/**
 * The row's second line. Under Performances it says what I did; elsewhere,
 * the ensemble and composer — with my name in gold when I wrote it.
 */
function subtitle(p: Piece, section: SectionKey) {
  if (section === 'performance') return [p.role, p.performers ?? p.ensemble].filter(Boolean).join(' · ')
  if (isMine(p)) {
    return (
      <>
        {p.ensemble} · <span className="cw-me">{ME}</span>
      </>
    )
  }
  return p.composer ? `${p.ensemble} · ${p.composer}` : p.ensemble
}

const isSection = (k: string | null): k is SectionKey => sections.some((s) => s.key === k)
/** The tab the page opens on, whose URL is plain /music. */
const HOME = sections[0].key

/**
 * Phones and small tablets: the list is a plain list that scrolls with the
 * page, each piece opens in a sheet from the bottom, and the player is pinned
 * to the bottom of the screen. Matches the breakpoint in music.css.
 */
const PHONE_QUERY = '(max-width: 900px)'
const onPhoneChange = (cb: () => void) => {
  const m = window.matchMedia(PHONE_QUERY)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}
const isPhone = () => window.matchMedia(PHONE_QUERY).matches

/**
 * One row of the list. Memoised: focus is styled by the drum (aria-selected,
 * --f), so moving it doesn't re-render any rows.
 */
const Row = memo(function Row({
  p,
  collection,
  number,
  isNow,
  eq,
  section,
}: {
  p: Piece
  collection: Collection
  number: number
  isNow: boolean
  /** Show the playing bars in place of the number. */
  eq: boolean
  section: SectionKey
}) {
  return (
    <span className={`cw-grid cw-row-inner${p.audio ? ' has-audio' : ''}${isNow ? ' is-now' : ''}`}>
      <span className="cw-c-num">
        {eq ? (
          <Eq />
        ) : (
          <>
            {/* Pinned (featured) pieces show a pin where the number would be. */}
            {p.featured ? (
              <span className="cw-num cw-num-pin" aria-label="Pinned">
                <PinIcon />
              </span>
            ) : (
              <span className="cw-num">{pad(number)}</span>
            )}
            <span className="cw-num-play">{isNow ? <PauseIcon /> : <PlayIcon />}</span>
          </>
        )}
      </span>
      <Cover piece={p} palette={collection.palette} />
      <span className="cw-c-title">
        <span className="cw-t">
          {p.featured && <PinIcon className="cw-pin" />}
          {p.title}
        </span>
        <span className="cw-s">{subtitle(p, section)}</span>
      </span>
      <span className="cw-c-album">{collection.title}</span>
      <span className="cw-c-year">{p.year}</span>
      <span className="cw-c-dur">{p.duration}</span>
    </span>
  )
})

export default function MusicView({
  pieces,
  collections,
  background,
}: {
  pieces: Piece[]
  collections: Collection[]
  /** Optional photo behind everything, blurred and darkened. */
  background?: string
}) {
  const byCollection = useMemo(() => new Map(collections.map((c) => [c.id, c])), [collections])
  const bySlug = useMemo(() => new Map(pieces.map((p) => [p.slug, p])), [pieces])
  // One catalogue number per work, the same in every section.
  const numbers = useMemo(() => new Map(pieces.map((p, i) => [p.slug, i + 1])), [pieces])
  const counts = useMemo(
    () => Object.fromEntries(sections.map((s) => [s.key, pieces.filter((p) => inSection(p, s.key)).length])),
    [pieces],
  ) as Record<SectionKey, number>

  const [section, setSection] = useState<SectionKey>(HOME)
  const list = useMemo(() => sectionList(pieces, section), [pieces, section])
  const [slug, setSlug] = useState(() => sectionList(pieces, HOME)[0].slug)
  const index = Math.max(
    0,
    list.findIndex((p) => p.slug === slug),
  )
  const sectionInfo = sections.find((s) => s.key === section)!

  // The panel renders at lower priority, so a fast spin stays smooth.
  const shownSlug = useDeferredValue(slug)
  const shown = bySlug.get(shownSlug)!
  const shownCollection = byCollection.get(shown.collection)!
  const prevShown = useRef({ slug: shownSlug, dir: 'down' as 'up' | 'down' })
  if (prevShown.current.slug !== shownSlug) {
    const pos = (s: string) => list.findIndex((p) => p.slug === s)
    prevShown.current = { slug: shownSlug, dir: pos(shownSlug) >= pos(prevShown.current.slug) ? 'down' : 'up' }
  }

  // A new piece starts at its cover, not wherever the last one was scrolled to.
  const detailRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = detailRef.current
    if (el && el.scrollHeight > el.clientHeight && el.scrollTop > 0) el.scrollTop = 0
  }, [shownSlug])

  // ── Phones ───────────────────────────────────────────────────────────────
  /** The detail panel is a sheet that opens over the list. */
  const asSheet = useSyncExternalStore(onPhoneChange, isPhone, () => false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const opener = useRef<HTMLElement | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const closeSheet = useCallback(() => {
    setSheetOpen(false)
    opener.current?.focus({ preventScroll: true })
  }, [])

  // While the sheet is open the page behind it stays put, and focus moves in.
  useEffect(() => {
    if (!asSheet || !sheetOpen) return
    const html = document.documentElement
    const was = html.style.overflow
    html.style.overflow = 'hidden'
    closeRef.current?.focus({ preventScroll: true })
    return () => {
      html.style.overflow = was
    }
  }, [asSheet, sheetOpen])

  // Pull the sheet down from its top to close it.
  useEffect(() => {
    const el = detailRef.current
    if (!el || !asSheet) return
    let y0 = 0
    let t0 = 0
    let dy = 0
    let armed = false
    let dragging = false
    const start = (e: TouchEvent) => {
      armed = el.scrollTop <= 0
      dragging = false
      dy = 0
      y0 = e.touches[0].clientY
      t0 = e.timeStamp
    }
    const move = (e: TouchEvent) => {
      if (!armed) return
      dy = e.touches[0].clientY - y0
      if (!dragging) {
        if (dy < -4) armed = false // scrolling the sheet up, not pulling it down
        if (dy < 6) return
        dragging = true
        el.classList.add('is-dragging')
      }
      e.preventDefault()
      el.style.setProperty('--drag', `${Math.max(0, dy)}px`)
    }
    const end = (e: TouchEvent) => {
      if (!dragging) return
      dragging = false
      el.classList.remove('is-dragging')
      el.style.removeProperty('--drag')
      const v = dy / Math.max(1, e.timeStamp - t0) // px per ms
      if (dy > 110 || (dy > 30 && v > 0.6)) closeSheet()
    }
    el.addEventListener('touchstart', start, { passive: true })
    el.addEventListener('touchmove', move, { passive: false })
    el.addEventListener('touchend', end)
    el.addEventListener('touchcancel', end)
    return () => {
      el.removeEventListener('touchstart', start)
      el.removeEventListener('touchmove', move)
      el.removeEventListener('touchend', end)
      el.removeEventListener('touchcancel', end)
    }
  }, [asSheet, closeSheet])

  // ── Audio ────────────────────────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement>(null)
  const [nowSlug, setNowSlug] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const now = nowSlug ? bySlug.get(nowSlug)! : null

  // The background visualizer listens to the audio through an analyser. It can
  // only be created after a user gesture, so it's set up on the first play.
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const listen = () => {
    const audio = audioRef.current
    if (!audio) return
    if (!audioCtxRef.current) {
      try {
        const ctx = new AudioContext()
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 2048 // fine enough to split the bass into separate bars
        analyser.smoothingTimeConstant = 0.72
        analyser.minDecibels = -88
        analyser.maxDecibels = -22
        ctx.createMediaElementSource(audio).connect(analyser)
        analyser.connect(ctx.destination)
        audioCtxRef.current = ctx
        analyserRef.current = analyser
      } catch {
        return // no Web Audio: the music still plays, the visualizer just rests
      }
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume().catch(() => {})
  }

  const toggle = useCallback(
    (piece: Piece) => {
      const audio = audioRef.current
      if (!audio || !piece.audio) return
      listen()
      if (nowSlug === piece.slug) {
        if (audio.paused) audio.play().catch(() => {})
        else audio.pause()
        return
      }
      setNowSlug(piece.slug)
      setTime(0)
      setDuration(0)
      audio.src = piece.audio
      audio.currentTime = 0
      audio.play().catch(() => {})
    },
    [nowSlug],
  )

  const pause = () => audioRef.current?.pause()

  useEffect(() => {
    if (!now || !('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: now.title,
      artist: [...new Set(creditsOf(now).map((c) => c.name))].join(', '),
      album: byCollection.get(now.collection)?.title,
    })
  }, [now, byCollection])

  // ── Focus ────────────────────────────────────────────────────────────────
  /** Focus any piece; if it isn't in the current section, go back to the first tab. */
  const focus = useCallback(
    (s: string) => {
      const p = bySlug.get(s)
      if (!p) return
      setSection((cur) => (inSection(p, cur) ? cur : HOME))
      setSlug(s)
    },
    [bySlug],
  )

  /** Phones: show a piece in the sheet. */
  const openPiece = (s: string, from?: HTMLElement | null) => {
    opener.current = from ?? (document.activeElement as HTMLElement | null)
    focus(s)
    setSheetOpen(true)
  }

  const move = useCallback(
    (delta: number) => setSlug(list[Math.max(0, Math.min(list.length - 1, index + delta))].slug),
    [index, list],
  )

  // Switching sections keeps the focused piece if the new section has it.
  const changeSection = (k: SectionKey) => {
    if (k === section) return
    const next = sectionList(pieces, k)
    setSection(k)
    if (!next.some((p) => p.slug === slug)) setSlug(next[0].slug)
  }

  const selectSection = (e: React.MouseEvent, k: SectionKey) => {
    // Let modified clicks open a new tab like any link would.
    if (isModifiedClick(e)) return
    e.preventDefault()
    changeSection(k)
  }

  // Deep link: /music?c=<section>&piece=<slug>, kept in sync as you browse.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const c = q.get('c')
    if (isSection(c)) {
      setSection(c)
      setSlug((cur) => {
        const next = sectionList(pieces, c)
        return next.some((p) => p.slug === cur) ? cur : next[0].slug
      })
    }
    const want = q.get('piece')
    if (want) {
      focus(want)
      if (isPhone() && pieces.some((p) => p.slug === want)) setSheetOpen(true)
    }
  }, [focus, pieces])

  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    const t = window.setTimeout(() => {
      const q = new URLSearchParams(section === HOME ? {} : { c: section })
      q.set('piece', slug)
      window.history.replaceState(window.history.state, '', `?${q}`)
    }, 300)
    return () => window.clearTimeout(t)
  }, [slug, section])

  // Keys work anywhere on the page, except inside form controls and media.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, select, video, iframe, [contenteditable]')) return
      const onControl = !!el.closest('button, a')
      const piece = list[index]
      if (e.key === 'Escape') {
        if (!sheetOpen) return
        e.preventDefault()
        closeSheet()
        return
      }
      switch (e.key) {
        case 'ArrowDown':
        case 'j':
          move(1)
          break
        case 'ArrowUp':
        case 'k':
          move(-1)
          break
        case 'PageDown':
          move(5)
          break
        case 'PageUp':
          move(-5)
          break
        case 'Home':
          move(-list.length)
          break
        case 'End':
          move(list.length)
          break
        case 'Enter':
          if (onControl) return
          toggle(piece)
          break
        case ' ':
          if (onControl) return
          // Space is play/pause for whatever is loaded, like any player.
          if (now) toggle(now)
          else toggle(piece)
          break
        default:
          return
      }
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, list, move, now, toggle, sheetOpen, closeSheet])

  const focused = list[index]
  const palette = byCollection.get(focused.collection)!.palette

  // The player bar shows what's loaded or, before anything is, the focused
  // piece. Skipping walks the list it's in (this section, else everything), passing
  // over pieces with no recording.
  const barPiece = now ?? focused
  const queue = list.some((p) => p.slug === barPiece.slug) ? list : sectionList(pieces, 'all')
  const qi = queue.findIndex((p) => p.slug === barPiece.slug)
  const nextUp = queue.slice(qi + 1).find((p) => p.audio)
  const prevUp = queue
    .slice(0, qi)
    .reverse()
    .find((p) => p.audio)
  const seek = (t: number) => {
    if (audioRef.current) audioRef.current.currentTime = t
  }
  // Like any player: back restarts the track unless it's just begun.
  const skipBack = () => {
    if (now && (time > 3 || !prevUp)) seek(0)
    else if (prevUp) toggle(prevUp)
  }

  return (
    <div className="cw-root" style={{ '--c1': palette[0], '--c2': palette[1] } as React.CSSProperties}>
      {background && <div className="cw-photo" style={{ backgroundImage: `url(${background})` }} aria-hidden="true" />}
      <div className="cw-ambient" aria-hidden="true" />
      <div className="cw-grain" aria-hidden="true" />

      <div className="cw-app">
        {/* ── Left: the catalogue ─────────────────────────────────────── */}
        <section className="cw-browse" aria-label="Catalogue">
          <SubpageBar section={{ label: PAGE_TITLE, href: '/music' }} />
          <header className="page-head cw-head">
            <PageHeading eyebrow="Music by Jamie Seoh" title={PAGE_TITLE} count={pieces.length} />
            {/* A lone tab has nothing to switch to; the count is already on the title. */}
            {sections.length > 1 && (
              <Tabs
                label="Sections"
                active={section}
                onSelect={selectSection}
                items={sections.map((s) => ({
                  key: s.key,
                  label: s.label,
                  count: counts[s.key],
                  href: s.key === HOME ? '/music' : `/music?c=${s.key}`,
                }))}
              />
            )}
          </header>

          <div className="cw-cols cw-grid" aria-hidden="true">
            <span>#</span>
            <span />
            <span>Title</span>
            <span className="cw-c-album">Album</span>
            <span className="cw-c-year">Year</span>
            <span className="cw-c-dur">
              <ClockIcon />
            </span>
          </div>

          <div className="cw-stage" data-featured={focused.featured ? '' : undefined}>
            <Drum
              count={list.length}
              index={index}
              listKey={section}
              label={sectionInfo.label}
              rowKey={(i) => list[i].slug}
              rowId={(i) => `cw-row-${list[i].slug}`}
              onIndexChange={(i) => setSlug(list[i].slug)}
              onActivate={(i) => toggle(list[i])}
              renderRow={(i) => {
                const p = list[i]
                const isNow = nowSlug === p.slug
                return (
                  <Row
                    p={p}
                    collection={byCollection.get(p.collection)!}
                    number={numbers.get(p.slug)!}
                    isNow={isNow}
                    eq={isNow && playing}
                    section={section}
                  />
                )
              }}
            />

            {/* Index rail: one tick per piece, for jumping and for knowing where you are. */}
            {list.length >= 8 && (
              <nav className="cw-rail" aria-label="Jump to piece">
                {list.map((p, i) => (
                  <button
                    key={p.slug}
                    className={`${i === index ? 'is-on' : ''}${p.featured ? ' is-featured' : ''}` || undefined}
                    onClick={() => setSlug(p.slug)}
                    aria-label={p.title}
                    aria-current={i === index ? 'true' : undefined}
                    data-label={p.title}
                    tabIndex={-1}
                  />
                ))}
              </nav>
            )}
          </div>

          {/* Phones: the list as a plain list; a piece opens in the sheet. */}
          <ul className="cw-flat" aria-label={sectionInfo.label}>
            {list.map((p, i) => {
              const isNow = nowSlug === p.slug
              return (
                <li key={p.slug}>
                  <button
                    className="cw-flat-row"
                    aria-current={i === index ? 'true' : undefined}
                    data-featured={p.featured ? '' : undefined}
                    onClick={(e) => openPiece(p.slug, e.currentTarget)}
                  >
                    <Row
                      p={p}
                      collection={byCollection.get(p.collection)!}
                      number={numbers.get(p.slug)!}
                      isNow={isNow}
                      eq={isNow && playing}
                      section={section}
                    />
                  </button>
                </li>
              )
            })}
          </ul>

          <footer className="cw-foot">
            <Visualizer className="cw-viz" analyser={analyserRef} playing={playing} tint={focused.collection} />
            <NowPlaying
              piece={barPiece}
              collection={byCollection.get(barPiece.collection)!}
              loaded={!!now}
              playing={!!now && playing}
              time={time}
              duration={duration}
              onToggle={() => toggle(barPiece)}
              onPrev={now || prevUp ? skipBack : undefined}
              onNext={nextUp ? () => toggle(nextUp) : undefined}
              onSeek={seek}
              onShow={() => (asSheet ? openPiece(barPiece.slug) : focus(barPiece.slug))}
            />
          </footer>
        </section>

        {/* ── Right: the focused piece ────────────────────────────────── */}
        <aside
          ref={detailRef}
          className="cw-detail"
          aria-label={asSheet ? shown.title : 'Selected piece'}
          data-open={sheetOpen ? '' : undefined}
          {...(asSheet && { role: 'dialog', 'aria-modal': true, inert: !sheetOpen })}
        >
          {/* Phones: the sheet's handle and close button. */}
          <div className="cw-sheet-bar">
            <span className="cw-sheet-grip" aria-hidden="true" />
            <button ref={closeRef} className="cw-sheet-close" onClick={closeSheet} aria-label="Close">
              <CloseIcon />
            </button>
          </div>
          <p className="cw-sr" aria-live="polite">
            {focused.title}, {focused.categories.join(' and ')}, {focused.year}
          </p>
          <DetailPanel
            key={shown.slug}
            piece={shown}
            collection={shownCollection}
            dir={prevShown.current.dir}
            player={{ isCurrent: nowSlug === shown.slug, playing, time, duration }}
            onToggle={() => toggle(shown)}
            onSeek={seek}
            onVideoStart={pause}
          />
        </aside>
      </div>
      <div className="cw-scrim" data-open={sheetOpen ? '' : undefined} onClick={closeSheet} aria-hidden="true" />

      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          if (now && nextUp) toggle(nextUp) // carry on down the list, like any player
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
    </div>
  )
}
