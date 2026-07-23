import type { MetadataRoute } from 'next'
import { routing, getPathname } from '@/i18n/routing'
import { getAllPosts } from '@/lib/blog'

const BASE_URL = 'https://dwseoh.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Language alternates for the homepage across both locales.
  // localePrefix is 'as-needed', so `en` -> '/' and `ko` -> '/ko'.
  const homeLanguages = Object.fromEntries(
    routing.locales.map((locale) => [locale, BASE_URL + getPathname({ href: '/', locale })])
  )

  // One <url> entry per locale for the homepage, each advertising all language
  // alternates (Google's recommended hreflang-in-sitemap structure).
  const home: MetadataRoute.Sitemap = routing.locales.map((locale) => ({
    url: BASE_URL + getPathname({ href: '/', locale }),
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 1,
    alternates: { languages: homeLanguages },
  }))

  // Blog listing + one entry per post. The blog is English-only and lives
  // outside [locale], so these are plain, unprefixed URLs.
  const blogListing: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const posts = await getAllPosts()
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'yearly',
    priority: 0.6,
  }))

  return [...home, ...blogListing, ...postEntries]
}
