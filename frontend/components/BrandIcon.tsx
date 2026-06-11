// Brand colors used for icon tint + carousel fallback cards.
export const BRAND_COLORS: Record<string, string> = {
  linkedin:  '#0A66C2',
  github:    '#181717',
  instagram: '#E4405F',
  discord:   '#5865F2',
  substack:  '#FF6719',
  x:         '#000000',
  file:      '#E8743B',
  music:     '#8B5CF6',
  camera:    '#0EA5E9',
  email:     '#6B7280',
}

// LinkedIn is inlined because Simple Icons removed it (404 on the CDN).
const LINKEDIN_PATH =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'

// Icons rendered from inline SVG paths (no network dependency).
const INLINE_SVG: Record<string, string> = {
  linkedin: LINKEDIN_PATH,
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM6 4h5v6h7v10H6V4z',
  music: 'M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z',
  email: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
  camera: 'M9 2 7.17 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3.17L15 2H9zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
}

// Icons fetched from the Simple Icons CDN (these all resolve correctly).
const CDN_ICONS: Record<string, string> = {
  github:    'github/181717',
  instagram: 'instagram/E4405F',
  discord:   'discord/5865F2',
  substack:  'substack/FF6719',
  x:         'x/000000',
}

export default function BrandIcon({ name, size = 18 }: { name: string; size?: number }) {
  if (INLINE_SVG[name]) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        style={{ display: 'block', flexShrink: 0, fill: BRAND_COLORS[name] ?? 'var(--n-secondary)' }}
        dangerouslySetInnerHTML={{ __html: `<path d="${INLINE_SVG[name]}"/>` }}
      />
    )
  }

  if (CDN_ICONS[name]) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://cdn.simpleicons.org/${CDN_ICONS[name]}`}
        alt=""
        width={size}
        height={size}
        style={{ display: 'block', flexShrink: 0 }}
      />
    )
  }

  return null
}
