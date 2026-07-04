'use client'

import { useState } from 'react'
import { ArrowRightIcon } from './Icons'

interface Labels {
  heading: string
  subtext: string
  placeholder: string
  cta: string
  done: string
}

/**
 * Newsletter capture. There's no self-hosted list — the site already publishes
 * on Substack — so this opens the publication's real subscribe page with the
 * reader's email pre-filled (`/subscribe?email=`); they just confirm there.
 * `substackUrl` is the publication domain; swap it (or the whole flow) for a
 * different provider and the markup stays the same.
 */
export default function Newsletter({
  labels,
  substackUrl,
}: {
  labels: Labels
  substackUrl: string
}) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const subscribe = `${substackUrl.replace(/\/$/, '')}/subscribe`
    const url = email.trim()
      ? `${subscribe}?email=${encodeURIComponent(email.trim())}`
      : subscribe
    window.open(url, '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  return (
    <section className="blog-news">
      <h2 className="blog-news-heading">{labels.heading}</h2>
      <p className="blog-news-sub">{sent ? labels.done : labels.subtext}</p>
      {!sent && (
        <form className="blog-news-form" onSubmit={onSubmit}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={labels.placeholder}
            className="blog-news-input"
            aria-label={labels.placeholder}
          />
          <button type="submit" className="blog-news-btn">
            {labels.cta}
            <ArrowRightIcon size={15} />
          </button>
        </form>
      )}
    </section>
  )
}
