import { Inter, Gowun_Dodum, Newsreader } from 'next/font/google'

export const inter = Inter({ subsets: ['latin'] })
export const gowunDodum = Gowun_Dodum({ weight: '400', subsets: ['latin'] })

// Editorial serif for the blog's display type (titles + prose headings). Exposed
// as a CSS variable so globals.css can opt specific elements into it without
// touching the site-wide sans body. Variable font → full optical weight range.
export const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})
