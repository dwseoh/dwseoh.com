/**
 * Photo manifest — the single source of truth for every photo/video on the site
 * (home carousel + /photos). Written by `npm run photos` (scripts/photos/), read
 * here. Shared contract between the pipeline and the /photos page: change the
 * shape only together with both.
 *
 * Array order in content/photos.json is display order.
 */

import type { Photo } from '@/components/photo'
import manifest from '@/content/photos.json'

export type PhotoCategory = 'photography' | 'events'
export type Locale = 'en' | 'ko'

export interface PhotoEntry {
  /** Slug; also the file basename under /images/photos (or /videos). */
  id: string
  type: 'image' | 'video'
  /** Full-size file (JPEG for images, MP4 for videos). */
  src: string
  /** ~400px thumbnail (images only). */
  thumb?: string
  /** Optional modern-format twins, served via <picture> when present. */
  srcWebp?: string
  thumbWebp?: string
  /** Poster frame (videos only). */
  poster?: string
  /** Intrinsic size of `src` — lets grids reserve space with no layout shift. */
  width: number
  height: number
  /** Tiny base64 data URI shown while the thumbnail loads. */
  blur?: string
  /** CSS object-position for cropped tiles, e.g. "50% 25%". */
  position?: string
  category: PhotoCategory
  /** "YYYY" or "YYYY-MM". */
  date?: string
  caption: { en: string; ko?: string }
  alt: { en: string; ko?: string }
  /** Also show in the home-page carousel. */
  carousel: boolean
}

export const photos = (manifest as { photos: PhotoEntry[] }).photos

export function photosIn(category?: PhotoCategory): PhotoEntry[] {
  return category ? photos.filter((p) => p.category === category) : photos
}

/** The /photos URL that opens `entry` in the lightbox, on its category's tab. */
export function photoHref(entry: Pick<PhotoEntry, 'id' | 'category'>): string {
  return `/photos?c=${entry.category}&p=${encodeURIComponent(entry.id)}`
}

/**
 * Carousel entries in the shape PhotoStrip takes; Korean falls back to English.
 * Each tile links to the photo on /photos rather than opening its own viewer.
 */
export function carouselPhotos(locale: Locale): Photo[] {
  return photos
    .filter((p) => p.carousel)
    .map((p) => ({
      id: p.id,
      src: p.src,
      alt: p.alt[locale] ?? p.alt.en,
      caption: p.caption[locale] ?? p.caption.en,
      type: p.type,
      poster: p.poster,
      position: p.position,
      thumb: p.thumb,
      thumbWebp: p.thumbWebp,
      href: photoHref(p),
    }))
}
