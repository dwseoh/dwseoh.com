'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { isVideo, type Photo } from './photo'

/** A Photo plus the optional extras the viewer can use when the caller has them. */
export interface LightboxItem extends Photo {
  /** Small image for the filmstrip + ambient backdrop (falls back to poster/src). */
  thumb?: string
  /** WebP twin of `src`, served via <picture> when present. */
  srcWebp?: string
  /** Secondary line under the caption, e.g. "Jan 2026 · Events". */
  meta?: string
}

const pad = (n: number) => String(n).padStart(2, '0')
const thumbOf = (p: LightboxItem) => p.thumb ?? p.poster ?? p.src
const SWIPE_PX = 50
const CLOSE_MS = 180

/**
 * Shared full-screen viewer (home carousel + /photos). The current photo sits
 * on a blurred, darkened copy of itself, with caption/counter and a filmstrip
 * below. Esc / close button / backdrop click close it; ←/→, the on-screen
 * arrows, the filmstrip and swipes navigate. Opening pushes a history entry so
 * the browser back button closes it too. Focus is trapped inside while open and
 * handed back to whatever opened it. Styles live in globals.css (`.lb*`).
 *
 * Controlled: render it with an index to open, pass `onClose` to unmount it.
 */
export default function Lightbox({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: LightboxItem[]
  index: number | null
  onIndexChange: (i: number) => void
  onClose: () => void
}) {
  if (index === null || !items[index]) return null
  return createPortal(
    <LightboxView items={items} index={index} onIndexChange={onIndexChange} onClose={onClose} />,
    document.body
  )
}

function LightboxView({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: LightboxItem[]
  index: number
  onIndexChange: (i: number) => void
  onClose: () => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const [closing, setClosing] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const photo = items[index]
  const count = items.length
  const go = useCallback(
    (delta: number) => onIndexChange((index + delta + count) % count),
    [index, count, onIndexChange]
  )

  // Fade out, then let the parent unmount us.
  const finish = useCallback(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return onClose()
    setClosing(true)
    window.setTimeout(onClose, CLOSE_MS)
  }, [onClose])

  // Every UI close goes through history so Back and the close button agree:
  // pop our entry, and the popstate listener below does the actual closing.
  const requestClose = useCallback(() => {
    if (window.history.state?.__lightbox) window.history.back()
    else finish()
  }, [finish])

  // History entry: pushed once (the guard keeps StrictMode's double effect from
  // pushing twice). Next.js copies its router state into the entry for us.
  useEffect(() => {
    if (!window.history.state?.__lightbox) {
      window.history.pushState({ ...window.history.state, __lightbox: true }, '')
    }
    const onPop = () => {
      if (!window.history.state?.__lightbox) finish()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [finish])

  // Scroll lock (with scrollbar compensation so the page behind doesn't jump)
  // + focus in on open, focus back to the opener on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const { overflow, paddingRight } = document.body.style
    const gutter = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`
    closeRef.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      opener?.focus?.({ preventScroll: true })
    }
  }, [])

  // Reset the fade-in for each photo; warm the neighbours so ←/→ feel instant.
  useEffect(() => {
    setLoaded(false)
    for (const n of [items[(index + 1) % count], items[(index - 1 + count) % count]]) {
      if (n && !isVideo(n)) new Image().src = n.src
    }
    stripRef.current
      ?.querySelector<HTMLElement>(`[data-j="${index}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [index, items, count])

  // Keys are caught on window in the capture phase: a focused <video> would
  // otherwise swallow Esc and the arrows inside its native controls.
  const keys = useRef<(e: KeyboardEvent) => void>(() => {})
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      requestClose()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      e.stopPropagation()
      go(e.key === 'ArrowRight' ? 1 : -1)
    } else if (e.key === 'Tab') {
      // Focus trap: wrap between the first and last focusable controls.
      const nodes = rootRef.current?.querySelectorAll<HTMLElement>('button')
      if (!nodes?.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const inside = rootRef.current?.contains(document.activeElement)
      if (!inside || (e.shiftKey && document.activeElement === first)) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }
  useLayoutEffect(() => {
    keys.current = handleKey
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keys.current(e)
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  // Swipe: horizontal, single finger, mostly-sideways moves only (so pinch-zoom
  // and vertical drags are left alone).
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current
    touch.current = null
    if (!start || count < 2) return
    const dx = e.changedTouches[0].clientX - start.x
    const dy = e.changedTouches[0].clientY - start.y
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1)
  }

  const video = isVideo(photo)
  const label = photo.caption || photo.alt

  return (
    <div
      ref={rootRef}
      className={`lb${closing ? ' is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      // Focusable itself so clicks on empty areas keep focus inside the dialog.
      tabIndex={-1}
      aria-label={label ? `Photo viewer: ${label}` : 'Photo viewer'}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="lb-amb" aria-hidden style={{ backgroundImage: `url("${thumbOf(photo)}")` }} />
      <div className="lb-veil" aria-hidden />

      {/* Clicking anywhere on the stage except the media itself closes. */}
      <div
        className="lb-stage"
        onClick={(e) => {
          if (e.target === e.currentTarget) requestClose()
        }}
      >
        {video ? (
          <video
            key={photo.src}
            className="lb-media is-loaded"
            src={photo.src}
            poster={photo.poster}
            controls
            // Kept out of the Tab order: once focus is inside Chrome's native
            // controls they swallow Esc/arrows before any listener sees them.
            tabIndex={-1}
            autoPlay
            loop
            playsInline
          />
        ) : (
          <picture key={photo.src}>
            {photo.srcWebp && <source type="image/webp" srcSet={photo.srcWebp} />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={`lb-media${loaded ? ' is-loaded' : ''}`}
              src={photo.src}
              alt={photo.alt}
              decoding="async"
              ref={(el) => {
                if (el?.complete && el.naturalWidth > 0) setLoaded(true)
              }}
              onLoad={() => setLoaded(true)}
              onError={() => setLoaded(true)}
            />
          </picture>
        )}
      </div>

      <div className="lb-meta">
        <div className="lb-text">
          {photo.caption && <p className="lb-cap">{photo.caption}</p>}
          {photo.meta && <p className="lb-sub">{photo.meta}</p>}
        </div>
        {count > 1 && (
          <p className="lb-idx" aria-live="polite">
            {pad(index + 1)} / {pad(count)}
          </p>
        )}
      </div>

      {count > 1 && (
        <div className="lb-strip" ref={stripRef}>
          {items.map((p, j) => (
            <button
              key={`${p.src}-${j}`}
              type="button"
              data-j={j}
              className={`lb-thumb${j === index ? ' is-on' : ''}`}
              aria-label={`Show ${p.caption || p.alt || `photo ${j + 1}`}`}
              aria-current={j === index ? 'true' : undefined}
              tabIndex={j === index ? 0 : -1}
              onClick={() => onIndexChange(j)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumbOf(p)} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}

      <button ref={closeRef} type="button" className="lb-close" onClick={requestClose}>
        Close<span className="lb-hint"> (Esc)</span>
      </button>
      {count > 1 && (
        <>
          <button type="button" className="lb-nav lb-prev" aria-label="Previous photo" onClick={() => go(-1)}>
            ←
          </button>
          <button type="button" className="lb-nav lb-next" aria-label="Next photo" onClick={() => go(1)}>
            →
          </button>
        </>
      )}
    </div>
  )
}
