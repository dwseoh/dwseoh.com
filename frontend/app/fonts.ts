import { Inter, Gowun_Dodum, Newsreader } from 'next/font/google'

export const inter = Inter({ subsets: ['latin'] })
export const gowunDodum = Gowun_Dodum({ weight: '400', subsets: ['latin'] })

// Serif used by the standalone music page.
export const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})
