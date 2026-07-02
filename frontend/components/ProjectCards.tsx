import BrandIcon from './BrandIcon'

export interface ProjectLink {
  label: string
  href: string
  icon?: string
  /** Emphasized "live / opens a page" link — accent fill + external-link icon. */
  featured?: boolean
}

export interface Project {
  title: string
  desc: string
  tech: string[]
  /** Optional screenshot path under /public. Falls back to an accent gradient. */
  screenshot?: string
  /** Card accent color (hex). Tints the gradient + tech chips. */
  accent?: string
  links: ProjectLink[]
}

function ExternalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

function LockIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

const linkBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  borderRadius: '7px',
  fontSize: '0.8125rem',
  textDecoration: 'none',
  padding: '4px 11px',
}

/**
 * Featured projects as three side-by-side cards (screenshot / description /
 * tech stack / links). Uses CSS subgrid so the four rows line up across cards
 * regardless of description length. Collapses to one column on narrow screens.
 * Renders a locked "more" button beneath — the dedicated projects page isn't
 * built yet, so it's a non-clickable "coming soon" affordance.
 */
export default function ProjectCards({
  items,
  moreLabel,
  moreSoon,
}: {
  items: Project[]
  moreLabel: string
  moreSoon: string
}) {
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          columnGap: '12px',
          rowGap: '12px',
        }}
      >
        {items.map((p) => {
          const accent = p.accent ?? '#2383e2'
          return (
            <div
              key={p.title}
              style={{
                gridRow: 'span 4',
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
              {/* row 1 — screenshot */}
              <div
                style={{
                  height: '128px',
                  background: `linear-gradient(135deg, ${accent}1f, ${accent}0a)`,
                  borderBottom: '1px solid var(--n-border)',
                }}
              >
                {p.screenshot ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.screenshot}
                    alt={`${p.title} screenshot`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      width: '100%',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: accent,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      opacity: 0.7,
                    }}
                  >
                    screenshot
                  </div>
                )}
              </div>

              {/* row 2 — title + description */}
              <div style={{ padding: '14px 14px 10px' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 600 }}>{p.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--n-secondary)', lineHeight: 1.55, margin: 0 }}>
                  {p.desc}
                </p>
              </div>

              {/* row 3 — tech stack */}
              <div style={{ padding: '0 14px 12px', display: 'flex', flexWrap: 'wrap', gap: '5px', alignContent: 'flex-start' }}>
                {p.tech.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      padding: '2px 8px',
                      borderRadius: '5px',
                      background: `${accent}14`,
                      color: accent,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* row 4 — links */}
              <div style={{ padding: '0 14px 14px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'flex-end' }}>
                {p.links.map((l) =>
                  l.featured ? (
                    <a
                      key={l.label}
                      className="chip"
                      href={l.href}
                      target={l.href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      style={{ ...linkBase, border: `1px solid ${accent}`, background: accent, color: '#fff', fontWeight: 600 }}
                    >
                      {l.label}
                      <ExternalIcon />
                    </a>
                  ) : (
                    <a
                      key={l.label}
                      className="chip"
                      href={l.href}
                      target={l.href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      style={{ ...linkBase, border: '1px solid var(--n-border)', color: 'var(--n-text)' }}
                    >
                      {l.icon && <BrandIcon name={l.icon} size={13} />}
                      {l.label}
                    </a>
                  ),
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* locked "all projects" button — the projects page isn't built yet */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '14px' }}>
        <span
          title="Coming soon"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '7px 16px',
            borderRadius: '9px',
            border: '1px dashed var(--n-border)',
            background: 'var(--n-hover)',
            color: 'var(--n-light)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'default',
            userSelect: 'none',
          }}
        >
          <LockIcon size={12} />
          {moreLabel}
          <span
            style={{
              fontSize: '0.625rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '1px 6px',
              borderRadius: '5px',
              background: 'var(--n-hover-strong)',
            }}
          >
            {moreSoon}
          </span>
        </span>
      </div>
    </>
  )
}
