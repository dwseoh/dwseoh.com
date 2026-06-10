import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Gowun_Dodum } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })
const gowunDodum = Gowun_Dodum({ weight: '400', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'dwseoh.com',
  description: "Jamie Seoh's personal website",
  openGraph: {
    siteName: 'dwseoh.com',
    title: 'Dwseoh > Main',
    type: 'website',
    description: "Jamie Seoh's personal website",
  },
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
    <html lang={locale}>
      <body className={locale === 'ko' ? gowunDodum.className : inter.className}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
