import Link from 'next/link'
import PhotoGallery from '@/components/photos/PhotoGallery'
import { pad } from '@/components/photos/format'
import { photos } from '@/lib/photos'

/**
 * Server shell: reads `?c=` (tab) and `?p=` (open photo) so the first paint
 * already shows the requested tab, then hands the manifest to the client gallery. The title is passed in as
 * children so it stays server-rendered.
 */
export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const v of [value ?? []].flat()) query.append(key, v)
  }
  const search = query.size ? `?${query}` : ''

  return (
    <main className="ph-wrap">
      {/* Without JS the rise-in never starts; just show the tiles. */}
      <noscript>
        <style>{'.ph-tile{opacity:1;transform:none;animation:none}.ph-tile img{opacity:1}'}</style>
      </noscript>
      <Link href="/" className="ph-back">
        ← dwseoh.com
      </Link>
      <PhotoGallery photos={photos} initialSearch={search}>
        <h1 className="ph-title">
          Photos<sup>{pad(photos.length)}</sup>
        </h1>
      </PhotoGallery>
    </main>
  )
}
