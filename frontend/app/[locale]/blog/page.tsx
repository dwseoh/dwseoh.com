import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import PostList from '@/components/blog/PostList'
import { getAllPosts } from '@/lib/blog'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('blog')
  return {
    title: t('seo.title'),
    description: t('seo.description'),
    alternates: { canonical: '/blog' },
    openGraph: {
      title: t('seo.title'),
      description: t('seo.description'),
      url: '/blog',
      type: 'website',
    },
  }
}

export default async function BlogIndex() {
  const t = await getTranslations('blog')
  const posts = await getAllPosts()
  const year = new Date().getFullYear()

  return (
    <main className="blog-main">
      <header className="blog-header">
        <h1 className="blog-title">{t('title')}</h1>
        <p className="blog-intro">{t('intro')}</p>
      </header>

      {/* Notion-style section label, mirroring the homepage's section headings. */}
      <div className="blog-eyebrow">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        {t('latest')}
      </div>

      <PostList posts={posts} labels={{ minRead: t('minRead'), empty: t('empty') }} />

      <footer className="blog-footer">
        <p className="blog-copyright">© {year} {t('brand')}</p>
      </footer>
    </main>
  )
}
