import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing, getPathname } from '@/i18n/routing'
import { inter, gowunDodum } from '../fonts'

// Existing headshot used as the social-share image until a dedicated
// 1200x630 OG image is added (see app/opengraph-image note in the report).
const OG_IMAGE = '/images/photos/headshot.jpg'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })

  const title = t('title')
  const description = t('description')
  // localePrefix is 'as-needed', so `en` resolves to '/' and `ko` to '/ko'.
  const canonical = getPathname({ href: '/', locale })

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: getPathname({ href: '/', locale: 'en' }),
        ko: getPathname({ href: '/', locale: 'ko' }),
        'x-default': getPathname({ href: '/', locale: routing.defaultLocale }),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'dwseoh.com',
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      type: 'website',
      images: [{ url: OG_IMAGE, width: 1600, height: 1066, alt: 'Jamie Seoh' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@sdw1_',
      images: [OG_IMAGE],
    },
  }
}

// JSON-LD Person structured data (schema.org). Rendered as a plain script
// tag so it appears in the server-rendered HTML for search engines.
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Jamie Seoh',
  alternateName: ['Dongwan Seoh', '서동완'],
  url: 'https://dwseoh.com',
  image: 'https://dwseoh.com/images/photos/headshot.jpg',
  jobTitle: 'Software Engineer',
  email: 'contact@dwseoh.com',
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'University of Waterloo',
    url: 'https://uwaterloo.ca',
  },
  worksFor: {
    '@type': 'Organization',
    name: 'Cerebras Systems',
    url: 'https://cerebras.ai',
  },
  sameAs: [
    'https://www.linkedin.com/in/jamie-seoh',
    'https://github.com/dwseoh',
    'https://x.com/sdw1_',
    'https://www.instagram.com/dongwan_seoh/',
    'https://substack.com/@dwseoh',
    'https://devpost.com/dwseoh',
  ],
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'en' | 'ko')) notFound()

  const messages = await getMessages()

  return (
    <div lang={locale} className={locale === 'ko' ? gowunDodum.className : inter.className}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
    </div>
  )
}
