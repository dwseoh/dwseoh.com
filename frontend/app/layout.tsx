import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { inter } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: "Jamie's Website",
  description: "Jamie Seoh's personal website",
  openGraph: {
    siteName: 'dwseoh.com',
    title: 'Dwseoh > Main',
    type: 'website',
    description: "Jamie Seoh's personal website",
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  return (
    <html lang={locale}>
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  )
}
