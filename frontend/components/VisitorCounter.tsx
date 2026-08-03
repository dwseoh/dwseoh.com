'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { registerVisit, statsEnabled, formatCount } from '@/lib/stats'

/**
 * "342 people have visited this website." for the site footer.
 *
 * Registering this browser with the stats Worker on mount is what makes the
 * number go up (once per session, see lib/stats); the response carries the
 * running total back. Renders nothing until it has a number — so the footer
 * never flashes a placeholder, and simply reads "© 2026 Jamie Seoh." when the
 * stats API is unconfigured or unreachable.
 */
export default function VisitorCounter() {
  const t = useTranslations()
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    if (!statsEnabled) return
    let live = true
    registerVisit().then((visit) => {
      if (live && visit) setTotal(visit.total)
    })
    return () => {
      live = false
    }
  }, [])

  if (total === null) return null

  return (
    <span className="visitor-count" data-tip={t('visitorSince')}>
      {/* `count` picks the plural form, `display` is the abbreviated 1.2k/3.4m
          rendering the blog counters already use. */}
      {t('visitorCount', { count: total, display: formatCount(total) })}
    </span>
  )
}
