'use client'

import { useState } from 'react'

export interface Webring {
  label: string
  href: string
  img?: string
}

// Fixed width of the sliding viewport (keeps the footer size stable
// regardless of how long each webring label is).
const VIEWPORT_WIDTH = 190

/**
 * Compact, borderless webring switcher with a fixed-size viewport and a
 * horizontal sliding animation between rings. Manually advanced with ‹ ›
 * chevrons + an "n/total" counter. Add more rings by appending to the
 * `webrings` array in messages/en.json.
 */
export default function WebringCarousel({ webrings }: { webrings: Webring[] }) {
  const [active, setActive] = useState(0)
  const count = webrings.length
  const go = (dir: number) => setActive((i) => (i + dir + count) % count)

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--n-secondary)',
        fontSize: '0.75rem',
      }}
    >
      {count > 1 && (
        <button onClick={() => go(-1)} aria-label="Previous webring" style={chevronStyle}>
          ‹
        </button>
      )}

      {/* fixed-size viewport */}
      <div style={{ width: `${VIEWPORT_WIDTH}px`, overflow: 'hidden' }}>
        {/* sliding track */}
        <div
          style={{
            display: 'flex',
            transform: `translateX(-${active * 100}%)`,
            transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {webrings.map((ring) => (
            <a
              key={ring.label}
              href={ring.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: '0 0 100%',
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                textDecoration: 'none',
                color: 'inherit',
                minWidth: 0,
              }}
            >
              {ring.img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ring.img}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                  style={{ height: '1.05em', flexShrink: 0 }}
                />
              )}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ring.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      {count > 1 && (
        <>
          <button onClick={() => go(1)} aria-label="Next webring" style={chevronStyle}>
            ›
          </button>
          <span style={{ color: 'var(--n-light)', fontVariantNumeric: 'tabular-nums' }}>
            {active + 1}/{count}
          </span>
        </>
      )}
    </div>
  )
}

const chevronStyle: React.CSSProperties = {
  flexShrink: 0,
  width: '18px',
  height: '18px',
  border: 'none',
  borderRadius: '4px',
  background: 'transparent',
  color: 'var(--n-secondary)',
  fontSize: '15px',
  lineHeight: 1,
  cursor: 'pointer',
  fontFamily: 'inherit',
  padding: 0,
}
