'use client'

import { useState } from 'react'
import { ME, categoryLabel, creditsOf, genreOf, type Collection, type Piece } from '@/app/music/data'
import Cover from './Cover'
import { ArrowUpRightIcon, LinkIcon, PauseIcon, PlayIcon, ScoreIcon } from './Icons'

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

function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)
  return m ? m[1] : /^[\w-]{11}$/.test(url) ? url : null
}

const pad = (n: number) => String(n).padStart(2, '0')

interface Props {
  piece: Piece
  collection: Collection
  /** Which way the drum moved to get here: the new piece slides in from it. */
  dir: 'up' | 'down'
  player: PlayerState
  onToggle: () => void
  onSeek: (t: number) => void
  onVideoStart: () => void
}

/**
 * Kept lean so a piece fits without scrolling: an album-style header (cover
 * beside the title, album and credits, centred on it), the player, the note,
 * one small facts grid, and media tiles. Featured shows on the cover itself;
 * my name is gold wherever I'm the composer.
 */
export default function DetailPanel({ piece, collection, dir, player, onToggle, onSeek, onVideoStart }: Props) {
  const perf = piece.categories.includes('performance')
  const credits = creditsOf(piece)
  const hasMedia = piece.video || piece.score || piece.links?.length

  const facts: [string, React.ReactNode][] = [
    ['Year', piece.year],
    ['Genre', genreOf(piece, collection)],
    ...(piece.key ? [['Key', piece.key] as [string, string]] : []),
    ...(perf && piece.role ? [['Role', piece.role] as [string, string]] : []),
    ...(perf && piece.performers ? [['Performed by', piece.performers] as [string, string]] : []),
    ...(perf && piece.venue ? [['Venue', piece.venue] as [string, string]] : []),
  ]

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
            {credits.map((c) => (
              <div key={c.role} className={c.role === 'Composer' && c.name === ME ? 'is-mine' : undefined}>
                <dt>{c.role}</dt>
                <dd>{c.name}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <Player piece={piece} player={player} onToggle={onToggle} onSeek={onSeek} />

      <p className="cw-d-desc">{piece.description}</p>

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
        <section className="cw-d-sec">
          <h3 className="cw-label">Watch &amp; read</h3>
          <Media piece={piece} palette={collection.palette} onVideoStart={onVideoStart} />
        </section>
      )}
    </article>
  )
}

function Player({
  piece,
  player,
  onToggle,
  onSeek,
}: {
  piece: Piece
  player: PlayerState
  onToggle: () => void
  onSeek: (t: number) => void
}) {
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
  onVideoStart,
}: {
  piece: Piece
  palette: [string, string]
  onVideoStart: () => void
}) {
  const [watching, setWatching] = useState(false)
  const src = piece.video
  const yt = src && !/\.(mp4|webm|mov)$/i.test(src) ? youtubeId(src) : null

  return (
    <div className="cw-media">
      {src &&
        (watching ? (
          <div className="cw-video">
            {yt ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`}
                title={`${piece.title} — performance`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <video src={src} controls autoPlay playsInline onPlay={onVideoStart} />
            )}
          </div>
        ) : (
          <button
            className="cw-tile"
            onClick={() => {
              onVideoStart()
              setWatching(true)
            }}
          >
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
            <small>{new URL(l.href).hostname}</small>
          </span>
          <ArrowUpRightIcon className="cw-tile-arrow" />
        </a>
      ))}
    </div>
  )
}
