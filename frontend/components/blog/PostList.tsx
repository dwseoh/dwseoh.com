'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { fetchStats, statsEnabled, formatCount, type Stat } from '@/lib/stats'
import TileImage from '@/components/subpage/TileImage'
import { EyeIcon, HeartIcon, ClockIcon } from './Icons'
import type { PostMeta } from '@/lib/blog'

interface Labels {
  minRead: string
  minReadShort: string
  empty: string
}

// Max posts per page — a new page starts every 5 posts.
const PAGE_SIZE = 5

/** A post's category: its `category`, else its first tag (the row's label). */
const kickerOf = (p: PostMeta) => p.category ?? p.tags[0]

function formatDate(date: string): string {
  // Anchor at midday so the UTC date never slips a day when localized.
  const d = new Date(`${date}T12:00:00`)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * The blog index below the top bar: heading (passed in as `children`, so it
 * stays server-rendered), then one paginated list of every post.
 */
export default function PostList({
  posts,
  labels,
  children,
}: {
  posts: PostMeta[]
  labels: Labels
  children: React.ReactNode
}) {
  const [stats, setStats] = useState<Record<string, Stat> | null>(null)
  const [page, setPage] = useState(1)
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!statsEnabled) return
    let live = true
    fetchStats(posts.map((p) => p.slug)).then((s) => {
      if (live) setStats(s)
    })
    return () => {
      live = false
    }
  }, [posts])

  const pageCount = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const visible = useMemo(() => {
    const start = (current - 1) * PAGE_SIZE
    return posts.slice(start, start + PAGE_SIZE)
  }, [posts, current])

  function goToPage(next: number) {
    setPage(next)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const head = (
    <header className="page-head blog-index-head">
      {children}
    </header>
  )

  if (posts.length === 0) {
    return (
      <>
        {head}
        <p className="blog-empty">{labels.empty}</p>
      </>
    )
  }

  return (
    <>
      {head}
      <div ref={topRef} className="blog-list-wrap">
        <div className="blog-list">
          {visible.map((post, i) => {
            const s = stats?.[post.slug]
            const kicker = kickerOf(post)
            return (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card tile-zoom">
                <article className="blog-card-body">
                  <div className="blog-card-text">
                    {kicker && <span className="eyebrow blog-card-kicker">{kicker}</span>}
                    <h2 className="blog-card-title">{post.title}</h2>
                    {post.summary && <p className="blog-card-summary">{post.summary}</p>}

                    <div className="blog-meta blog-card-meta">
                      <time className="blog-meta-item" dateTime={post.date}>
                        {formatDate(post.date)}
                      </time>
                      <span className="blog-meta-item">
                        <ClockIcon />
                        {/* Number + unit must stay ONE flex item: .blog-meta-item is
                            inline-flex, and a whitespace-only text node between two
                            flex items is dropped, so the space would become the 5px
                            gap instead. */}
                        <span className="blog-meta-read">
                          {post.readingMinutes}{' '}
                          <span className="blog-meta-label">{labels.minRead}</span>
                          <span className="blog-meta-label-short">{labels.minReadShort}</span>
                        </span>
                      </span>
                      {s && (
                        <span className="blog-meta-item">
                          <EyeIcon />
                          {formatCount(s.views)}
                        </span>
                      )}
                      {s && s.likes > 0 && (
                        <span className="blog-meta-item">
                          <HeartIcon />
                          {formatCount(s.likes)}
                        </span>
                      )}
                    </div>
                  </div>

                  {post.cover && <TileImage src={post.cover} className="blog-card-thumb" eager={i < 2} />}
                </article>
              </Link>
            )
          })}
        </div>

        {pageCount >= 1 && (
          <nav className="blog-pager" aria-label="Pagination">
            <button
              type="button"
              className="blog-pager-arrow"
              onClick={() => goToPage(current - 1)}
              disabled={current === 1}
              aria-label="Previous page"
            >
              ‹
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`blog-pager-num${n === current ? ' is-active' : ''}`}
                onClick={() => goToPage(n)}
                aria-current={n === current ? 'page' : undefined}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className="blog-pager-arrow"
              onClick={() => goToPage(current + 1)}
              disabled={current === pageCount}
              aria-label="Next page"
            >
              ›
            </button>
          </nav>
        )}
      </div>
    </>
  )
}
