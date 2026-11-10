import type { Metadata } from 'next'
import { instrumentSerif } from '@/app/fonts'
import './music.css'

const title = 'Music Work — Jamie Seoh'
const description =
  'Original compositions, performances and arrangements by Jamie Seoh: chamber pieces, concerts, film and game music, holiday charts and covers.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/music' },
  openGraph: { title, description, url: '/music', type: 'website' },
}

/**
 * The Music Work page. /music is English-only and sits outside `[locale]` (excluded in
 * proxy.ts). All styles are scoped under `.cw-root` in ./music.css.
 */
export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return <div className={instrumentSerif.variable}>{children}</div>
}
