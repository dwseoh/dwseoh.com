'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
// Theme toggle is hidden for now (the blog follows the system theme) but kept fully functional.
// Re-enable by uncommenting this import and the <ThemeToggle /> below.
// import ThemeToggle from './ThemeToggle'
import SubpageBar from '@/components/subpage/SubpageBar'
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
  // trailing, current crumb. The blog is English-only and lives outside
  // [locale], so the pathname is already a plain /blog/... path.
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
      <SubpageBar
        home={labels.home}
        section={{ label: labels.blogHome, href: '/blog', short: '..' }}
        current={currentPost?.title}
        width="read"
      >
        <button
          type="button"
          className="subbar-icon"
          aria-label={labels.search}
          title={labels.search}
          onClick={() => setSearchOpen(true)}
        >
          <SearchIcon size={17} />
        </button>

        {/* Theme toggle hidden for now — the blog follows the system theme (like
            /photos). It still works; restore it (and the import above) to bring
            the switch back: <ThemeToggle label={labels.theme} /> */}
      </SubpageBar>

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
                className="subbar-icon"
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
                      {p.category && <span className="eyebrow blog-search-kicker">{p.category}</span>}
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
