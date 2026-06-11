'use client'

import { useEffect, useState } from 'react'
import BrandIcon, { BRAND_COLORS } from './BrandIcon'

export interface CategoryLink {
  label: string
  href: string
  icon?: string
}

export interface CarouselItem {
  title: string
  icon: string // general category icon (e.g. "music", "camera")
  thumb?: string
  desc?: string
  links: CategoryLink[]
}

/**
 * Category carousel: tabs of categories (general icon + title) over a shared
 * thumbnail preview, with a description and multiple links per category in the
 * footer. Auto-advances; hovering pauses.
 */
export default function LinkCarousel({
  items,
  autoAdvanceMs = 5000,
}: {
  items: CarouselItem[]
  autoAdvanceMs?: number
}) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const tabCount = items.length

  useEffect(() => {
    if (paused || tabCount <= 1) return
    const id = setInterval(() => setActive((i) => (i + 1) % tabCount), autoAdvanceMs)
    return () => clearInterval(id)
  }, [paused, tabCount, autoAdvanceMs])

  const item = items[active]
  const brand = BRAND_COLORS[item.icon] ?? '#787774'

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
        {items.map((it, i) => (
          <button
            key={it.title}
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
            <BrandIcon name={it.icon} size={15} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {it.title}
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

      {/* ---- Thumbnail preview (crossfaded) ---- */}
      <div style={{ position: 'relative', height: '150px', background: `linear-gradient(135deg, ${brand}14, ${brand}07)` }}>
        {items.map((it, i) => (
          <div
            key={it.title}
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
            {it.thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.thumb} alt={`${it.title} thumbnail`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            ) : (
              <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <BrandIcon name={it.icon} size={34} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ---- Footer: description + multiple links ---- */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--n-border)' }}>
        {item.desc && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--n-secondary)', lineHeight: 1.5, margin: '0 0 10px' }}>
            {item.desc}
          </p>
        )}
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
}
