'use client'

import { useState } from 'react'

export interface Photo {
  src: string
  alt: string
  caption?: string
}

/**
 * Auto-scrolling horizontal photo strip (marquee). The set is duplicated so the
 * loop is seamless; hovering pauses it (see `.photo-strip:hover` in globals.css).
 * Each photo has an optional caption, and clicking opens it in a lightbox.
 */
export default function PhotoStrip({
  photos,
  durationSec = 40,
}: {
  photos: Photo[]
  durationSec?: number
}) {
  const [lightbox, setLightbox] = useState<Photo | null>(null)
  const loop = [...photos, ...photos]

  return (
    <>
      <div className="photo-strip" style={{ overflow: 'hidden', width: '100%' }}>
        <div
          className="photo-track"
          style={{
            display: 'flex',
            gap: '12px',
            width: 'max-content',
            animation: `marquee ${durationSec}s linear infinite`,
          }}
        >
          {loop.map((photo, i) => (
            <figure
              key={i}
              onClick={() => setLightbox(photo)}
              style={{ margin: 0, flexShrink: 0, cursor: 'zoom-in', width: '200px' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                style={{
                  width: '200px',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  display: 'block',
                  border: '1px solid var(--n-border)',
                }}
              />
              {photo.caption && (
                <figcaption
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--n-secondary)',
                    marginTop: '6px',
                    lineHeight: 1.35,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            padding: '5vw',
            zIndex: 2000,
            cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
            }}
          />
          {lightbox.caption && (
            <p style={{ color: '#fff', fontSize: '0.9375rem', margin: 0, textAlign: 'center', maxWidth: '600px' }}>
              {lightbox.caption}
            </p>
          )}
        </div>
      )}
    </>
  )
}
