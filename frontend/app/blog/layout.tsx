import { newsreader } from '@/app/fonts'
import BlogNav from '@/components/blog/BlogNav'
import { getAllPosts } from '@/lib/blog'
import { copy } from './copy'

/**
 * Standalone chrome for the blog: a sticky publication nav sits above every
 * blog page, and `.blog-root` scopes the editorial theme so the light-only
 * portfolio is never affected.
 *
 * The blog sits outside `[locale]` and is English-only — copy comes from
 * ./copy.ts rather than next-intl.
 */
export default async function BlogLayout({ children }: { children: React.ReactNode }) {
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
        labels={{
          home: copy.chrome.home,
          blogHome: copy.chrome.blogHome,
          search: copy.chrome.search,
          searchPlaceholder: copy.chrome.searchPlaceholder,
          searchEmpty: copy.chrome.searchEmpty,
          theme: copy.chrome.theme,
        }}
      />
      {children}
    </div>
  )
}
