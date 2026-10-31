'use client'

import { useState } from 'react'

/**
 * An image in the /photos tile language, for pages without a photo manifest
 * (blog thumbnails and covers): the empty tile colour under a faint shimmer
 * while loading, then the image fades in; a parent with `.tile-zoom` on hover
 * gets the slow zoom. Same corners and timing as the gallery tiles. Styles:
 * `.tile` in app/globals.css.
 */
export default function TileImage({
  src,
  className,
  eager = false,
}: {
  src: string
  className?: string
  eager?: boolean
}) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className={`tile${loaded ? ' is-loaded' : ''}${className ? ` ${className}` : ''}`}>
      <span className="tile-shimmer" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="tile-img"
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        // Images can finish before hydration, so check on mount as well.
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0) setLoaded(true)
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
    </div>
  )
}
