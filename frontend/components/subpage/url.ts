'use client'

import { flushSync } from 'react-dom'

// ---- URL-backed view state (?c=<tab>, /photos' ?p=<photo>) -----------------
// The URL is the source of truth, so filtered views are shareable and
// Back/Forward walk through them. Pages read it with
// useSyncExternalStore(subscribeUrl, readSearch, () => initialSearch).
// pushState doesn't fire an event, so setSearch sends our own.
const URL_EVENT = 'subpage:url'

export function subscribeUrl(cb: () => void) {
  window.addEventListener('popstate', cb)
  window.addEventListener(URL_EVENT, cb)
  return () => {
    window.removeEventListener('popstate', cb)
    window.removeEventListener(URL_EVENT, cb)
  }
}

export const readSearch = () => window.location.search

export function setSearch(params: URLSearchParams, mode: 'push' | 'replace', state: object | null = null) {
  const qs = params.toString()
  const url = qs ? `?${qs}` : window.location.pathname
  if (mode === 'push') window.history.pushState(state, '', url)
  else window.history.replaceState({ ...window.history.state, ...state }, '', url)
  window.dispatchEvent(new Event(URL_EVENT))
}

/** True for clicks that should keep the browser's own link behaviour (new tab etc.). */
export const isModifiedClick = (e: React.MouseEvent) =>
  e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0

/** Cross-fade a synchronous state change when the View Transitions API exists. */
export function withTransition(update: () => void) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduced) return update()
  document.startViewTransition(() => flushSync(update))
}
