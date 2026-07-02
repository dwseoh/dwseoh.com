import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { inter } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://dwseoh.com'),
  title: 'Jamie Seoh (SE @ UWaterloo)',
  description:
    "Jamie Seoh's personal website — Software Engineering @ University of Waterloo, AI Software Engineering Intern @ Cerebras Systems, musician and community builder.",
  openGraph: {
    siteName: 'dwseoh.com',
    title: 'Dongwan Jamie Seoh',
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
