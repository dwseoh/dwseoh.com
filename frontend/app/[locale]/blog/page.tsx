import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import PostList from '@/components/blog/PostList'
import Newsletter from '@/components/blog/Newsletter'
import CoffeeCup from '@/components/blog/CoffeeCup'
import { getAllPosts } from '@/lib/blog'
import { SUBSTACK_URL } from './layout'

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
        <h1 className="blog-title">
          {t('title')}
          <CoffeeCup />
        </h1>
        <p className="blog-intro">{t('intro')}</p>
      </header>

      <PostList posts={posts} labels={{ minRead: t('minRead'), empty: t('empty') }} />

      <footer className="blog-footer">
        <Newsletter
          substackUrl={SUBSTACK_URL}
          labels={{
            heading: t('newsletter.heading'),
            subtext: t('newsletter.subtext'),
            placeholder: t('newsletter.placeholder'),
            cta: t('newsletter.cta'),
            done: t('newsletter.done'),
          }}
        />
        <p className="blog-copyright">© {year} {t('brand')}</p>
      </footer>
    </main>
  )
}
