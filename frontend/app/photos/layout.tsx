import type { Metadata } from 'next'
import './photos.css'

const title = 'Photos — Jamie Seoh'
const description =
  'Photographs by Jamie Seoh, plus moments from hackathons, concerts, talks and races.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/photos' },
  openGraph: { title, description, url: '/photos', type: 'website' },
}

/**
 * /photos sits outside `[locale]` (English-only, like the blog), so it is
 * excluded from next-intl in proxy.ts. `.photos-root` scopes the page styles in
 * ./photos.css, including following the system's dark mode.
 */
export default function PhotosLayout({ children }: { children: React.ReactNode }) {
  return <div className="photos-root">{children}</div>
}
