import type { Metadata } from 'next'
import PostList from '@/components/blog/PostList'
import { getAllPosts } from '@/lib/blog'
import { copy } from './copy'

export function generateMetadata(): Metadata {
  return {
    title: copy.seo.title,
    description: copy.seo.description,
    alternates: { canonical: '/blog' },
    openGraph: {
      title: copy.seo.title,
      description: copy.seo.description,
      url: '/blog',
      type: 'website',
    },
  }
}

export default async function BlogIndex() {
  const posts = await getAllPosts()
  const year = new Date().getFullYear()

  return (
    <main className="blog-main">
      <header className="blog-header">
        <h1 className="blog-title">{copy.title}</h1>
        <p className="blog-intro">{copy.intro}</p>
      </header>

      <PostList
        posts={posts}
        labels={{ minRead: copy.minRead, minReadShort: copy.minReadShort, empty: copy.empty }}
      />

      <footer className="blog-footer">
        <a
          className="blog-substack"
          href="https://substack.com/@dwseoh"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.85rem',
            color: 'var(--n-secondary)',
            textDecoration: 'underline',
            textUnderlineOffset: '2.5px',
            transition: 'color 0.15s ease',
          }}
        >
          {copy.substack}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17 17 7" />
            <path d="M8 7h9v9" />
          </svg>
        </a>
        <p className="blog-copyright">© {year} {copy.brand}</p>
      </footer>
    </main>
  )
}
