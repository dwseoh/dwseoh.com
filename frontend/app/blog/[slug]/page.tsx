import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Markdown from '@/lib/markdown'
import { getPost, getAllPosts } from '@/lib/blog'
import { inter, gowunDodum } from '@/app/fonts'
import ViewCounter from '@/components/blog/ViewCounter'
import LikeButton from '@/components/blog/LikeButton'
import ReadingProgress from '@/components/blog/ReadingProgress'
import PostNav from '@/components/blog/PostNav'
import { ClockIcon, ArrowLeftIcon } from '@/components/blog/Icons'
import { copy } from '../copy'

interface PageParams {
  params: Promise<{ slug: string }>
}

function formatDate(date: string, lang: string): string {
  const d = new Date(`${date}T12:00:00`)
  return new Intl.DateTimeFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
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
          {copy.backToList}
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
                  {copy.by} {copy.author}
                </span>
                <div className="blog-meta">
                  <time className="blog-meta-item" dateTime={post.date}>
                    {formatDate(post.date, post.lang)}
                  </time>
                  <span className="blog-meta-item">
                    <ClockIcon />
                    {post.readingMinutes} {copy.minRead}
                  </span>
                  <ViewCounter slug={slug} label={copy.views} />
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

          <LikeButton slug={slug} prompt={copy.likePrompt} likedLabel={copy.likedLabel} />
        </article>

        <PostNav
          newer={newer}
          older={older}
          labels={{ newer: copy.postNav.newer, older: copy.postNav.older }}
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
    </>
  )
}
