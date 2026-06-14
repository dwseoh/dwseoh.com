'use client'

import { useEffect, useRef, useState } from 'react'
import BrandIcon from './BrandIcon'

export interface ProjectLink {
  label: string
  href: string
  icon?: string
  /** Emphasized "live / opens a page" link — accent fill + external-link icon. */
  featured?: boolean
}

export interface Project {
  title: string
  desc: string
  tech: string[]
  /** Optional screenshot path under /public. Falls back to an accent gradient. */
  screenshot?: string
  /** Optional BrandIcon name for the rail logo; falls back to a numbered badge. */
  icon?: string
  links: ProjectLink[]
}

const AUTOPLAY_MS = 4800
// Single site accent (matches --n-accent); hex form needed for alpha tints.
const ACCENT = '#2383e2'

function ExternalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

function LockIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

const linkBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  borderRadius: '7px',
  fontSize: '0.8125rem',
  textDecoration: 'none',
  padding: '5px 12px',
}

/**
 * Projects as a single connected widget: a narrow logo rail on the left selects
 * a project shown in the detail panel on the right (full thumbnail, name,
 * one-liner, tech stack, links). Auto-advances with a crossfade and a bottom
 * progress bar; pauses on hover/focus; any manual selection restarts the timer.
 * Auto-advance + animations respect prefers-reduced-motion. The rail flips to a
 * top strip on mobile. Below sits the locked "all projects" affordance — the
 * dedicated projects page isn't built yet.
 */
export default function ProjectShowcase({
  items,
  moreLabel,
  moreSoon,
}: {
  items: Project[]
  moreLabel: string
  moreSoon: string
}) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduce, setReduce] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (reduce || paused || items.length <= 1) return
    const id = setTimeout(() => setActive((a) => (a + 1) % items.length), AUTOPLAY_MS)
    return () => clearTimeout(id)
  }, [active, paused, reduce, items.length])

  if (items.length === 0) return null
  const current = items[active]

  return (
    <>
      <div
        className="proj-widget"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {/* left — logo rail */}
        <div className="proj-rail" role="tablist" aria-label="Projects">
          {items.map((p, i) => {
            const isActive = i === active
            return (
              <button
                key={p.title}
                role="tab"
                aria-selected={isActive}
                title={p.title}
                onClick={() => setActive(i)}
                className="proj-tab"
              >
                {p.icon ? (
                  <BrandIcon name={p.icon} size={19} color={isActive ? ACCENT : 'var(--n-secondary)'} />
                ) : (
                  <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{i + 1}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* right — detail panel */}
        <div className="proj-content">
          {/* full thumbnail — keyed so it crossfades on switch */}
          <div
            key={`thumb-${active}`}
            className="proj-thumb"
            style={{
              position: 'relative',
              height: '180px',
              background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}08)`,
              borderBottom: '1px solid var(--n-border)',
              animation: reduce ? undefined : 'projThumbIn 0.45s ease',
            }}
          >
            {current.screenshot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.screenshot}
                alt={`${current.title} screenshot`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: ACCENT,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  opacity: 0.6,
                }}
              >
                screenshot
              </div>
            )}
          </div>

          {/* meta — keyed so text fades/slides in on switch */}
          <div
            key={`meta-${active}`}
            className="proj-detail"
            style={{ padding: '13px 16px 15px', animation: reduce ? undefined : 'projDetailIn 0.4s ease' }}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: '1.0625rem', fontWeight: 600 }}>{current.title}</h3>
            <p style={{ margin: '0 0 10px', fontSize: '0.875rem', color: 'var(--n-secondary)', lineHeight: 1.5 }}>
              {current.desc}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
              {current.tech.map((tch) => (
                <span
                  key={tch}
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    padding: '2px 9px',
                    borderRadius: '5px',
                    background: `${ACCENT}12`,
                    color: ACCENT,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tch}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {current.links.map((l) =>
                l.featured ? (
                  <a
                    key={l.label}
                    className="chip"
                    href={l.href}
                    target={l.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    style={{ ...linkBase, border: `1px solid ${ACCENT}`, background: ACCENT, color: '#fff', fontWeight: 600 }}
                  >
                    {l.label}
                    <ExternalIcon />
                  </a>
                ) : (
                  <a
                    key={l.label}
                    className="chip"
                    href={l.href}
                    target={l.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    style={{ ...linkBase, border: '1px solid var(--n-border)', color: 'var(--n-text)' }}
                  >
                    {l.icon && <BrandIcon name={l.icon} size={13} />}
                    {l.label}
                  </a>
                ),
              )}
            </div>
          </div>

          {/* auto-advance progress bar along the bottom, restarts on switch */}
          {!reduce && items.length > 1 && (
            <span
              key={`prog-${active}-${paused}`}
              className="proj-progress"
              aria-hidden
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '2px',
                background: ACCENT,
                transformOrigin: 'left',
                animation: `projProgress ${AUTOPLAY_MS}ms linear forwards`,
                animationPlayState: paused ? 'paused' : 'running',
              }}
            />
          )}
        </div>
      </div>

      {/* locked "all projects" button — the projects page isn't built yet */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '14px' }}>
        <span
          title="Coming soon"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '7px 16px',
            borderRadius: '9px',
            border: '1px dashed var(--n-border)',
            background: 'var(--n-hover)',
            color: 'var(--n-light)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'default',
            userSelect: 'none',
          }}
        >
          <LockIcon size={12} />
          {moreLabel}
          <span
            style={{
              fontSize: '0.625rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '1px 6px',
              borderRadius: '5px',
              background: 'var(--n-hover-strong)',
            }}
          >
            {moreSoon}
          </span>
        </span>
      </div>
    </>
  )
}
