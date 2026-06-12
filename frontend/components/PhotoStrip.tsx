'use client'

import { useState } from 'react'
import Lightbox from './Lightbox'
import { isVideo, type Photo } from './photo'

export type { Photo } from './photo'

// Wider fade so photos ease in/out at the edges instead of cutting abruptly.
const EDGE_MASK =
  'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)'

const GAP = 12 // px between tiles, applied as margin-right so the loop is seamless

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
  const loop = [...photos, ...photos]

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
            className="photo-track"
            style={{
              display: 'flex',
              width: 'max-content',
              ['--marquee-dur' as string]: `${durationSec}s`,
            } as React.CSSProperties}
          >
            {loop.map((photo, i) => (
              <figure
                key={i}
                className="photo-figure"
                onClick={() => setLightbox(photo)}
                style={{
                  position: 'relative',
                  margin: 0,
                  marginRight: `${GAP}px`,
                  flexShrink: 0,
                  width: '165px',
                  height: '112px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  cursor: 'zoom-in',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                }}
              >
                {isVideo(photo) ? (
                  <video
                    src={photo.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
                {photo.caption && (
                  <figcaption className="photo-cap">{photo.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </div>

      <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />
    </>
  )
}
