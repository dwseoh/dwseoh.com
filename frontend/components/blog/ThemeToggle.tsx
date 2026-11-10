'use client'

import { useSyncExternalStore } from 'react'
import { SunIcon, MoonIcon } from './Icons'

type Theme = 'light' | 'dark'

const DARK_QUERY = '(prefers-color-scheme: dark)'

/** Re-read when <html data-theme> changes or the system theme flips. */
function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributeFilter: ['data-theme'] })
  const media = window.matchMedia(DARK_QUERY)
  media.addEventListener('change', onChange)
  return () => {
    observer.disconnect()
    media.removeEventListener('change', onChange)
  }
}

/** No saved choice → the page is following the system theme. */
function readTheme(): Theme {
  const current =
    document.documentElement.getAttribute('data-theme') ??
    (window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light')
  return current === 'dark' ? 'dark' : 'light'
}

/**
 * Light/dark switch for the blog surface. Without a saved choice the page
 * follows the system theme; the pre-paint script in the root layout applies a
 * saved one as `data-theme` on <html> before React mounts (no flash). This
 * reads the current theme, flips it on click, and persists the choice. Only
 * sub-page styles react to the attribute, so the portfolio is unaffected.
 */
export default function ThemeToggle({ label }: { label: string }) {
  // null on the server and during hydration; the real theme right after.
  const theme = useSyncExternalStore<Theme | null>(subscribeTheme, readTheme, () => null)

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    // Setting the attribute notifies subscribeTheme, which re-renders us.
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('blog-theme', next)
    } catch {
      /* private mode — the choice just won't persist */
    }
  }

  // Render a stable, icon-less button until mounted so SSR and first client
  // paint agree (the actual theme was already applied to <html> by the script).
  return (
    <button
      type="button"
      onClick={toggle}
      className="subbar-icon"
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? <SunIcon size={17} /> : theme === 'light' ? <MoonIcon size={17} /> : null}
    </button>
  )
}
