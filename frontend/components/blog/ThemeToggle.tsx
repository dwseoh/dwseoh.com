'use client'

import { useEffect, useState } from 'react'
import { SunIcon, MoonIcon } from './Icons'

/**
 * Light/dark switch for the blog surface. Without a saved choice the page
 * follows the system theme; the pre-paint script in the root layout applies a
 * saved one as `data-theme` on <html> before React mounts (no flash). This
 * reads the current theme, flips it on click, and persists the choice. Only
 * sub-page styles react to the attribute, so the portfolio is unaffected.
 */
export default function ThemeToggle({ label }: { label: string }) {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)

  useEffect(() => {
    // No saved choice → the page is following the system theme.
    const current =
      document.documentElement.getAttribute('data-theme') ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setTheme(current === 'dark' ? 'dark' : 'light')
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('blog-theme', next)
    } catch {
      /* private mode — the choice just won't persist */
    }
    setTheme(next)
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
