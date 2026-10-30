'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import Lightbox from '@/components/Lightbox'
import type { PhotoEntry } from '@/lib/photos'
import CursorCaption from './CursorCaption'
import PhotoTile from './PhotoTile'
import { FILTERS, parseFilter, pad, toLightboxItem, type Filter } from './format'

type Density = 3 | 5

// ---- URL-backed filter (?c=…) ------------------------------------------------
// The URL is the source of truth, so links are shareable and Back/Forward walk
// through tab changes. pushState doesn't fire an event, so we send our own.
const URL_EVENT = 'photos:url'
function subscribeUrl(cb: () => void) {
  window.addEventListener('popstate', cb)
  window.addEventListener(URL_EVENT, cb)
  return () => {
    window.removeEventListener('popstate', cb)
    window.removeEventListener(URL_EVENT, cb)
  }
}
const readFilter = () => parseFilter(new URLSearchParams(window.location.search).get('c'))

// ---- Density (3 or 5 columns), remembered per browser -----------------------
const DENSITY_KEY = 'photos-density'
const DENSITY_EVENT = 'photos:density'
function subscribeDensity(cb: () => void) {
  window.addEventListener('storage', cb)
  window.addEventListener(DENSITY_EVENT, cb)
  return () => {
    window.removeEventListener('storage', cb)
    window.removeEventListener(DENSITY_EVENT, cb)
  }
}
function readDensity(): Density {
  try {
    return window.localStorage.getItem(DENSITY_KEY) === '5' ? 5 : 3
  } catch {
    return 3
  }
}
function writeDensity(d: Density) {
  try {
    window.localStorage.setItem(DENSITY_KEY, String(d))
  } catch {
    // private mode / blocked storage: the choice just won't persist
  }
  window.dispatchEvent(new Event(DENSITY_EVENT))
}

/** Cross-fade a synchronous state change when the View Transitions API exists. */
function withTransition(update: () => void) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduced) return update()
  document.startViewTransition(() => flushSync(update))
}

/**
 * The interactive part of /photos: tabs, density toggle, grid, cursor caption
 * and lightbox. The server page passes the manifest and the `?c=` it was
 * requested with, so the first paint already shows the right tab. `children`
 * is the page title, laid out opposite the controls.
 */
export default function PhotoGallery({
  photos,
  initialFilter,
  children,
}: {
  photos: PhotoEntry[]
  initialFilter: Filter
  children: React.ReactNode
}) {
  const requested = useSyncExternalStore(subscribeUrl, readFilter, () => initialFilter)
  const density = useSyncExternalStore<Density>(subscribeDensity, readDensity, () => 3)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState<number | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Only categories that actually have photos get a tab.
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: photos.length, photography: 0, events: 0 }
    for (const p of photos) c[p.category]++
    return c
  }, [photos])
  const tabs = FILTERS.filter((f) => counts[f.key] > 0)
  const filter: Filter = counts[requested] > 0 ? requested : 'all'

  const visible = useMemo(
    () => (filter === 'all' ? photos : photos.filter((p) => p.category === filter)),
    [photos, filter]
  )
  const items = useMemo(() => visible.map(toLightboxItem), [visible])

  // Desktop holds the rise-in until hydration (see photos.css), so a remembered
  // 5-column choice is applied before any tile is visible.
  useEffect(() => setReady(true), [])

  const selectFilter = (e: React.MouseEvent, key: Filter) => {
    // Let modified clicks open a new tab like any link would.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    if (key === filter) return
    const url = key === 'all' ? window.location.pathname : `?c=${key}`
    withTransition(() => {
      window.history.pushState(null, '', url)
      window.dispatchEvent(new Event(URL_EVENT))
    })
  }

  const selectDensity = (d: Density) => {
    if (d !== density) withTransition(() => writeDensity(d))
  }

  const onOpen = useCallback((i: number) => setOpen(i), [])

  return (
    <div className="ph-gallery" data-cols={density} data-ready={ready ? '' : undefined}>
      <header className="ph-head">
        {children}
        <div className="ph-controls">
          <nav className="ph-tabs" aria-label="Filter photos">
            {tabs.map((t) => (
              <a
                key={t.key}
                href={t.key === 'all' ? '/photos' : `/photos?c=${t.key}`}
                className={t.key === filter ? 'is-on' : undefined}
                aria-current={t.key === filter ? 'page' : undefined}
                onClick={(e) => selectFilter(e, t.key)}
              >
                {t.label}
                <sup>{pad(counts[t.key])}</sup>
              </a>
            ))}
          </nav>
          <div className="ph-density" role="group" aria-label="Grid size">
            <button type="button" aria-label="Large tiles" aria-pressed={density === 3} onClick={() => selectDensity(3)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
                <rect width="6" height="6" rx="1" />
                <rect x="8" width="6" height="6" rx="1" />
                <rect y="8" width="6" height="6" rx="1" />
                <rect x="8" y="8" width="6" height="6" rx="1" />
              </svg>
            </button>
            <button type="button" aria-label="Small tiles" aria-pressed={density === 5} onClick={() => selectDensity(5)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
                {[0, 5, 10].flatMap((y) =>
                  [0, 5, 10].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="0.75" />)
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* The wrapper is stable (CursorCaption listens on it); the grid inside is
          keyed by filter so a tab change replays the staggered rise-in. */}
      <div ref={gridRef}>
        <div key={filter} className="ph-grid">
          {visible.map((p, i) => (
            <PhotoTile key={p.id} photo={p} index={i} onOpen={onOpen} />
          ))}
        </div>
      </div>

      <CursorCaption target={gridRef} />

      <Lightbox items={items} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} />
    </div>
  )
}
