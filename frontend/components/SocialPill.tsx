'use client'

import BrandIcon from './BrandIcon'

interface SocialPillProps {
  label: string
  href: string
  icon: string
}

export default function SocialPill({ label, href, icon }: SocialPillProps) {
  const isExternal = href.startsWith('http')
  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px 4px 8px',
        borderRadius: '20px',
        border: '1px solid var(--n-border)',
        textDecoration: 'none',
        color: 'var(--n-text)',
        fontSize: '0.875rem',
        transition: 'background 0.1s ease, border-color 0.1s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--n-hover)'
        e.currentTarget.style.borderColor = 'var(--n-light)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'var(--n-border)'
      }}
    >
      <BrandIcon name={icon} size={14} />
      {label}
    </a>
  )
}
