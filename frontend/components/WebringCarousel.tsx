'use client'

import { useEffect, useState } from 'react'

export interface Webring {
  label: string
  href?: string
  img?: string
  /**
   * For rings that require a third-party embed widget. `attrs` are the data-*
   * attributes their snippet asks for, `script` is the embed script URL.
   * Example (webring.ca):
   *   "widget": {
   *     "attrs": { "data-webring": "ca", "data-member": "your-slug" },
   *     "script": "https://webring.ca/embed.js"
   *   }
   */
  widget?: {
    attrs: Record<string, string>
    script: string
  }
}

// Fixed width of the sliding viewport (keeps the footer size stable
// regardless of how long each webring label is).
const VIEWPORT_WIDTH = 190

/**
 * Compact, borderless webring switcher with a fixed-size viewport and a
 * horizontal sliding animation. Supports both plain link rings and rings that
 * require a third-party embed widget. Add more by appending to the `webrings`
 * array in messages/en.json.
 */
export default function WebringCarousel({ webrings }: { webrings: Webring[] }) {
  const [active, setActive] = useState(0)
  const count = webrings.length
  const go = (dir: number) => setActive((i) => (i + dir + count) % count)

  // Load each widget's embed script once. The widget <div>s are already in the
  // DOM (all slides render), so the script finds them when it executes.
  useEffect(() => {
    const scripts = Array.from(
      new Set(webrings.filter((w) => w.widget).map((w) => w.widget!.script)),
    )
    for (const src of scripts) {
      if (document.querySelector(`script[src="${src}"]`)) continue
      const s = document.createElement('script')
      s.src = src
      s.defer = true
      document.body.appendChild(s)
    }
  }, [webrings])

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
          {webrings.map((ring) =>
            ring.widget ? (
              // Third-party embed widget — their script fills this container.
              <div
                key={ring.label}
                style={{
                  flex: '0 0 100%',
                  width: '100%',
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <div {...ring.widget.attrs} aria-label={ring.label} />
              </div>
            ) : (
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
            ),
          )}
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
