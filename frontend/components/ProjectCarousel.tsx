'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import BrandIcon from './BrandIcon'

export interface ProjectLink {
  label: string
  href: string
  /** Preset BrandIcon name (e.g. "github", "devpost"). */
  icon?: string
  /** Custom logo image — path under /public or a URL. Takes priority over icon. */
  logo?: string
  /** Emphasized "live / opens a page" link — accent fill + external-link icon. */
  featured?: boolean
}

export interface Project {
  title: string
  desc: string
  tech?: string[]
  /** Optional screenshot path under /public. Falls back to an accent gradient. */
  screenshot?: string
  /** Optional BrandIcon name shown on the card header. */
  icon?: string
  /** Custom logo image for the card header — path under /public or a URL. Takes priority over icon. */
  logo?: string
  /** Optional award/recognition — shown as a badge over the thumbnail. */
  award?: string
  links: ProjectLink[]
}

const GAP = 18
const ACCENT = '#2383e2'

function ExternalIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

function DeltaHacksIcon({ size = 14 }: { size?: number }) {
  // DeltaHacks brand mark — the full-color Penrose-triangle logo.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/logos/deltahacks.png" alt="" width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} />
  )
}

function LinkIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18 9 12l6-6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

/** Icon-only link buttons that sit on the right edge of the card title row. */
function LinkButtons({ links, enabled }: { links: ProjectLink[]; enabled: boolean }) {
  return (
    <div style={{ display: 'flex', gap: '5px', flexShrink: 0, pointerEvents: enabled ? 'auto' : 'none' }}>
      {links.map((l) => (
        <a
          key={l.label}
          className={`proj-linkbtn${l.featured ? ' is-featured' : ''}`}
          href={l.href}
          target={l.href.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          aria-label={l.label}
          title={l.label}
          tabIndex={enabled ? 0 : -1}
        >
          {l.logo ? (
            // custom logo image (path under /public or a URL)
            // eslint-disable-next-line @next/next/no-img-element
            <img src={l.logo} alt="" width={15} height={15} style={{ display: 'block', objectFit: 'contain', borderRadius: '3px' }} />
          ) : l.featured ? (
            <LinkIcon />
          ) : l.icon ? (
            <BrandIcon name={l.icon} size={14} color="currentColor" />
          ) : (
            <ExternalIcon />
          )}
        </a>
      ))}
    </div>
  )
}

function Card({
  p,
  focus,
  onClick,
  cardW,
  reduce,
  noAnim,
}: {
  p: Project
  focus: boolean
  onClick?: () => void
  cardW: number | string
  reduce: boolean
  noAnim: boolean
}) {
  return (
    <div
      onClick={focus ? undefined : onClick}
      aria-hidden={!focus}
      style={{
        flex: '0 0 auto',
        width: typeof cardW === 'number' ? `${cardW}px` : cardW,
        border: '1px solid var(--n-border)',
        borderRadius: '14px',
        overflow: 'hidden',
        background: 'var(--n-bg)',
        cursor: focus ? 'default' : 'pointer',
        opacity: focus ? 1 : 0.4,
        transform: focus ? 'scale(1)' : 'scale(0.9)',
        boxShadow: focus ? '0 10px 30px rgba(0,0,0,0.10)' : '0 1px 2px rgba(0,0,0,0.04)',
        transition: reduce || noAnim ? 'none' : 'opacity 0.45s ease, transform 0.45s ease, box-shadow 0.45s ease',
      }}
    >
      {/* thumbnail */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '3 / 2',
          background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}08)`,
          borderBottom: '1px solid var(--n-border)',
        }}
      >
        {p.screenshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.screenshot} alt={`${p.title} screenshot`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.55 }}>
            screenshot
          </div>
        )}
        {p.award && (
          <span className="proj-award">
            <span className="proj-award-ico"><DeltaHacksIcon /></span>
            {p.award}
          </span>
        )}
      </div>

      {/* meta */}
      <div style={{ padding: '9px 14px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0, flex: 1 }}>
            {p.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.logo} alt="" width={18} height={18} style={{ display: 'block', flexShrink: 0, objectFit: 'contain', borderRadius: '4px' }} />
            ) : p.icon ? (
              <BrandIcon name={p.icon} size={15} color={ACCENT} />
            ) : null}
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</h3>
          </div>
          <LinkButtons links={p.links} enabled={focus} />
        </div>
        <p
          style={{
            margin: '5px 0 0',
            fontSize: '0.8125rem',
            color: 'var(--n-secondary)',
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {p.desc}
        </p>
      </div>
    </div>
  )
}

/**
 * Projects as an infinite horizontal focus carousel: cards in a row with the
 * centered one in focus and neighbors dimmed/peeking on both sides. The track is
 * a triple copy of the items translated so the active card stays centered;
 * whenever the active index drifts out of the middle copy it snaps back by one
 * copy-width with animation disabled — invisible since the copies are identical,
 * so there is always a card on the left and right. Navigation is manual only —
 * arrows and side-card clicks recenter. Respects prefers-reduced-motion.
 */
export default function ProjectCarousel({ items }: { items: Project[] }) {
  const n = items.length
  const [reduce, setReduce] = useState(false)
  const [metrics, setMetrics] = useState({ cardW: 300, vpW: 0 })
  const [pos, setPos] = useState(n) // start at first item of the middle copy
  const [noAnim, setNoAnim] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useLayoutEffect(() => {
    const measure = () => {
      const vp = viewportRef.current
      if (!vp) return
      const w = vp.clientWidth
      const cardW = Math.round(Math.min(280, Math.max(186, w * 0.5)))
      setMetrics({ cardW, vpW: w })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const go = (dir: number) => {
    if (n <= 1 || dir === 0) return
    setNoAnim(false)
    setPos((p) => p + dir)
  }

  // seamless wrap: once the slide settles outside the middle copy, jump back by
  // one copy-width with animation off (the copies are identical, so unseen)
  useEffect(() => {
    if (n <= 1) return
    if (pos >= n && pos < 2 * n) return
    const t = setTimeout(() => {
      setNoAnim(true)
      setPos((p) => (p < n ? p + n : p - n))
    }, 580)
    return () => clearTimeout(t)
  }, [pos, n])

  // re-enable animation a frame after a no-anim snap
  useEffect(() => {
    if (!noAnim) return
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setNoAnim(false)))
    return () => cancelAnimationFrame(r)
  }, [noAnim])

  if (n === 0) return null

  if (n === 1) {
    return (
      <div ref={viewportRef} style={{ display: 'flex', justifyContent: 'center', padding: '18px 0' }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <Card p={items[0]} focus cardW="100%" reduce={reduce} noAnim={false} />
        </div>
      </div>
    )
  }

  const slides = [...items, ...items, ...items]
  const offset = metrics.vpW / 2 - (pos * (metrics.cardW + GAP) + metrics.cardW / 2)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button className="proj-arrow proj-arrow--prev" aria-label="Previous project" onClick={() => go(-1)}>
        <ChevronLeft />
      </button>

      <div ref={viewportRef} style={{ flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden', padding: '18px 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: `${GAP}px`,
            willChange: 'transform',
            transform: `translateX(${offset}px)`,
            transition: reduce || noAnim ? 'none' : 'transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1)',
          }}
        >
          {slides.map((p, j) => (
            <Card key={j} p={p} focus={j === pos} onClick={() => go(j - pos)} cardW={metrics.cardW} reduce={reduce} noAnim={noAnim} />
          ))}
        </div>
      </div>

      <button className="proj-arrow proj-arrow--next" aria-label="Next project" onClick={() => go(1)}>
        <ChevronRight />
      </button>
    </div>
  )
}
