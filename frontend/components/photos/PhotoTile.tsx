'use client'

import { useState } from 'react'
import type { PhotoEntry } from '@/lib/photos'
import { CATEGORY_LABEL, formatDate, tileSrc } from './format'

/** First few tiles are above the fold on any layout: load them eagerly. */
const EAGER = 6
/** Stagger caps out so long grids don't make the last tiles wait seconds. */
const MAX_STAGGER = 20

/**
 * One square grid tile. Only the thumbnail (or video poster) is ever loaded
 * here; the full-size file is the lightbox's job. While the thumbnail loads the
 * tile shows the manifest's tiny `blur` image (when present) and the image fades
 * in on top. `data-caption` / `data-date` feed the optional CursorCaption.
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
  const webp = video ? undefined : photo.thumbWebp

  return (
    <button
      type="button"
      className="ph-tile"
      style={
        {
          '--i': Math.min(index, MAX_STAGGER),
          backgroundImage: photo.blur ? `url("${photo.blur}")` : undefined,
        } as React.CSSProperties
      }
      data-caption={caption}
      data-date={formatDate(photo.date) ?? CATEGORY_LABEL[photo.category]}
      aria-label={video ? `${caption} (video)` : caption}
      onClick={() => onOpen(index)}
    >
      <picture>
        {webp && <source type="image/webp" srcSet={webp} />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tileSrc(photo)}
          alt={photo.alt.en}
          width={photo.width}
          height={photo.height}
          loading={index < EAGER ? 'eager' : 'lazy'}
          decoding="async"
          className={loaded ? 'is-loaded' : undefined}
          style={{ objectPosition: photo.position ?? 'center' }}
          // Thumbnails can finish before hydration, so check on mount as well.
          ref={(el) => {
            if (el?.complete && el.naturalWidth > 0) setLoaded(true)
          }}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      </picture>

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
