import type { LightboxItem } from '@/components/Lightbox'
import type { PhotoCategory, PhotoEntry } from '@/lib/photos'

/** Tab keys: every manifest category plus "all". */
export type Filter = 'all' | PhotoCategory

export const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'photography', label: 'Photography' },
  { key: 'events', label: 'Events' },
  { key: 'hobbies', label: 'Hobbies' },
]

export const CATEGORY_LABEL: Record<PhotoCategory, string> = {
  photography: 'Photography',
  events: 'Events',
  hobbies: 'Hobbies',
}

/** `?c=` value → filter; anything unknown (or missing) means "all". */
export function parseFilter(value: string | string[] | null | undefined): Filter {
  const v = Array.isArray(value) ? value[0] : value
  return FILTERS.find((f) => f.key === v)?.key ?? 'all'
}

export { pad } from '@/components/subpage/PageHeading'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-01" → "Jan 2026", "2025" → "2025". */
export function formatDate(date?: string): string | undefined {
  if (!date) return undefined
  const [y, m] = date.split('-')
  const month = m ? MONTHS[Number(m) - 1] : undefined
  return month ? `${month} ${y}` : y
}

/** Grid tiles always use the small image: thumbnail for photos, poster for videos. */
export function tileSrc(p: PhotoEntry): string {
  return p.type === 'video' ? (p.poster ?? p.src) : (p.thumb ?? p.src)
}

/** Manifest entry → what the shared Lightbox renders. /photos is English-only. */
export function toLightboxItem(p: PhotoEntry): LightboxItem {
  return {
    src: p.src,
    srcWebp: p.srcWebp,
    thumb: tileSrc(p),
    alt: p.alt.en,
    caption: p.caption.en,
    type: p.type,
    poster: p.poster,
    meta: [formatDate(p.date), CATEGORY_LABEL[p.category]].filter(Boolean).join(' · '),
  }
}
