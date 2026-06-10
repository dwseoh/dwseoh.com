'use client'

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
        transition: 'background 0.1s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--n-hover-strong)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <BrandIcon name={icon} size={18} />
      <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{label}</span>
      {desc && (
        <span style={{ fontSize: '0.875rem', color: 'var(--n-light)', marginLeft: '2px' }}>
          — {desc}
        </span>
      )}
    </a>
  )
}
