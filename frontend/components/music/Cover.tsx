import { useId } from 'react'
import type { Piece } from '@/app/music/data'
import { PinIcon } from './Icons'

/** FNV-1a, so every piece gets the same artwork on every render. */
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rng(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Staff geometry, in the 100×100 viewBox.
const STAFF_BOTTOM = 62
const GAP = 4.2 // distance between staff lines
const step = (pos: number) => STAFF_BOTTOM - pos * (GAP / 2)

/**
 * The title, read as a melody: each letter becomes a note on the staff
 * (positions -1…9, so no ledger lines are needed), stems follow engraving
 * rules (up below the middle line), and neighbouring pairs are beamed.
 */
function melody(title: string) {
  const letters = title
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .slice(0, 11)
  const n = letters.length
  return [...letters].map((ch, i) => {
    const pos = ((ch.charCodeAt(0) * 7 + i * 3) % 11) - 1
    const x = n === 1 ? 50 : 14 + (i * 72) / (n - 1)
    const up = pos < 4
    return { x, y: step(pos), up }
  })
}

export default function Cover({
  piece,
  palette,
  size = 'sm',
  featured = false,
}: {
  piece: Piece
  palette: [string, string]
  size?: 'sm' | 'lg'
  /** Large covers of featured pieces get a gold ring and a star on the corner. */
  featured?: boolean
}) {
  const id = useId().replace(/:/g, '')

  if (piece.cover) {
    return (
      <div className={`cw-cover is-${size}${size === 'lg' && featured ? ' is-featured' : ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={piece.cover} alt="" />
        {size === 'lg' && featured && (
          <span className="cw-cover-pin" title="Pinned">
            <PinIcon />
          </span>
        )}
      </div>
    )
  }

  const r = rng(hash(piece.slug))
  const angle = Math.round(r() * 360)
  const glow = { x: 22 + r() * 56, y: 14 + r() * 34, r: 38 + r() * 22 }
  const ring = { x: 18 + r() * 64, y: 20 + r() * 50, r: 22 + r() * 26 }
  const notes = melody(piece.title)
  const lg = size === 'lg'

  return (
    <div className={`cw-cover is-${size}${lg && featured ? ' is-featured' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`g${id}`} gradientTransform={`rotate(${angle} .5 .5)`}>
            <stop offset="0" stopColor={palette[0]} />
            <stop offset="1" stopColor={palette[1]} />
          </linearGradient>
          <radialGradient id={`l${id}`}>
            <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          {lg && (
            <filter id={`n${id}`}>
              <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" stitchTiles="stitch" />
              <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0" />
            </filter>
          )}
        </defs>

        <rect width="100" height="100" fill={`url(#g${id})`} />
        <circle cx={glow.x} cy={glow.y} r={glow.r} fill={`url(#l${id})`} />
        <circle cx={ring.x} cy={ring.y} r={ring.r} fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="0.3" />

        <g stroke="#fff" strokeOpacity="0.4" strokeWidth="0.3">
          {[0, 2, 4, 6, 8].map((p) => (
            <line key={p} x1="6" x2="94" y1={step(p)} y2={step(p)} />
          ))}
        </g>

        <g fill="#fff" stroke="#fff" strokeOpacity="0.92" fillOpacity="0.92">
          {notes.map((n, i) => {
            const sx = n.up ? n.x + 1.55 : n.x - 1.55
            const sy = n.up ? n.y - 12 : n.y + 12
            return (
              <g key={i}>
                <ellipse cx={n.x} cy={n.y} rx="1.85" ry="1.3" transform={`rotate(-22 ${n.x} ${n.y})`} stroke="none" />
                <line x1={sx} x2={sx} y1={n.y} y2={sy} strokeWidth="0.35" />
              </g>
            )
          })}
          {/* Beam each pair whose stems point the same way. */}
          {notes.map((n, i) => {
            const m = notes[i + 1]
            if (i % 2 || !m || m.up !== n.up) return null
            const x1 = n.up ? n.x + 1.55 : n.x - 1.55
            const x2 = m.up ? m.x + 1.55 : m.x - 1.55
            const y1 = n.up ? n.y - 12 : n.y + 12
            const y2 = m.up ? m.y - 12 : m.y + 12
            return <line key={`b${i}`} x1={x1} x2={x2} y1={y1} y2={y2} strokeWidth="1.3" strokeLinecap="butt" />
          })}
        </g>

        {lg && <rect width="100" height="100" filter={`url(#n${id})`} opacity="0.09" />}
      </svg>

      {lg && featured && (
        <span className="cw-cover-pin" title="Pinned">
          <PinIcon />
        </span>
      )}
    </div>
  )
}
