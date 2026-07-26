'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { fetchStats, statsEnabled, formatCount, type Stat } from '@/lib/stats'
import { EyeIcon, HeartIcon, ClockIcon } from './Icons'
import type { PostMeta } from '@/lib/blog'

interface Labels {
  minRead: string
  empty: string
}

// Max posts per page — a new page starts every 5 posts.
const PAGE_SIZE = 5

function formatDate(date: string): string {
  // Anchor at midday so the UTC date never slips a day when localized.
  const d = new Date(`${date}T12:00:00`)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export default function PostList({ posts, labels }: { posts: PostMeta[]; labels: Labels }) {
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
  const visible = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return posts.slice(start, start + PAGE_SIZE)
  }, [posts, page])

  function goToPage(next: number) {
    setPage(next)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (posts.length === 0) {
    return <p className="blog-empty">{labels.empty}</p>
  }

  return (
    <div ref={topRef} className="blog-list-wrap">
      <div className="blog-list">
        {visible.map((post) => {
          const s = stats?.[post.slug]
          const kicker = post.category ?? post.tags[0]
          return (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
              <article className="blog-card-body">
                <div className="blog-card-text">
                  {kicker && <span className="blog-card-kicker">{kicker}</span>}
                  <h2 className="blog-card-title">{post.title}</h2>
                  {post.summary && <p className="blog-card-summary">{post.summary}</p>}

                  <div className="blog-meta blog-card-meta">
                    <time className="blog-meta-item" dateTime={post.date}>
                      {formatDate(post.date)}
                    </time>
                    <span className="blog-meta-item">
                      <ClockIcon />
                      {post.readingMinutes} {labels.minRead}
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

                {post.cover && (
                  <div className="blog-card-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.cover} alt="" loading="lazy" />
                  </div>
                )}
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
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            ‹
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={`blog-pager-num${n === page ? ' is-active' : ''}`}
              onClick={() => goToPage(n)}
              aria-current={n === page ? 'page' : undefined}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className="blog-pager-arrow"
            onClick={() => goToPage(page + 1)}
            disabled={page === pageCount}
            aria-label="Next page"
          >
            ›
          </button>
        </nav>
      )}
    </div>
  )
}
