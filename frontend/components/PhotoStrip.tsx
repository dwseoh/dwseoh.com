'use client'

import { useState } from 'react'
import Lightbox from './Lightbox'
import { isVideo, type Photo } from './photo'

export type { Photo } from './photo'

// Wider fade so photos ease in/out at the edges instead of cutting abruptly.
const EDGE_MASK =
  'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)'

const GAP = 12 // px between tiles, applied as margin-right so the loop is seamless

// Strip tiles use a small thumbnail (foo.jpg -> foo-thumb.jpg) for fast loading;
// the lightbox loads the full-size original.
function thumbOf(src: string) {
  return src.replace(/(\.[^.\/]+)$/, '-thumb$1')
}

/**
 * Body-width auto-scrolling photo strip with faded edges. Spacing is applied as
 * margin-right (not flex gap) so the duplicated set is exactly half the track —
 * that makes translateX(-50%) loop seamlessly with no stutter. Hovering pauses
 * the scroll, zooms the tile, and reveals its caption. Click opens a lightbox.
 * Marquee + hover styles live in globals.css.
 */
export default function PhotoStrip({
  photos,
  durationSec = 38,
}: {
  photos: Photo[]
  durationSec?: number
}) {
  const [lightbox, setLightbox] = useState<Photo | null>(null)
  const [loaded, setLoaded] = useState<Record<number, boolean>>({})
  const [errored, setErrored] = useState<Record<number, boolean>>({})
  const [fallback, setFallback] = useState<Record<number, boolean>>({})
  const loop = [...photos, ...photos]

  const markLoaded = (i: number) => setLoaded((s) => (s[i] ? s : { ...s, [i]: true }))
  const markError = (i: number) => setErrored((s) => ({ ...s, [i]: true }))

  return (
    <>
      <div style={{ margin: '2rem 0 2.5rem' }}>
        <div
          className="photo-strip"
          style={{
            overflow: 'hidden',
            padding: '6px 0',
            WebkitMaskImage: EDGE_MASK,
            maskImage: EDGE_MASK,
          }}
        >
          <div
            className={`photo-track${lightbox ? ' is-paused' : ''}`}
            style={{
              display: 'flex',
              width: 'max-content',
              ['--marquee-dur' as string]: `${durationSec}s`,
            } as React.CSSProperties}
          >
            {loop.map((photo, i) => {
              const video = isVideo(photo)
              const isLoaded = loaded[i]
              const isError = errored[i]
              const mediaStyle: React.CSSProperties = {
                position: 'relative',
                zIndex: 1,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: photo.position ?? 'center',
                display: 'block',
              }
              return (
                <figure
                  key={i}
                  className="photo-figure"
                  onClick={() => !isError && setLightbox(photo)}
                  style={{
                    position: 'relative',
                    margin: 0,
                    marginRight: `${GAP}px`,
                    flexShrink: 0,
                    width: '165px',
                    height: '112px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    cursor: isError ? 'default' : 'zoom-in',
                    background: 'var(--n-hover)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  }}
                >
                  {/* loading skeleton */}
                  {!isLoaded && !isError && (
                    <span className="skeleton" style={{ position: 'absolute', inset: 0 }} />
                  )}

                  {isError ? (
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--n-light)',
                        fontSize: '0.625rem',
                      }}
                    >
                      unavailable
                    </span>
                  ) : video ? (
                    // Video plays ASAP: poster shows the first frame instantly while
                    // preload="auto" buffers, then it autoplays muted + loops.
                    <video
                      src={photo.src}
                      poster={photo.poster}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      onLoadedData={() => markLoaded(i)}
                      onCanPlay={() => markLoaded(i)}
                      onError={() => markError(i)}
                      style={mediaStyle}
                    />
                  ) : (
                    // Images use a lightweight thumbnail (falls back to full if missing).
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fallback[i] ? photo.src : thumbOf(photo.src)}
                      alt={photo.alt}
                      decoding="async"
                      ref={(el) => {
                        if (el && el.complete && el.naturalWidth > 0) markLoaded(i)
                      }}
                      onLoad={() => markLoaded(i)}
                      onError={() => {
                        if (!fallback[i]) setFallback((s) => ({ ...s, [i]: true }))
                        else markError(i)
                      }}
                      style={mediaStyle}
                    />
                  )}

                  {/* video badge (top-left) */}
                  {video && !isError && (
                    <span
                      aria-hidden
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '18px',
                        height: '18px',
                        borderRadius: '5px',
                        background: 'rgba(0,0,0,0.55)',
                        backdropFilter: 'blur(2px)',
                      }}
                    >
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="#fff">
                        <path d="M2 1l7 4-7 4z" />
                      </svg>
                    </span>
                  )}

                  {photo.caption && !isError && (
                    <figcaption
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 3,
                        padding: '16px 8px 6px',
                        fontSize: '0.6875rem',
                        color: '#fff',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.78))',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              )
            })}
          </div>
        </div>
      </div>

      <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />
    </>
  )
}
