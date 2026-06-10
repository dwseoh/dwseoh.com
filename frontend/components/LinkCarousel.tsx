'use client'

import { useEffect, useRef, useState } from 'react'
import BrandIcon, { BRAND_COLORS } from './BrandIcon'

export interface CarouselLink {
  label: string
  href: string
  desc?: string
  icon: string
}

function canScreenshot(href: string) {
  return href.startsWith('http') && !href.toLowerCase().endsWith('.pdf')
}

function shotUrl(href: string) {
  return `https://api.microlink.io/?url=${encodeURIComponent(href)}&screenshot=true&embed=screenshot.url`
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
  const [errored, setErrored] = useState<Record<number, boolean>>({})
  const [loaded, setLoaded] = useState<Record<number, boolean>>({})
  const tabCount = links.length

  // auto-advance
  useEffect(() => {
    if (paused || tabCount <= 1) return
    const id = setInterval(() => setActive((i) => (i + 1) % tabCount), autoAdvanceMs)
    return () => clearInterval(id)
  }, [paused, tabCount, autoAdvanceMs])

  const link = links[active]
  const brand = BRAND_COLORS[link.icon] ?? '#787774'
  const showShot = canScreenshot(link.href) && !errored[active]

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
              padding: '11px 8px',
              border: 'none',
              background: i === active ? 'var(--n-hover)' : 'transparent',
              color: i === active ? 'var(--n-text)' : 'var(--n-secondary)',
              fontSize: '0.875rem',
              fontWeight: i === active ? 600 : 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'background 0.15s ease, color 0.15s ease',
              minWidth: 0,
            }}
          >
            <BrandIcon name={l.icon} size={16} />
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
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease',
          }}
        />
      </div>

      {/* ---- Preview area ---- */}
      <div style={{ position: 'relative' }}>
        <div
          key={active}
          style={{
            aspectRatio: '16 / 9',
            width: '100%',
            background: `linear-gradient(135deg, ${brand}14, ${brand}07)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            animation: 'fadeIn 0.4s ease',
          }}
        >
          {showShot ? (
            <>
              {!loaded[active] && <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shotUrl(link.href)}
                alt={`Preview of ${link.label}`}
                onLoad={() => setLoaded((s) => ({ ...s, [active]: true }))}
                onError={() => setErrored((s) => ({ ...s, [active]: true }))}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top',
                  opacity: loaded[active] ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                }}
              />
            </>
          ) : (
            // Branded fallback card (PDF / mailto / blocked sites)
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: brand,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 24px ${brand}40`,
                }}
              >
                <div style={{ filter: 'brightness(0) invert(1)' }}>
                  <BrandIcon name={link.icon} size={30} />
                </div>
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--n-secondary)', fontWeight: 500 }}>
                {link.label}
              </span>
            </div>
          )}
        </div>

        {/* ---- Footer: title / desc / url / open ---- */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '12px 16px',
            borderTop: '1px solid var(--n-border)',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <BrandIcon name={link.icon} size={16} />
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{link.label}</span>
            </div>
            {link.desc && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--n-light)', marginTop: '2px' }}>
                {link.desc}
              </div>
            )}
            <div
              style={{
                fontSize: '0.75rem',
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
              padding: '7px 14px',
              borderRadius: '7px',
              background: 'var(--n-text)',
              color: 'var(--n-bg)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Open ↗
          </a>
        </div>
      </div>
    </div>
  )
}
