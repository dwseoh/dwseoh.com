'use client'

import { useState } from 'react'
import BrandIcon from './BrandIcon'

function prettyUrl(href: string) {
  if (href.startsWith('mailto:')) return href.slice(7)
  if (!href.startsWith('http')) return href
  try {
    const u = new URL(href)
    return (u.hostname + u.pathname).replace(/\/$/, '').replace(/^www\./, '')
  } catch {
    return href
  }
}

/**
 * Wraps a link and shows a floating preview card just below it on hover, with
 * a small connecting arrow. Pass `icon` (brand name) or `iconUrl` (e.g. a
 * favicon) for the card header. `block` makes the wrapper fill its grid cell;
 * leave it off for inline links/pills.
 */
export default function HoverPreview({
  label,
  href,
  desc,
  icon,
  iconUrl,
  block = false,
  children,
}: {
  label: string
  href: string
  desc?: string
  icon?: string
  iconUrl?: string
  block?: boolean
  children: React.ReactNode
}) {
  const [show, setShow] = useState(false)

  return (
    <span
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{
        position: 'relative',
        display: block ? 'block' : 'inline-block',
        verticalAlign: block ? undefined : 'baseline',
      }}
    >
      {children}

      <span
        role="tooltip"
        style={{
          position: 'absolute',
          top: 'calc(100% + 9px)',
          left: '50%',
          width: 'max-content',
          minWidth: '150px',
          maxWidth: '240px',
          background: 'var(--n-bg)',
          border: '1px solid var(--n-border)',
          borderRadius: '10px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
          padding: '10px 12px',
          textAlign: 'left',
          zIndex: 50,
          opacity: show ? 1 : 0,
          transform: show
            ? 'translateX(-50%) translateY(0) scale(1)'
            : 'translateX(-50%) translateY(-4px) scale(0.97)',
          transformOrigin: 'top center',
          transition: 'opacity 0.15s ease, transform 0.15s ease',
          pointerEvents: 'none',
        }}
      >
        {/* connecting arrow */}
        <span
          style={{
            position: 'absolute',
            top: '-5px',
            left: '50%',
            width: '9px',
            height: '9px',
            background: 'var(--n-bg)',
            borderLeft: '1px solid var(--n-border)',
            borderTop: '1px solid var(--n-border)',
            transform: 'translateX(-50%) rotate(45deg)',
          }}
        />

        <span style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: desc ? '4px' : '3px' }}>
          {iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={iconUrl} alt="" width={15} height={15} style={{ borderRadius: '3px', display: 'block' }} />
          ) : icon ? (
            <BrandIcon name={icon} size={15} />
          ) : null}
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</span>
        </span>
        {desc && (
          <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--n-secondary)', lineHeight: 1.5 }}>
            {desc}
          </span>
        )}
        <span
          style={{
            display: 'block',
            fontSize: '0.6875rem',
            color: 'var(--n-light)',
            marginTop: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {prettyUrl(href)}
        </span>
      </span>
    </span>
  )
}
