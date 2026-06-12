import BrandIcon from './BrandIcon'

interface LinkRowProps {
  label: string
  href: string
  desc?: string
  icon: string
}

export default function LinkRow({ label, href, desc, icon }: LinkRowProps) {
  const isExternal = href.startsWith('http')
  return (
    <a
      className="link-row"
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 8px',
        borderRadius: '6px',
        textDecoration: 'none',
        color: 'var(--n-text)',
      }}
    >
      <BrandIcon name={icon} size={18} />
      <span className="link-row-label" style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
        {label}
      </span>
      {desc && (
        <span style={{ fontSize: '0.875rem', color: 'var(--n-light)', marginLeft: '2px' }}>
          — {desc}
        </span>
      )}
    </a>
  )
}
