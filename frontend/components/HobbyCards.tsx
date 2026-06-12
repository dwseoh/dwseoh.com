import BrandIcon, { BRAND_COLORS } from './BrandIcon'

export interface CategoryLink {
  label: string
  href: string
  icon?: string
  /** Emphasized "opens a page" link — accent fill + external-link icon. */
  featured?: boolean
  /** Not built yet — shown as a non-clickable "coming soon" chip with a lock. */
  locked?: boolean
}

export interface CarouselItem {
  title: string
  icon: string
  thumb?: string
  desc?: string
  links: CategoryLink[]
}

function ExternalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

const chipBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  borderRadius: '16px',
  fontSize: '0.8125rem',
  textDecoration: 'none',
}

/**
 * Hobby categories rendered as side-by-side cards (no slider). Uses CSS subgrid
 * so the thumbnail / text / channels rows line up across all cards — the
 * "Channels" sections stay vertically aligned regardless of description length.
 * Collapses to one column on narrow screens.
 */
export default function HobbyCards({ items }: { items: CarouselItem[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        columnGap: '12px',
        rowGap: '12px',
      }}
    >
      {items.map((item) => {
        const brand = BRAND_COLORS[item.icon] ?? '#787774'
        return (
          <div
            key={item.title}
            style={{
              gridRow: 'span 3',
              display: 'grid',
              gridTemplateRows: 'subgrid',
              rowGap: 0,
              border: '1px solid var(--n-border)',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'var(--n-bg)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            {/* row 1 — thumbnail */}
            <div style={{ height: '120px', background: `linear-gradient(135deg, ${brand}14, ${brand}07)` }}>
              {item.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.thumb} alt={`${item.title} thumbnail`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  <BrandIcon name={item.icon} size={32} />
                </div>
              )}
            </div>

            {/* row 2 — header + description */}
            <div style={{ padding: '14px 14px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <BrandIcon name={item.icon} size={18} color="var(--n-text)" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{item.title}</h3>
              </div>
              {item.desc && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--n-secondary)', lineHeight: 1.55, margin: 0 }}>
                  {item.desc}
                </p>
              )}
            </div>

            {/* row 3 — channels */}
            <div style={{ padding: '0 14px 14px' }}>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--n-light)',
                  marginBottom: '7px',
                }}
              >
                Channels
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {item.links.map((l) =>
                  l.locked ? (
                    <span
                      key={l.label}
                      title="Coming soon"
                      style={{
                        ...chipBase,
                        padding: '4px 10px',
                        border: '1px dashed var(--n-border)',
                        background: 'var(--n-hover)',
                        color: 'var(--n-light)',
                        cursor: 'default',
                      }}
                    >
                      <LockIcon />
                      {l.label}
                    </span>
                  ) : l.featured ? (
                    <a
                      key={l.label}
                      className="chip chip-featured"
                      href={l.href}
                      target={l.href.startsWith('http') ? '_blank' : undefined}
                      rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      style={{
                        ...chipBase,
                        padding: '4px 11px',
                        border: '1px solid var(--n-accent)',
                        background: 'var(--n-accent)',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    >
                      {l.label}
                      {l.href.startsWith('http') && <ExternalIcon />}
                    </a>
                  ) : (
                    <a
                      key={l.label}
                      className="chip"
                      href={l.href}
                      target={l.href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      style={{
                        ...chipBase,
                        padding: '4px 10px',
                        border: '1px solid var(--n-border)',
                        color: 'var(--n-text)',
                      }}
                    >
                      {l.icon && <BrandIcon name={l.icon} size={13} />}
                      {l.label}
                    </a>
                  ),
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
