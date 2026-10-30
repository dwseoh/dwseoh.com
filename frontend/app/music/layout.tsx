import { newsreader } from '@/app/fonts'
import './music.css'

/**
 * /music is its own little world: it doesn't share the portfolio's or the
 * blog's palette. Everything is scoped under `.mus-root` in ./music.css.
 * Like the blog, it sits outside `[locale]` (English-only).
 */
export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return <div className={newsreader.variable}>{children}</div>
}
