'use client'

import { useEffect, useState } from 'react'
import { SunIcon, MoonIcon } from './Icons'

/**
 * Light/dark switch for the blog surface. The pre-paint script in the root
 * layout sets `data-theme` on <html> before React mounts (no flash); this just
 * reads that value, flips it on click, and persists the choice. Only .blog-root
 * styles react to the attribute, so the portfolio is unaffected.
 */
export default function ThemeToggle({ label }: { label: string }) {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme')
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
      className="blog-nav-icon"
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? <SunIcon size={17} /> : theme === 'light' ? <MoonIcon size={17} /> : null}
    </button>
  )
}
