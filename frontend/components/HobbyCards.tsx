import BrandIcon, { BRAND_COLORS } from './BrandIcon'

export interface CategoryLink {
  label: string
  href: string
  icon?: string
}

export interface CarouselItem {
  title: string
  icon: string
  thumb?: string
  desc?: string
  links: CategoryLink[]
}

/**
 * Hobby categories rendered as side-by-side cards (no slider). Each card:
 * thumbnail → header → description → channels. Collapses to one column on
 * narrow screens.
 */
export default function HobbyCards({ items }: { items: CarouselItem[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '12px',
      }}
    >
      {items.map((item) => {
        const brand = BRAND_COLORS[item.icon] ?? '#787774'
        return (
          <div
            key={item.title}
            style={{
              border: '1px solid var(--n-border)',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'var(--n-bg)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* thumbnail */}
            <div style={{ height: '120px', background: `linear-gradient(135deg, ${brand}14, ${brand}07)` }}>
              {item.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumb}
                  alt={`${item.title} thumbnail`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  <BrandIcon name={item.icon} size={32} />
                </div>
              )}
            </div>

            {/* body */}
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              {/* header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <BrandIcon name={item.icon} size={18} />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{item.title}</h3>
              </div>

              {/* description */}
              {item.desc && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--n-secondary)', lineHeight: 1.55, margin: '0 0 14px' }}>
                  {item.desc}
                </p>
              )}

              {/* channels */}
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--n-light)',
                  marginBottom: '7px',
                  marginTop: 'auto',
                }}
              >
                Channels
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {item.links.map((l) => (
                  <a
                    key={l.label}
                    className="chip"
                    href={l.href}
                    target={l.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      border: '1px solid var(--n-border)',
                      color: 'var(--n-text)',
                      fontSize: '0.8125rem',
                      textDecoration: 'none',
                    }}
                  >
                    {l.icon && <BrandIcon name={l.icon} size={13} />}
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
