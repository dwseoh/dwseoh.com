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
        {/* Blog is light-only for now: force the light palette before first paint.
            The ThemeToggle component still works — to bring dark mode back, restore
            the detection script below and un-hide the toggle in BlogNav.
            Detection version:
              var t=localStorage.getItem('blog-theme');
              if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
              document.documentElement.setAttribute('data-theme',t); */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.setAttribute('data-theme','light');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  )
}
