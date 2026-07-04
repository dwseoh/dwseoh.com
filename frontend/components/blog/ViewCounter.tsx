'use client'

import { useEffect, useState } from 'react'
import { registerView, statsEnabled, formatCount } from '@/lib/stats'
import { EyeIcon } from './Icons'

/**
 * Registers a view on mount (once per session, per lib/stats) and shows the
 * running count. Renders nothing until a number is known, so it never flashes
 * a placeholder — and nothing at all when the stats API is unconfigured.
 */
export default function ViewCounter({ slug, label }: { slug: string; label: string }) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    if (!statsEnabled) return
    let live = true
    registerView(slug).then((n) => {
      if (live && n !== null) setViews(n)
    })
    return () => {
      live = false
    }
  }, [slug])

  if (!statsEnabled || views === null) return null

  return (
    <span className="blog-meta-item" title={`${views.toLocaleString()} ${label}`}>
      <EyeIcon />
      {formatCount(views)}
    </span>
  )
}
