'use client'

import { useEffect, useState } from 'react'
import BrandIcon, { BRAND_COLORS } from './BrandIcon'

export interface CarouselLink {
  label: string
  href: string
  desc?: string
  icon: string
  thumb?: string
}

function prettyUrl(href: string) {
  try {
    const u = new URL(href)
    return (u.hostname + u.pathname).replace(/\/$/, '').replace(/^www\./, '')
  } catch {
    return href
  }
}

export default function LinkCarousel({
  links,
  autoAdvanceMs = 4500,
}: {
  links: CarouselLink[]
  autoAdvanceMs?: number
}) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const tabCount = links.length

  // auto-advance
  useEffect(() => {
    if (paused || tabCount <= 1) return
    const id = setInterval(() => setActive((i) => (i + 1) % tabCount), autoAdvanceMs)
    return () => clearInterval(id)
  }, [paused, tabCount, autoAdvanceMs])

  const link = links[active]
  const brand = BRAND_COLORS[link.icon] ?? '#787774'

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        border: '1px solid var(--n-border)',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--n-bg)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      {/* ---- Tab strip ---- */}
      <div style={{ position: 'relative', display: 'flex', borderBottom: '1px solid var(--n-border)' }}>
        {links.map((l, i) => (
          <button
            key={l.label}
            onClick={() => setActive(i)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              padding: '10px 8px',
              border: 'none',
              background: i === active ? 'var(--n-hover)' : 'transparent',
              color: i === active ? 'var(--n-text)' : 'var(--n-secondary)',
              fontSize: '0.8125rem',
              fontWeight: i === active ? 600 : 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'background 0.2s ease, color 0.2s ease',
              minWidth: 0,
            }}
          >
            <BrandIcon name={l.icon} size={15} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {l.label}
            </span>
          </button>
        ))}
        {/* sliding active indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: -1,
            left: 0,
            height: '2px',
            width: `${100 / tabCount}%`,
            background: brand,
            transform: `translateX(${active * 100}%)`,
            transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.35s ease',
          }}
        />
      </div>

      {/* ---- Thumbnail preview (shorter, crossfaded) ---- */}
      <div
        style={{
          position: 'relative',
          height: '150px',
          background: `linear-gradient(135deg, ${brand}14, ${brand}07)`,
        }}
      >
        {links.map((l, i) => (
          <div
            key={l.label}
            aria-hidden={i !== active}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: i === active ? 1 : 0,
              transform: i === active ? 'scale(1)' : 'scale(1.03)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
              pointerEvents: 'none',
            }}
          >
            {l.thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={l.thumb}
                alt={`${l.label} thumbnail`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
            ) : (
              <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <BrandIcon name={l.icon} size={34} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ---- Footer: title / desc / url / open ---- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '11px 14px',
          borderTop: '1px solid var(--n-border)',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <BrandIcon name={link.icon} size={15} />
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{link.label}</span>
          </div>
          {link.desc && (
            <div style={{ fontSize: '0.75rem', color: 'var(--n-light)', marginTop: '2px' }}>
              {link.desc}
            </div>
          )}
          <div
            style={{
              fontSize: '0.6875rem',
              color: 'var(--n-secondary)',
              marginTop: '3px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {prettyUrl(link.href)}
          </div>
        </div>
        <a
          href={link.href}
          target={link.href.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          style={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '7px 13px',
            borderRadius: '7px',
            background: 'var(--n-text)',
            color: 'var(--n-bg)',
            fontSize: '0.75rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Open ↗
        </a>
      </div>
    </div>
  )
}
