import type { MetadataRoute } from 'next'
import { routing, getPathname } from '@/i18n/routing'

const BASE_URL = 'https://dwseoh.com'

export default function sitemap(): MetadataRoute.Sitemap {
  // Language alternates for the homepage across both locales.
  // localePrefix is 'as-needed', so `en` -> '/' and `ko` -> '/ko'.
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, BASE_URL + getPathname({ href: '/', locale })])
  )

  return [
    {
      url: BASE_URL + getPathname({ href: '/', locale: routing.defaultLocale }),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
      alternates: { languages },
    },
  ]
}
