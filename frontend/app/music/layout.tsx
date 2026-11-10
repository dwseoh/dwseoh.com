import type { Metadata } from 'next'
import { instrumentSerif } from '@/app/fonts'
import { PAGE_TITLE } from './data'
import './music.css'

const title = `${PAGE_TITLE} — Jamie Seoh`
const description = 'Original compositions by Jamie Seoh: chamber pieces, sketches and solo works.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/music' },
  openGraph: { title, description, url: '/music', type: 'website' },
}

/**
 * The music page. /music is English-only and sits outside `[locale]` (excluded in
 * proxy.ts). All styles are scoped under `.cw-root` in ./music.css.
 */
export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return <div className={instrumentSerif.variable}>{children}</div>
}
