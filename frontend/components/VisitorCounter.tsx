'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { registerVisit, statsEnabled } from '@/lib/stats'

/**
 * "You are the 42nd visitor." for the site footer.
 *
 * Claims an ordinal from the stats Worker on mount (once per session, see
 * lib/stats) and renders nothing until it has a number — so the footer never
 * flashes a placeholder, and simply reads "© 2026 Jamie Seoh." when the stats
 * API is unconfigured or unreachable.
 */
export default function VisitorCounter() {
  const t = useTranslations()
  const [ordinal, setOrdinal] = useState<number | null>(null)

  useEffect(() => {
    if (!statsEnabled) return
    let live = true
    registerVisit().then((visit) => {
      if (live && visit) setOrdinal(visit.ordinal)
    })
    return () => {
      live = false
    }
  }, [])

  if (ordinal === null) return null

  return (
    <span className="visitor-count" data-tip={t('visitorSince')}>
      {t('visitorCount', { count: ordinal })}
    </span>
  )
}
