import type { Metadata } from 'next'
import { Link } from '@/i18n/routing'
import { compositions } from '@/data/compositions'

export const metadata: Metadata = {
  title: 'Compositions — Jamie Seoh',
  description: 'Original compositions by Jamie Seoh, with note-level synced scores.',
}

export default function CompositionsIndex() {
  return (
    <main style={{ maxWidth: 'var(--n-width)', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
      <Link href="/" className="back-link" style={{ fontSize: '0.875rem', color: 'var(--n-secondary)' }}>
        ← back home
      </Link>

      <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '1rem 0 0.5rem' }}>
        Compositions
      </h1>
      <p style={{ color: 'var(--n-secondary)', lineHeight: 1.7, margin: '0 0 2rem' }}>
        A few of my pieces, each with a note-level synced score — press play and the notes light up in
        time with the music.
      </p>

      <div className="composition-grid">
        {compositions.map((c) => (
          <Link key={c.slug} href={`/compositions/${c.slug}`} className="composition-card">
            <div className="composition-card-cover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.cover} alt={`${c.title} cover art`} loading="lazy" />
            </div>
            <div className="composition-card-body">
              <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{c.title}</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--n-secondary)', margin: '4px 0 0' }}>
                {c.ensemble} · {c.year}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
