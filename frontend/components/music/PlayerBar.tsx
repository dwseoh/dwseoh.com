import Cover from './Cover'
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, VolumeIcon, ExternalIcon } from './Icons'
import type { QueueItem } from './MusicView'

function fmt(s: number) {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

interface Props {
  item: QueueItem | null
  index: number | null
  playing: boolean
  missing: boolean
  time: number
  duration: number
  volume: number
  onToggle: () => void
  onPrev: () => void
  onNext: () => void
  onSeek: (t: number) => void
  onVolume: (v: number) => void
}

export default function PlayerBar(p: Props) {
  const progress = p.duration ? (p.time / p.duration) * 100 : 0

  return (
    <div
      className={`mus-player${p.item ? ' is-active' : ''}`}
      role="region"
      aria-label="Player"
      style={{ '--p': `${progress}%` } as React.CSSProperties}
    >
      <div className="mus-player-now">
        {p.item ? (
          <>
            <Cover collection={p.item.collection} index={p.index ?? 0} small />
            <div className="mus-player-text">
              <span className="mus-player-title">{p.item.track.title}</span>
              <span className="mus-player-sub">
                {p.missing ? 'Audio coming soon' : `${p.item.track.ensemble} · ${p.item.collection.title}`}
              </span>
            </div>
          </>
        ) : (
          <div className="mus-player-text">
            <span className="mus-player-title">Nothing playing</span>
            <span className="mus-player-sub">Pick a piece to begin</span>
          </div>
        )}
      </div>

      <div className="mus-player-center">
        <div className="mus-player-controls">
          <button className="mus-ctl" onClick={p.onPrev} aria-label="Previous" disabled={!p.item}>
            <PrevIcon />
          </button>
          <button className="mus-ctl mus-ctl-main" onClick={p.onToggle} aria-label={p.playing ? 'Pause' : 'Play'}>
            {p.playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className="mus-ctl" onClick={p.onNext} aria-label="Next" disabled={!p.item}>
            <NextIcon />
          </button>
        </div>
        <div className="mus-scrub">
          <span className="mus-time">{fmt(p.time)}</span>
          <input
            type="range"
            className="mus-range"
            min={0}
            max={p.duration || 0}
            step={0.1}
            value={Math.min(p.time, p.duration || 0)}
            onChange={(e) => p.onSeek(Number(e.target.value))}
            disabled={!p.duration}
            aria-label="Seek"
            style={{ '--p': `${progress}%` } as React.CSSProperties}
          />
          <span className="mus-time">{fmt(p.duration)}</span>
        </div>
      </div>

      <div className="mus-player-right">
        {p.item?.track.links?.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="mus-player-link">
            {l.label} <ExternalIcon />
          </a>
        ))}
        <span className="mus-volume">
          <VolumeIcon />
          <input
            type="range"
            className="mus-range"
            min={0}
            max={1}
            step={0.01}
            value={p.volume}
            onChange={(e) => p.onVolume(Number(e.target.value))}
            aria-label="Volume"
            style={{ '--p': `${p.volume * 100}%` } as React.CSSProperties}
          />
        </span>
      </div>
    </div>
  )
}
