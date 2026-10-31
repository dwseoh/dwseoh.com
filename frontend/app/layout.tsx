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
    // The pre-paint script below may set data-theme on <html> before React
    // hydrates, so suppress the expected attribute mismatch on this element.
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* The sub-pages (/blog, /photos) follow the system theme via CSS
            (globals.css); the portfolio stays light. A theme saved by the blog's
            ThemeToggle (currently hidden) is applied before first paint and
            overrides the system there. Ad-blocker extensions inject their own
            <script> into <head> before hydration, which React then mistakes
            for this one; suppress that harmless mismatch. */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('blog-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  )
}
