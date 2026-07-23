import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import Markdown from '@/lib/markdown'
import { getPost, getAllPosts } from '@/lib/blog'
import { inter, gowunDodum } from '@/app/fonts'
import ViewCounter from '@/components/blog/ViewCounter'
import LikeButton from '@/components/blog/LikeButton'
import ReadingProgress from '@/components/blog/ReadingProgress'
import PostNav from '@/components/blog/PostNav'
import { ClockIcon, ArrowLeftIcon } from '@/components/blog/Icons'

interface PageParams {
  params: Promise<{ locale: string; slug: string }>
}

function formatDate(date: string, locale: string): string {
  const d = new Date(`${date}T12:00:00`)
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — Jamie Seoh`,
    description: post.summary,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      url: `/blog/${slug}`,
      publishedTime: post.date,
      tags: post.tags,
    },
  }
}

export default async function BlogPost({ params }: PageParams) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const t = await getTranslations('blog')
  const uiLocale = await getLocale()
  const fontClass = post.lang === 'ko' ? gowunDodum.className : inter.className

  // Newest-first archive → the newer neighbour is the previous index, older next.
  const all = await getAllPosts()
  const idx = all.findIndex((p) => p.slug === slug)
  const newer = idx > 0 ? all[idx - 1] : undefined
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined

  const kicker = post.category ?? post.tags[0]
  const year = new Date().getFullYear()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    keywords: post.tags.join(', '),
    inLanguage: post.lang,
    author: { '@type': 'Person', name: 'Jamie Seoh', url: 'https://dwseoh.com' },
    url: `https://dwseoh.com/blog/${slug}`,
  }

  return (
    <>
      <ReadingProgress />

      <main className="blog-main">
        <Link href="/blog" className="blog-back">
          <ArrowLeftIcon size={15} />
          {t('backToList')}
        </Link>

        <article className={`blog-article ${fontClass}`} lang={post.lang}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <header className="blog-post-header">
            {kicker && <p className="blog-kicker">{kicker}</p>}
            <h1 className="blog-post-title">{post.title}</h1>
            {post.summary && <p className="blog-post-sub">{post.summary}</p>}

            <div className="blog-byline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/photos/headshot-thumb.jpg"
                alt=""
                className="blog-byline-avatar"
                width={40}
                height={40}
              />
              <div className="blog-byline-text">
                <span className="blog-byline-author">
                  {t('by')} {t('author')}
                </span>
                <div className="blog-meta">
                  <time className="blog-meta-item" dateTime={post.date}>
                    {formatDate(post.date, uiLocale)}
                  </time>
                  <span className="blog-meta-item">
                    <ClockIcon />
                    {post.readingMinutes} {t('minRead')}
                  </span>
                  <ViewCounter slug={slug} label={t('views')} />
                </div>
              </div>
            </div>
          </header>

          {post.cover && (
            <figure className="blog-cover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover} alt="" />
            </figure>
          )}

          <div className="prose">
            <Markdown>{post.content}</Markdown>
          </div>

          {post.tags.length > 0 && (
            <div className="blog-post-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="blog-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <LikeButton slug={slug} prompt={t('likePrompt')} likedLabel={t('likedLabel')} />
        </article>

        <PostNav
          newer={newer}
          older={older}
          labels={{ newer: t('postNav.newer'), older: t('postNav.older') }}
        />

        <footer className="blog-footer">
          <p className="blog-copyright">© {year} {t('brand')}</p>
        </footer>
      </main>
    </>
  )
}
