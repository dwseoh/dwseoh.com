import { getTranslations } from 'next-intl/server'
import { newsreader } from '@/app/fonts'
import BlogNav from '@/components/blog/BlogNav'
import { getAllPosts } from '@/lib/blog'

// The blog publishes on Substack (see the Person JSON-LD sameAs); "Subscribe"
// and the newsletter form hand off there. Change in one place to repoint it.
export const SUBSTACK_URL = 'https://substack.com/@dwseoh'

/**
 * Standalone chrome for the blog: a sticky publication nav sits above every
 * blog page, and `.blog-root` scopes the editorial theme (serif display type +
 * light/dark palette) so the light-only portfolio is never affected.
 */
export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('blog')
  const posts = await getAllPosts()
  const navPosts = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    category: p.category,
    tags: p.tags,
  }))

  return (
    <div className={`blog-root ${newsreader.variable}`}>
      <BlogNav
        posts={navPosts}
        substackUrl={SUBSTACK_URL}
        labels={{
          home: t('chrome.home'),
          blogHome: t('chrome.blogHome'),
          subscribe: t('chrome.subscribe'),
          search: t('chrome.search'),
          searchPlaceholder: t('chrome.searchPlaceholder'),
          searchEmpty: t('chrome.searchEmpty'),
          theme: t('chrome.theme'),
        }}
      />
      {children}
    </div>
  )
}
