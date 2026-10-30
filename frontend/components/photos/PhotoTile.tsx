'use client'

import { useState } from 'react'
import type { PhotoEntry } from '@/lib/photos'
import { CATEGORY_LABEL, formatDate, tileSrc } from './format'

/** First few tiles are above the fold on any layout: load them eagerly. */
const EAGER = 6
/** Stagger caps out so long grids don't make the last tiles wait seconds. */
const MAX_STAGGER = 20

/**
 * One square grid tile. Only the thumbnail (or video poster) is loaded here;
 * the full-size file is the lightbox's job.
 *
 * Layers, bottom to top: the manifest's tiny `blur` image (softened by CSS) with
 * a faint shimmer while loading → the thumbnail, which fades in once decoded →
 * the hover/focus caption (a gradient rising from the bottom edge) → the video
 * badge. Styles in app/photos/photos.css.
 */
export default function PhotoTile({
  photo,
  index,
  onOpen,
}: {
  photo: PhotoEntry
  index: number
  onOpen: (index: number) => void
}) {
  const [loaded, setLoaded] = useState(false)
  const video = photo.type === 'video'
  const caption = photo.caption.en
  const sub = formatDate(photo.date) ?? CATEGORY_LABEL[photo.category]
  const webp = video ? undefined : photo.thumbWebp
  const position = photo.position ?? 'center'

  return (
    <button
      type="button"
      className={`ph-tile${loaded ? ' is-loaded' : ''}`}
      style={{ '--i': Math.min(index, MAX_STAGGER) } as React.CSSProperties}
      aria-label={`${caption}${video ? ' (video)' : ''}, ${sub}`}
      onClick={() => onOpen(index)}
    >
      <span
        className="ph-blur"
        aria-hidden
        style={{ backgroundImage: photo.blur ? `url("${photo.blur}")` : undefined, backgroundPosition: position }}
      />
      <span className="ph-shimmer" aria-hidden />

      <picture>
        {webp && <source type="image/webp" srcSet={webp} />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tileSrc(photo)}
          alt=""
          width={photo.width}
          height={photo.height}
          loading={index < EAGER ? 'eager' : 'lazy'}
          decoding="async"
          style={{ objectPosition: position }}
          // Thumbnails can finish before hydration, so check on mount as well.
          ref={(el) => {
            if (el?.complete && el.naturalWidth > 0) setLoaded(true)
          }}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      </picture>

      <span className="ph-cap" aria-hidden>
        <b>{caption}</b>
        <span>{sub}</span>
      </span>

      {video && (
        <span className="ph-play" aria-hidden>
          <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor">
            <path d="M2 1l7 4-7 4z" />
          </svg>
        </span>
      )}
    </button>
  )
}
