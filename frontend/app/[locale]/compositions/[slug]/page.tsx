import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { getComposition } from '@/data/compositions'
import ScorePlayer from '@/components/ScorePlayer'

type Params = Promise<{ locale: string; slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const piece = getComposition(slug)
  if (!piece) return { title: 'Composition — Jamie Seoh' }
  return {
    title: `${piece.title} — Jamie Seoh`,
    description: `${piece.title} (${piece.year}) for ${piece.ensemble}.`,
  }
}

function isYouTube(url: string) {
  return /youtube\.com|youtu\.be/.test(url)
}

function youTubeEmbed(url: string) {
  const id = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1]
  return id ? `https://www.youtube.com/embed/${id}` : null
}

export default async function CompositionDetail({ params }: { params: Params }) {
  const { slug } = await params
  const piece = getComposition(slug)
  if (!piece) notFound()

  const embed = piece.video && isYouTube(piece.video) ? youTubeEmbed(piece.video) : null

  return (
    <main style={{ maxWidth: 'var(--n-width)', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
      <Link href="/compositions" className="back-link" style={{ fontSize: '0.875rem', color: 'var(--n-secondary)' }}>
        ← all compositions
      </Link>

      <header className="composition-header">
        <div className="composition-header-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={piece.cover} alt={`${piece.title} cover art`} />
        </div>
        <div className="composition-header-meta">
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            {piece.title}
          </h1>
          <p style={{ color: 'var(--n-secondary)', margin: '8px 0 0' }}>
            {piece.ensemble} · {piece.year}
            {piece.duration ? ` · ${piece.duration}` : ''}
          </p>
        </div>
      </header>

      <section style={{ margin: '2rem 0' }}>
        {piece.note.split('\n\n').map((para, i) => (
          <p key={i} style={{ lineHeight: 1.8, margin: '0 0 1rem' }}>
            {para}
          </p>
        ))}
      </section>

      <ScorePlayer musicXml={piece.musicXml} />

      {(piece.audio || piece.video) && (
        <section style={{ marginTop: '2.5rem' }}>
          <h2
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--n-secondary)',
              margin: '0 0 0.875rem',
            }}
          >
            Recording
          </h2>
          {piece.audio && <audio controls src={piece.audio} style={{ width: '100%' }} />}
          {embed && (
            <div className="composition-video">
              <iframe
                src={embed}
                title={`${piece.title} performance`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {piece.video && !embed && (
            <video controls src={piece.video} style={{ width: '100%', borderRadius: '12px' }} />
          )}
        </section>
      )}
    </main>
  )
}
