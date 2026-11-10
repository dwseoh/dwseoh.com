'use client'

import { creditsOf, type Collection, type Piece } from '@/app/music/data'
import Cover from './Cover'
import { NextIcon, PauseIcon, PlayIcon, PrevIcon } from './Icons'

interface Props {
  piece: Piece
  collection: Collection
  /** `piece` is loaded in the audio element; otherwise it's what play would start. */
  loaded: boolean
  playing: boolean
  time: number
  duration: number
  onToggle: () => void
  /** Absent when there's nothing to skip to. */
  onPrev?: () => void
  onNext?: () => void
  onSeek: (t: number) => void
  /** Bring the piece up in the list. */
  onShow: () => void
}

/**
 * The player under the list, a compact card over the visualizer: cover, title
 * and artist, then back / play / next on the right, and a thin progress bar
 * underneath. Before anything has played it shows the focused piece, ready to
 * start.
 */
export default function NowPlaying(p: Props) {
  const { piece, loaded, playing, time, duration } = p
  const live = loaded && duration > 0
  const artists = [...new Set(creditsOf(piece).map((c) => c.name))].join(', ')

  return (
    <div className={`cw-np${playing ? ' is-playing' : ''}`} role="region" aria-label="Player">
      <div className="cw-np-row">
        <Cover piece={piece} palette={p.collection.palette} />
        <span className="cw-np-text">
          <button className="cw-np-title" onClick={p.onShow} title="Show in list">
            {piece.title}
          </button>
          <span className="cw-np-artist">{artists}</span>
        </span>
        <div className="cw-np-controls">
          <button className="cw-np-skip" onClick={p.onPrev} disabled={!p.onPrev} aria-label="Previous">
            <PrevIcon />
          </button>
          <button
            className="cw-np-play"
            onClick={p.onToggle}
            disabled={!piece.audio}
            aria-label={!piece.audio ? 'No recording yet' : playing ? 'Pause' : `Play ${piece.title}`}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className="cw-np-skip" onClick={p.onNext} disabled={!p.onNext} aria-label="Next">
            <NextIcon />
          </button>
        </div>
      </div>
      <input
        type="range"
        className="cw-range cw-np-range"
        min={0}
        max={live ? duration : 1}
        step={0.1}
        value={live ? Math.min(time, duration) : 0}
        onChange={(e) => p.onSeek(Number(e.target.value))}
        disabled={!live}
        aria-label="Seek"
        style={{ '--p': `${live ? (time / duration) * 100 : 0}%` } as React.CSSProperties}
      />
    </div>
  )
}
