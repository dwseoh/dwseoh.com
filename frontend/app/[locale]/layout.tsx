import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { inter, gowunDodum } from '../fonts'

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
      <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
    </div>
  )
}
