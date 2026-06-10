'use client'

import { useState } from 'react'

export interface Webring {
  label: string
  href: string
  img?: string
}

/**
 * Slim, manually-advanced webring strip. Deliberately lighter than the
 * LinkCarousel — just a bordered bar with chevrons + dots. Add more rings
 * by appending to the `webrings` array in messages/en.json.
 */
export default function WebringCarousel({ webrings }: { webrings: Webring[] }) {
  const [active, setActive] = useState(0)
  const count = webrings.length
  const ring = webrings[active]
  const go = (dir: number) => setActive((i) => (i + dir + count) % count)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '1px solid var(--n-border)',
          borderRadius: '8px',
          padding: '6px 8px',
          background: 'var(--n-hover)',
        }}
      >
        {count > 1 && (
          <button onClick={() => go(-1)} aria-label="Previous webring" style={chevronStyle}>
            ‹
          </button>
        )}

        <a
          href={ring.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: 'var(--n-secondary)',
            fontSize: '0.75rem',
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
              style={{ height: '1.1em', flexShrink: 0 }}
            />
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ring.label}
          </span>
        </a>

        {count > 1 && (
          <button onClick={() => go(1)} aria-label="Next webring" style={chevronStyle}>
            ›
          </button>
        )}
      </div>

      {count > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
          {webrings.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Webring ${i + 1}`}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                background: i === active ? 'var(--n-secondary)' : 'var(--n-border)',
                transition: 'background 0.2s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const chevronStyle: React.CSSProperties = {
  flexShrink: 0,
  width: '24px',
  height: '24px',
  border: 'none',
  borderRadius: '6px',
  background: 'transparent',
  color: 'var(--n-secondary)',
  fontSize: '18px',
  lineHeight: 1,
  cursor: 'pointer',
  fontFamily: 'inherit',
}
