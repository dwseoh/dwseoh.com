type P = { className?: string }

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

// Optically centred: the triangle's box sits ~1.5 units right of the middle,
// about halfway to where its centre of mass would be, so it reads as centred
// inside a round button without any CSS nudge.
export const PlayIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <path d="M7 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 7 5.14Z" />
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
    <rect x="5" y="5" width="2.4" height="14" rx="1.2" />
    <path d="M19 6.1v11.8a1 1 0 0 1-1.53.85L9.2 13.7a2 2 0 0 1 0-3.4l8.27-5.05A1 1 0 0 1 19 6.1Z" />
  </svg>
)

export const NextIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <rect x="16.6" y="5" width="2.4" height="14" rx="1.2" />
    <path d="M5 6.1v11.8a1 1 0 0 0 1.53.85l8.27-5.05a2 2 0 0 0 0-3.4L6.53 5.25A1 1 0 0 0 5 6.1Z" />
  </svg>
)

export const ArrowLeftIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" {...stroke} aria-hidden="true">
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
)

export const ArrowUpRightIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" {...stroke} aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

export const ClockIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" {...stroke} aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)

export const ScoreIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" {...stroke} aria-hidden="true">
    <path d="M3 7h18M3 10.5h18M3 14h18M3 17.5h18" strokeOpacity="0.45" />
    <circle cx="9" cy="15.8" r="1.9" fill="currentColor" stroke="none" />
    <path d="M10.8 15.6V5.5l5 1.6" />
  </svg>
)

export const LinkIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" {...stroke} aria-hidden="true">
    <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
  </svg>
)

/** Pinned (featured): a push pin, tilted. */
export const PinIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <g transform="rotate(45 12 12)">
      <rect x="7" y="2" width="10" height="2.4" rx="1.2" />
      <path d="M9 4.4h6l.8 6.2 2.8 2.8V15H5.4v-1.6l2.8-2.8L9 4.4Z" />
      <rect x="11.1" y="15" width="1.8" height="7.2" rx="0.9" />
    </g>
  </svg>
)

export const CloseIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" {...stroke} aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
