import type { Metadata } from 'next'
import { Inter, Gowun_Dodum } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import './globals.css'

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  return (
    <html lang={locale}>
      <body className={locale === 'ko' ? gowunDodum.className : inter.className}>
        {children}
      </body>
    </html>
  )
}
