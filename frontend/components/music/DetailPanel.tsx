'use client'

import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { ME, categoryLabel, creditsOf, genreOf, type Collection, type Piece } from '@/app/music/data'
import Cover from './Cover'
import { ArrowUpRightIcon, LinkIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon, ScoreIcon } from './Icons'

export interface PlayerState {
  /** This piece is the one loaded in the audio element. */
  isCurrent: boolean
  playing: boolean
  time: number
  duration: number
}

export function fmt(s: number) {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

/** A time in a YouTube link, in seconds: `t=`/`start=` (where it starts) or `end=`. */
function youtubeTime(url: string, ...keys: string[]) {
  const m = url.match(new RegExp(`[?&#](?:${keys.join('|')})=(\\d+)s?(?:&|$)`))
  return m ? Number(m[1]) : 0
}

function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)
  return m ? m[1] : /^[\w-]{11}$/.test(url) ? url : null
}

const pad = (n: number) => String(n).padStart(2, '0')

/** A description paragraph, with `[text](url)` turned into a link. */
function prose(text: string) {
  return text.split(/(\[[^\]]+\]\([^)\s]+\))/).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
    return m ? (
      <a key={i} href={m[2]} target="_blank" rel="noreferrer">
        {m[1]}
      </a>
    ) : (
      part
    )
  })
}

// About this many lines show before "… more".
const ABOUT_LINES = 6
// How many characters fade out before the cut.
const FADE_CHARS = 10

/** Words of a paragraph, keeping each [text](url) link whole. */
const words = (para: string) => para.match(/\[[^\]]+\]\([^)\s]+\)|\S+/g) ?? []
/** Plain text of a word, for measuring. */
const plain = (w: string) => w.replace(/^\[([^\]]+)\]\([^)\s]+\)/, '$1')

/**
 * The description, cut after a few lines with a quiet "… more" at the end of
 * the last one. Where to cut is measured: the most words that still fit.
 */
function About({ text }: { text: string }) {
  const paras = text.split('\n\n').map(words)
  const total = paras.reduce((n, p) => n + p.length, 0)
  const boxRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  // How many words show while it's cut; null when it all fits.
  const [cut, setCut] = useState<number | null>(null)
  const [open, setOpen] = useState(false)

  useLayoutEffect(() => {
    const box = boxRef.current
    const m = measureRef.current
    if (!box || !m) return
    let width = -1
    const fit = () => {
      if (box.clientWidth === width) return
      width = box.clientWidth
      // Lay out the first `k` words, plus the "… more", in the hidden copy.
      const addMore = (p: HTMLElement) => {
        p.append('… ')
        const b = document.createElement('span')
        b.className = 'cw-d-more'
        b.textContent = 'more'
        p.append(b)
      }
      const render = (k: number, more: boolean) => {
        m.textContent = ''
        let left = k
        for (const ws of paras) {
          if (left <= 0) break
          const p = document.createElement('p')
          p.className = 'cw-d-desc'
          p.textContent = ws.slice(0, left).map(plain).join(' ')
          if (more && left < ws.length) addMore(p)
          left -= ws.length
          m.appendChild(p)
        }
        if (more && left >= 0) addMore(m.lastChild as HTMLElement)
        return m.scrollHeight
      }
      const p0 = document.createElement('p')
      p0.className = 'cw-d-desc'
      m.textContent = ''
      m.appendChild(p0)
      p0.textContent = 'x'
      const line = parseFloat(getComputedStyle(p0).lineHeight) || 24
      const gap = m.scrollHeight - line // the first paragraph's top margin
      // Room for ABOUT_LINES lines, plus the breaks between the paragraphs shown.
      const room = () => gap + line * ABOUT_LINES + 12 * (m.children.length - 1) + 1
      // Only cut when it hides more than a line.
      if (render(total, false) <= room() + line * 1.2) {
        m.textContent = ''
        setCut(null)
        return
      }
      let lo = 1
      let hi = total - 1
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2)
        const h = render(mid, true)
        if (h <= room()) lo = mid
        else hi = mid - 1
      }
      m.textContent = ''
      setCut(lo)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    return () => ro.disconnect()
    // The text is fixed for a mounted panel (it's keyed by piece).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cutting = cut !== null && !open
  const more = (
    <button className="cw-d-more" onClick={() => setOpen(!open)} aria-expanded={open}>
      {open ? 'less' : 'more'}
    </button>
  )
  // Where each paragraph starts, counted in words.
  const starts = paras.map((_, i) => paras.slice(0, i).reduce((n, p) => n + p.length, 0))
  return (
    <div ref={boxRef} className="cw-d-about">
      {paras.map((ws, i) => {
        // Words of this paragraph that are shown.
        const room = (cutting ? cut : Infinity) - starts[i]
        if (room <= 0) return null
        const shown = ws.slice(0, room)
        const last = cutting ? room <= ws.length : i === paras.length - 1
        const body = shown.join(' ')
        const ends = /[.!?…]$/.test(plain(shown[shown.length - 1] ?? ''))
        // Where it's cut, the last few characters fade out into the "…".
        const fade =
          cutting &&
          last &&
          !/\]\([^)]*$|\[[^\]]*$/.test(body.slice(0, -FADE_CHARS)) &&
          !body.slice(-FADE_CHARS).includes('](')
        return (
          <p key={i} className="cw-d-desc">
            {fade ? (
              <>
                {prose(body.slice(0, -FADE_CHARS))}
                <span className="cw-d-fade">
                  {body.slice(-FADE_CHARS)}
                  {ends ? '' : '…'}
                </span>{' '}
                {more}
              </>
            ) : (
              <>
                {prose(body)}
                {cut !== null && last && (
                  <>
                    {cutting && !ends ? '… ' : ' '}
                    {more}
                  </>
                )}
              </>
            )}
          </p>
        )
      })}
      <div ref={measureRef} className="cw-d-measure" aria-hidden="true" />
    </div>
  )
}

interface Props {
  piece: Piece
  collection: Collection
  /** Which way the drum moved to get here: the new piece slides in from it. */
  dir: 'up' | 'down'
  player: PlayerState
  onToggle: () => void
  onSeek: (t: number) => void
  onVideoStart: () => void
  /** Phones: a full "now playing" view, with the details underneath. */
  playingView?: boolean
  /** Absent when there's nothing to skip to. */
  onPrev?: () => void
  onNext?: () => void
}

/**
 * Kept lean so a piece fits without scrolling: an album-style header (cover
 * beside the title, album and credits, centred on it), the player, the note,
 * one small facts grid, and media tiles. Featured shows on the cover itself;
 * my name is gold wherever I'm the composer.
 */
export default function DetailPanel({
  piece,
  collection,
  dir,
  player,
  onToggle,
  onSeek,
  onVideoStart,
  playingView = false,
  onPrev,
  onNext,
}: Props) {
  const perf = piece.categories.includes('performance')
  // One line per role, e.g. two composers share "Composers".
  const credits = creditsOf(piece)
  const roles = [...new Set(credits.map((c) => c.role))].map((role) => ({
    role,
    names: credits.filter((c) => c.role === role).map((c) => c.name),
  }))
  const hasMedia = piece.video || piece.score || piece.links?.length

  // The video opens in place of its tile; the player row can open it too.
  const [watching, setWatching] = useState(false)
  const mediaRef = useRef<HTMLElement>(null)
  const watch = () => {
    onVideoStart()
    setWatching(true)
    requestAnimationFrame(() => mediaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
  }

  const facts: [string, React.ReactNode][] = [
    ['Year', piece.year],
    ['Genre', genreOf(piece, collection)],
    ...(piece.key ? [['Key', piece.key] as [string, string]] : []),
    ...(perf && piece.role ? [['Role', piece.role] as [string, string]] : []),
    ...(perf && piece.performers ? [['Performed by', piece.performers] as [string, string]] : []),
    ...(perf && piece.venue ? [['Venue', piece.venue] as [string, string]] : []),
  ]

  const names = (list: string[]) =>
    list.map((n, i) => (
      <Fragment key={n}>
        {i > 0 && ', '}
        {n === ME ? <span className="cw-me">{n}</span> : n}
      </Fragment>
    ))

  if (playingView) {
    const artists = [...new Set(credits.map((c) => c.name))]
    return (
      <article className="cw-d is-pv" data-dir={dir} aria-label={piece.title}>
        <div className="cw-pv-art">
          <Cover piece={piece} palette={collection.palette} size="lg" featured={piece.featured} />
        </div>
        <header className="cw-pv-head">
          <h2 className="cw-d-title">{piece.title}</h2>
          <p className="cw-pv-sub">{names(artists)}</p>
        </header>

        {piece.audio ? (
          <Transport
            player={player}
            piece={piece}
            onToggle={onToggle}
            onSeek={onSeek}
            onPrev={onPrev}
            onNext={onNext}
          />
        ) : (
          <Player
            piece={piece}
            player={player}
            onToggle={onToggle}
            onSeek={onSeek}
            onWatch={piece.video ? watch : undefined}
          />
        )}

        <h3 className="cw-label cw-pv-about">About</h3>
        <About text={piece.description} />

        <dl className="cw-facts">
          <div className="is-wide">
            <dt>Album</dt>
            <dd>{collection.title}</dd>
          </div>
          {roles.map(({ role, names: who }) => (
            <div key={role} className={who.length > 1 ? 'is-wide' : undefined}>
              <dt>{who.length > 1 ? `${role}s` : role}</dt>
              <dd>{names(who)}</dd>
            </div>
          ))}
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          <div className="is-wide">
            <dt>Instrumentation</dt>
            <dd>{piece.instrumentation ?? piece.ensemble}</dd>
          </div>
        </dl>

        {hasMedia && (
          <section ref={mediaRef} className="cw-d-sec">
            <h3 className="cw-label">Watch &amp; read</h3>
            <Media
              piece={piece}
              palette={collection.palette}
              watching={watching}
              onWatch={watch}
              onVideoStart={onVideoStart}
            />
          </section>
        )}
      </article>
    )
  }

  return (
    <article className="cw-d" data-dir={dir} aria-label={piece.title}>
      <header className="cw-d-hero">
        <div className="cw-d-art">
          <Cover piece={piece} palette={collection.palette} size="lg" featured={piece.featured} />
        </div>
        <div className="cw-d-head">
          <p className="cw-d-kicker">{piece.categories.map((c) => categoryLabel[c]).join(' · ')}</p>
          <h2 className="cw-d-title">{piece.title}</h2>
          {piece.source && (
            <p className="cw-d-source">
              from <em>{piece.source}</em>
            </p>
          )}
          <dl className="cw-d-credits">
            <div>
              <dt>Album</dt>
              <dd>{collection.title}</dd>
            </div>
            {roles.map(({ role, names: who }) => (
              <div key={role}>
                <dt>{who.length > 1 ? `${role}s` : role}</dt>
                <dd>{names(who)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <Player
        piece={piece}
        player={player}
        onToggle={onToggle}
        onSeek={onSeek}
        onWatch={piece.video ? watch : undefined}
      />

      <About text={piece.description} />

      <dl className="cw-facts">
        {facts.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
        <div className="is-wide">
          <dt>Instrumentation</dt>
          <dd>{piece.instrumentation ?? piece.ensemble}</dd>
        </div>
      </dl>

      {piece.contents && (
        <section className="cw-d-sec">
          <h3 className="cw-label">
            Contents <span className="cw-label-aside">{piece.contents.length} pieces</span>
          </h3>
          <ol className="cw-contents">
            {piece.contents.map((c, i) => (
              <li key={c}>
                <span>{pad(i + 1)}</span>
                {c}
              </li>
            ))}
          </ol>
        </section>
      )}

      {hasMedia && (
        <section ref={mediaRef} className="cw-d-sec">
          <h3 className="cw-label">Watch &amp; read</h3>
          <Media
            piece={piece}
            palette={collection.palette}
            watching={watching}
            onWatch={watch}
            onVideoStart={onVideoStart}
          />
        </section>
      )}
    </article>
  )
}

/** Phones' now-playing controls: a full-width seek bar, then back / play / next. */
function Transport({
  piece,
  player,
  onToggle,
  onSeek,
  onPrev,
  onNext,
}: {
  piece: Piece
  player: PlayerState
  onToggle: () => void
  onSeek: (t: number) => void
  onPrev?: () => void
  onNext?: () => void
}) {
  const { isCurrent, playing, time, duration } = player
  const live = isCurrent && duration > 0
  const on = isCurrent && playing
  return (
    <div className={`cw-pv-transport${on ? ' is-playing' : ''}`}>
      <input
        type="range"
        className="cw-range"
        min={0}
        max={live ? duration : 1}
        step={0.1}
        value={live ? Math.min(time, duration) : 0}
        onChange={(e) => onSeek(Number(e.target.value))}
        disabled={!live}
        aria-label="Seek"
        style={{ '--p': `${live ? (time / duration) * 100 : 0}%` } as React.CSSProperties}
      />
      <div className="cw-pv-times">
        <span>{fmt(live ? time : 0)}</span>
        <span>{live ? fmt(duration) : piece.duration}</span>
      </div>
      <div className="cw-pv-controls">
        <button className="cw-pv-skip" onClick={onPrev} disabled={!onPrev} aria-label="Previous">
          <PrevIcon />
        </button>
        <button className="cw-pv-play" onClick={onToggle} aria-label={on ? 'Pause' : `Play ${piece.title}`}>
          {on ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button className="cw-pv-skip" onClick={onNext} disabled={!onNext} aria-label="Next">
          <NextIcon />
        </button>
      </div>
    </div>
  )
}

function Player({
  piece,
  player,
  onToggle,
  onSeek,
  onWatch,
}: {
  piece: Piece
  player: PlayerState
  onToggle: () => void
  onSeek: (t: number) => void
  /** No recording, but a video: the row opens it instead. */
  onWatch?: () => void
}) {
  if (!piece.audio && onWatch) {
    return (
      <button className="cw-player is-video" onClick={onWatch}>
        <span className="cw-play">
          <PlayIcon />
        </span>
        <span className="cw-player-note">Watch video</span>
      </button>
    )
  }
  if (!piece.audio) {
    return (
      <div className="cw-player is-off">
        <button className="cw-play" disabled aria-label="No recording yet">
          <PlayIcon />
        </button>
        <span className="cw-player-note">Recording coming soon</span>
        <span className="cw-time">{piece.duration}</span>
      </div>
    )
  }
  const { isCurrent, playing, time, duration } = player
  const live = isCurrent && duration > 0
  const progress = live ? (time / duration) * 100 : 0
  return (
    <div className={`cw-player${isCurrent && playing ? ' is-playing' : ''}`}>
      <button
        className="cw-play"
        onClick={onToggle}
        aria-label={isCurrent && playing ? 'Pause' : `Play ${piece.title}`}
      >
        {isCurrent && playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <span className="cw-time">{fmt(live ? time : 0)}</span>
      <input
        type="range"
        className="cw-range"
        min={0}
        max={live ? duration : 1}
        step={0.1}
        value={live ? Math.min(time, duration) : 0}
        onChange={(e) => onSeek(Number(e.target.value))}
        disabled={!live}
        aria-label="Seek"
        style={{ '--p': `${progress}%` } as React.CSSProperties}
      />
      <span className="cw-time">{live ? fmt(duration) : piece.duration}</span>
    </div>
  )
}

/**
 * Compact tiles for the video, score and links. The video is a tile until
 * clicked (nothing third-party loads before that), then opens full width.
 */
function Media({
  piece,
  palette,
  watching,
  onWatch,
  onVideoStart,
}: {
  piece: Piece
  palette: [string, string]
  watching: boolean
  onWatch: () => void
  /** A self-hosted video started playing (pauses the music). */
  onVideoStart: () => void
}) {
  const src = piece.video
  const yt = src && !/\.(mp4|webm|mov)$/i.test(src) ? youtubeId(src) : null
  const start = yt && src ? youtubeTime(src, 't', 'start') : 0
  const end = yt && src ? youtubeTime(src, 'end') : 0

  return (
    <div className="cw-media">
      {src &&
        (watching ? (
          <div className="cw-video">
            {yt ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0${start ? `&start=${start}` : ''}${end ? `&end=${end}` : ''}`}
                title={`${piece.title} — performance`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <video src={src} controls autoPlay playsInline onPlay={onVideoStart} />
            )}
          </div>
        ) : (
          <button className="cw-tile" onClick={onWatch}>
            <span className="cw-tile-thumb" style={{ '--v1': palette[0], '--v2': palette[1] } as React.CSSProperties}>
              <PlayIcon />
            </span>
            <span className="cw-tile-text">
              Performance
              <small>Watch video</small>
            </span>
          </button>
        ))}
      {piece.score && (
        <a href={piece.score} target="_blank" rel="noopener noreferrer" className="cw-tile">
          <span className="cw-tile-icon">
            <ScoreIcon />
          </span>
          <span className="cw-tile-text">
            Full score
            <small>MuseScore</small>
          </span>
          <ArrowUpRightIcon className="cw-tile-arrow" />
        </a>
      )}
      {piece.links?.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="cw-tile">
          <span className="cw-tile-icon">
            <LinkIcon />
          </span>
          <span className="cw-tile-text">
            {l.label}
            <small>{new URL(l.href).hostname.replace(/^www\./, '')}</small>
          </span>
          <ArrowUpRightIcon className="cw-tile-arrow" />
        </a>
      ))}
    </div>
  )
}
