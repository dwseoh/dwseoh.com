import { getTranslations } from 'next-intl/server'
import { newsreader } from '@/app/fonts'
import BlogNav from '@/components/blog/BlogNav'
import { getAllPosts } from '@/lib/blog'

// Your Substack *publication* — NOT the `@dwseoh` reader profile. The
// publication domain is the only thing that can actually enrol an email: both
// the nav pill and the newsletter form send readers to `${SUBSTACK_URL}/subscribe`
// (the form pre-fills their email via `?email=`). Repoint this in one place.
//   ⚠️ Confirm this is right — a profile URL (substack.com/@handle) will NOT
//   subscribe anyone. Use your publication's `<name>.substack.com` or custom domain.
export const SUBSTACK_URL = 'https://dwseoh.substack.com'

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
