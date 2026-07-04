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
    // The pre-paint script below sets data-theme on <html> before React
    // hydrates, so suppress the expected attribute mismatch on this element.
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Set the theme before first paint so the blog never flashes the wrong
            palette. Only the blog surface (.blog-root) reacts to [data-theme],
            so this leaves the light-only portfolio untouched. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('blog-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  )
}
