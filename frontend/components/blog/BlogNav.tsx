'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, usePathname } from '@/i18n/routing'
// Theme toggle is hidden for now (blog is light-only) but kept fully functional.
// Re-enable by uncommenting this import and the <ThemeToggle /> below.
// import ThemeToggle from './ThemeToggle'
import { SearchIcon, CloseIcon, ArrowRightIcon } from './Icons'

export interface NavPost {
  slug: string
  title: string
  summary: string
  category?: string
  tags: string[]
}

interface Labels {
  home: string
  blogHome: string
  subscribe: string
  search: string
  searchPlaceholder: string
  searchEmpty: string
  theme: string
}

export default function BlogNav({
  posts,
  labels,
}: {
  posts: NavPost[]
  labels: Labels
}) {
  const pathname = usePathname()

  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // If we're on an individual post (`/blog/<slug>`), surface its title as the
  // trailing, current crumb. usePathname() from next-intl is locale-stripped.
  const currentPost = useMemo(() => {
    const m = /^\/blog\/([^/]+)\/?$/.exec(pathname)
    if (!m) return null
    return posts.find((p) => p.slug === m[1]) ?? null
  }, [pathname, posts])

  // Close the search palette on Escape; focus the field when it opens.
  useEffect(() => {
    if (!searchOpen) return
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return posts
    return posts.filter((p) =>
      [p.title, p.summary, p.category ?? '', p.tags.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [query, posts])

  function closeSearch() {
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <>
      <header className="blog-nav">
        <div className="blog-nav-inner">
          <nav className="blog-crumbs" aria-label="Breadcrumb">
            {/* dwseoh.com — the portfolio home is the site root. Logo + name are
                a single clickable crumb back to the portfolio. */}
            <Link href="/" className="blog-crumb blog-crumb-home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/favicon.png"
                alt=""
                className="blog-crumb-logo"
                width={18}
                height={18}
              />
              {labels.home}
            </Link>
            <span className="blog-crumb-sep" aria-hidden="true">/</span>
            <Link
              href="/blog"
              className="blog-crumb blog-crumb-blog"
              aria-current={currentPost ? undefined : 'page'}
            >
              {labels.blogHome}
            </Link>
            {currentPost && (
              <span className="blog-crumb-tail">
                <span className="blog-crumb-sep" aria-hidden="true">/</span>
                <span className="blog-crumb-current" aria-current="page">
                  {currentPost.title}
                </span>
              </span>
            )}
          </nav>

          <div className="blog-nav-actions">
            <button
              type="button"
              className="blog-nav-icon"
              aria-label={labels.search}
              title={labels.search}
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon size={17} />
            </button>

            {/* Theme toggle hidden for now — blog is light-only. It still works;
                restore it (and the import above) to bring the switch back:
                <ThemeToggle label={labels.theme} /> */}
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="blog-search" role="dialog" aria-modal="true" aria-label={labels.search}>
          <div className="blog-search-backdrop" onClick={closeSearch} />
          <div className="blog-search-panel">
            <div className="blog-search-field">
              <SearchIcon size={18} className="blog-search-lead" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={labels.searchPlaceholder}
                className="blog-search-input"
              />
              <button
                type="button"
                className="blog-nav-icon"
                aria-label="Close"
                onClick={closeSearch}
              >
                <CloseIcon size={17} />
              </button>
            </div>

            <div className="blog-search-results">
              {results.length === 0 ? (
                <p className="blog-search-empty">{labels.searchEmpty}</p>
              ) : (
                results.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className="blog-search-item"
                    onClick={closeSearch}
                  >
                    <span className="blog-search-item-main">
                      {p.category && <span className="blog-search-kicker">{p.category}</span>}
                      <span className="blog-search-item-title">{p.title}</span>
                      {p.summary && <span className="blog-search-item-sum">{p.summary}</span>}
                    </span>
                    <ArrowRightIcon size={16} className="blog-search-item-arrow" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
