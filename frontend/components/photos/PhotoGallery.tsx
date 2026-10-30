'use client'

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import Lightbox from '@/components/Lightbox'
import type { PhotoEntry } from '@/lib/photos'
import PhotoTile from './PhotoTile'
import { FILTERS, parseFilter, pad, toLightboxItem, type Filter } from './format'

type Density = 3 | 5

// ---- URL-backed state: ?c=<tab>&p=<open photo id> --------------------------
// The URL is the source of truth, so links are shareable (the home carousel
// links straight to a photo) and Back/Forward walk through tab changes and
// close the lightbox. pushState doesn't fire an event, so we send our own.
const URL_EVENT = 'photos:url'
/** Marks history entries we pushed to open a photo, so closing can pop them. */
const OPENED = '__photosOpened'
function subscribeUrl(cb: () => void) {
  window.addEventListener('popstate', cb)
  window.addEventListener(URL_EVENT, cb)
  return () => {
    window.removeEventListener('popstate', cb)
    window.removeEventListener(URL_EVENT, cb)
  }
}
const readSearch = () => window.location.search
function setSearch(params: URLSearchParams, mode: 'push' | 'replace', state: object | null = null) {
  const qs = params.toString()
  const url = qs ? `?${qs}` : window.location.pathname
  if (mode === 'push') window.history.pushState(state, '', url)
  else window.history.replaceState({ ...window.history.state, ...state }, '', url)
  window.dispatchEvent(new Event(URL_EVENT))
}

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
 * The interactive part of /photos: tabs, density toggle, grid and lightbox.
 * The server page passes the manifest and the query it was requested with, so
 * the first paint already shows the right tab. `children`
 * is the page title, laid out opposite the controls.
 */
export default function PhotoGallery({
  photos,
  initialSearch,
  children,
}: {
  photos: PhotoEntry[]
  /** The query string the page was requested with (e.g. "?c=events&p=x"). */
  initialSearch: string
  children: React.ReactNode
}) {
  const search = useSyncExternalStore(subscribeUrl, readSearch, () => initialSearch)
  const params = useMemo(() => new URLSearchParams(search), [search])
  const requested = parseFilter(params.get('c'))
  const openId = params.get('p')
  const density = useSyncExternalStore<Density>(subscribeDensity, readDensity, () => 3)
  const [ready, setReady] = useState(false)

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
  const found = openId ? visible.findIndex((p) => p.id === openId) : -1
  // The lightbox is client-only (it portals into <body>), so a deep-linked
  // ?p= opens right after hydration.
  const open = ready && found >= 0 ? found : null

  // Desktop holds the rise-in until hydration (see photos.css), so a remembered
  // 5-column choice is applied before any tile is visible.
  useEffect(() => setReady(true), [])

  const selectFilter = (e: React.MouseEvent, key: Filter) => {
    // Let modified clicks open a new tab like any link would.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    if (key === filter) return
    withTransition(() => setSearch(new URLSearchParams(key === 'all' ? '' : { c: key }), 'push'))
  }

  const selectDensity = (d: Density) => {
    if (d !== density) withTransition(() => writeDensity(d))
  }

  // Opening pushes ?p= (so Back closes); moving between photos replaces it.
  const onOpen = useCallback(
    (i: number) => {
      const next = new URLSearchParams(window.location.search)
      next.set('p', visible[i].id)
      setSearch(next, 'push', { [OPENED]: true })
    },
    [visible]
  )
  const onIndexChange = useCallback(
    (i: number) => {
      const next = new URLSearchParams(window.location.search)
      next.set('p', visible[i].id)
      setSearch(next, 'replace')
    },
    [visible]
  )
  // Closing pops the entry we pushed; a deep link (nothing to pop) just drops
  // ?p= in place, leaving you on that tab of the gallery.
  const onClose = useCallback(() => {
    if (window.history.state?.[OPENED]) return window.history.back()
    const next = new URLSearchParams(window.location.search)
    next.delete('p')
    setSearch(next, 'replace')
  }, [])

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

      {/* Keyed by filter so a tab change replays the staggered rise-in. */}
      <div key={filter} className="ph-grid">
        {visible.map((p, i) => (
          <PhotoTile key={p.id} photo={p} index={i} onOpen={onOpen} />
        ))}
      </div>

      <Lightbox items={items} index={open} onIndexChange={onIndexChange} onClose={onClose} />
    </div>
  )
}
