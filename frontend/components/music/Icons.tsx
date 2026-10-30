type P = { className?: string }

export const PlayIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" />
  </svg>
)

export const PauseIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <rect x="6" y="4.5" width="4" height="15" rx="1.2" />
    <rect x="14" y="4.5" width="4" height="15" rx="1.2" />
  </svg>
)

export const PrevIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <rect x="4.5" y="5" width="2.4" height="14" rx="1" />
    <path d="M19.5 6.2v11.6a.9.9 0 0 1-1.38.76L9.3 12.76a.9.9 0 0 1 0-1.52l8.82-5.8a.9.9 0 0 1 1.38.76Z" />
  </svg>
)

export const NextIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <rect x="17.1" y="5" width="2.4" height="14" rx="1" />
    <path d="M4.5 6.2v11.6a.9.9 0 0 0 1.38.76l8.82-5.8a.9.9 0 0 0 0-1.52L5.88 5.44a.9.9 0 0 0-1.38.76Z" />
  </svg>
)

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const ShuffleIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" {...stroke} aria-hidden="true">
    <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
  </svg>
)

export const ArrowLeftIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" {...stroke} aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

export const ExternalIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" {...stroke} aria-hidden="true">
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
)

export const NoteIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" {...stroke} aria-hidden="true">
    <path d="M5 5h14M5 10h14M5 15h9M5 20h6" />
  </svg>
)

export const VolumeIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" {...stroke} aria-hidden="true">
    <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4ZM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
)
