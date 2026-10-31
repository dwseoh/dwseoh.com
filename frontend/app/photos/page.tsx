import PhotoGallery from '@/components/photos/PhotoGallery'
import PageHeading from '@/components/subpage/PageHeading'
import SubpageBar from '@/components/subpage/SubpageBar'
import { photos } from '@/lib/photos'

/**
 * Server shell: reads `?c=` (tab) and `?p=` (open photo) so the first paint
 * already shows the requested tab, then hands the manifest to the client gallery. The heading is passed in
 * as children so it stays server-rendered.
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
    <>
      <SubpageBar section={{ label: 'Photos', href: '/photos' }} />
      <main className="ph-wrap">
        {/* Without JS the rise-in never starts; just show the tiles. */}
        <noscript>
          <style>{'.ph-tile{opacity:1;transform:none;animation:none}.ph-tile img{opacity:1}'}</style>
        </noscript>
        <PhotoGallery photos={photos} initialSearch={search}>
          <PageHeading
            eyebrow="Photographs by Jamie Seoh"
            title="Photos"
            count={photos.length}
            intro="(Mostly) things I've photographed over the years!"
          />
        </PhotoGallery>
      </main>
    </>
  )
}
