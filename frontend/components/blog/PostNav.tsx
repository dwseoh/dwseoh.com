import { Link } from '@/i18n/routing'
import { ArrowLeftIcon, ArrowRightIcon } from './Icons'
import type { PostMeta } from '@/lib/blog'

interface Labels {
  newer: string
  older: string
}

/**
 * Previous/next article cards. Posts are newest-first, so for the current post
 * the "newer" neighbour sits to the left and the "older" one to the right —
 * a natural timeline. Either side may be absent at the ends of the archive.
 */
export default function PostNav({
  newer,
  older,
  labels,
}: {
  newer?: PostMeta
  older?: PostMeta
  labels: Labels
}) {
  if (!newer && !older) return null

  return (
    <nav className="blog-postnav">
      {newer ? (
        <Link href={`/blog/${newer.slug}`} className="blog-postnav-card is-prev">
          <span className="blog-postnav-dir">
            <ArrowLeftIcon size={14} />
            {labels.newer}
          </span>
          <span className="blog-postnav-title">{newer.title}</span>
        </Link>
      ) : (
        <span className="blog-postnav-spacer" />
      )}

      {older ? (
        <Link href={`/blog/${older.slug}`} className="blog-postnav-card is-next">
          <span className="blog-postnav-dir">
            {labels.older}
            <ArrowRightIcon size={14} />
          </span>
          <span className="blog-postnav-title">{older.title}</span>
        </Link>
      ) : (
        <span className="blog-postnav-spacer" />
      )}
    </nav>
  )
}
