'use client'

import { useEffect, useRef } from 'react'

export interface GraphLane {
  id: string
  label: string
  color: string
}

export interface GraphCommit {
  col: number
  branch: string
  org: string
  role: string
  period: string
  desc?: string
  href?: string
}

export interface ExperienceGraphData {
  scrollHint?: string
  lanes: GraphLane[]
  commits: GraphCommit[]
}

const MONO =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'

// --- geometry ---
const PAD_L = 78
const PAD_R = 150
const PAD_T = 92 // headroom for main-lane labels sitting above the rail
const COL_W = 168
const LANE_H = 116
const NODE_R = 7

/**
 * Experiences as a genuine `git log --graph` history drawn horizontally: a
 * `main` rail runs left→right with feature branches (one per "track") that fork
 * off, collect commits, and merge back — each branch in its own color/lane.
 *
 * On desktop the section pins and converts vertical scroll into horizontal pan
 * (you scroll the whole timeline into view before the page continues down). On
 * touch / reduced-motion it degrades to a normal swipe-scrollable strip.
 */
export default function ExperienceGraph({ data }: { data: ExperienceGraphData }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const clipRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const { lanes, commits } = data
  const laneIndex = new Map(lanes.map((l, i) => [l.id, i]))
  const laneById = new Map(lanes.map((l) => [l.id, l]))

  const maxCol = commits.reduce((m, c) => Math.max(m, c.col), 0)
  const x = (col: number) => PAD_L + col * COL_W
  const y = (laneIdx: number) => PAD_T + laneIdx * LANE_H
  const trackWidth = PAD_L + maxCol * COL_W + PAD_R
  const graphHeight = PAD_T + (lanes.length - 1) * LANE_H + 96

  // Scroll-driven horizontal pinning (desktop only).
  useEffect(() => {
    const section = sectionRef.current
    const clip = clipRef.current
    const track = trackRef.current
    if (!section || !clip || !track) return

    const STICKY_TOP = 84
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const small = window.matchMedia('(max-width: 760px)')
    let maxShift = 0
    let enabled = false
    let raf = 0

    const apply = () => {
      raf = 0
      if (!enabled) return
      const rect = section.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (STICKY_TOP - rect.top) / maxShift))
      track.style.transform = `translateX(${-(p * maxShift).toFixed(2)}px)`
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(apply)
    }

    const measure = () => {
      const clipW = clip.clientWidth
      maxShift = Math.max(0, trackWidth - clipW)
      enabled = !reduce.matches && !small.matches && maxShift > 0
      if (enabled) {
        clip.style.overflowX = 'hidden'
        clip.style.position = 'sticky'
        clip.style.top = `${STICKY_TOP}px`
        section.style.height = `${clip.offsetHeight + maxShift}px`
      } else {
        // swipe-scrollable fallback
        clip.style.overflowX = 'auto'
        clip.style.position = ''
        clip.style.top = ''
        section.style.height = ''
        track.style.transform = ''
      }
      onScroll()
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    const ro = new ResizeObserver(measure)
    ro.observe(clip)
    reduce.addEventListener('change', measure)
    small.addEventListener('change', measure)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
      ro.disconnect()
      reduce.removeEventListener('change', measure)
      small.removeEventListener('change', measure)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [trackWidth])

  // Build the SVG paths: main rail + one fork→branch→merge run per branch.
  const mainIdx = 0
  const branchPaths = lanes
    .map((lane, li) => {
      if (li === mainIdx) return null
      const cs = commits.filter((c) => c.branch === lane.id).sort((a, b) => a.col - b.col)
      if (cs.length === 0) return null
      const firstCol = cs[0].col
      const lastCol = cs[cs.length - 1].col
      const yL = y(li)
      const yM = y(mainIdx)
      const forkSx = x(firstCol) - COL_W * 0.7
      const mergeEx = x(lastCol) + COL_W * 0.7
      const fork = `M ${forkSx} ${yM} C ${forkSx + COL_W * 0.4} ${yM}, ${x(firstCol) - COL_W * 0.4} ${yL}, ${x(firstCol)} ${yL}`
      const line = `M ${x(firstCol)} ${yL} L ${x(lastCol)} ${yL}`
      const merge = `M ${x(lastCol)} ${yL} C ${x(lastCol) + COL_W * 0.4} ${yL}, ${mergeEx - COL_W * 0.4} ${yM}, ${mergeEx} ${yM}`
      return { lane, d: `${fork} ${line} ${merge}` }
    })
    .filter(Boolean) as { lane: GraphLane; d: string }[]

  const lastMainCol = commits
    .filter((c) => c.branch === lanes[mainIdx].id)
    .reduce((m, c) => Math.max(m, c.col), 0)

  return (
    <div ref={sectionRef} style={{ position: 'relative' }}>
      <div
        ref={clipRef}
        style={{
          width: '100%',
          height: `${graphHeight}px`,
          borderRadius: '12px',
          border: '1px solid var(--n-border)',
          background:
            'linear-gradient(var(--n-bg), var(--n-bg)) padding-box, var(--n-bg)',
          // subtle dotted "graph paper" backdrop
          backgroundImage:
            'radial-gradient(var(--n-border) 0.6px, transparent 0.6px)',
          backgroundSize: '18px 18px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div ref={trackRef} style={{ position: 'relative', width: `${trackWidth}px`, height: `${graphHeight}px`, willChange: 'transform' }}>
          <svg width={trackWidth} height={graphHeight} style={{ position: 'absolute', inset: 0, display: 'block' }}>
            {/* main rail */}
            <line
              x1={x(0)}
              y1={y(mainIdx)}
              x2={x(lastMainCol)}
              y2={y(mainIdx)}
              stroke={lanes[mainIdx].color}
              strokeWidth={3}
              strokeLinecap="round"
            />
            {/* branch fork → line → merge */}
            {branchPaths.map((b) => (
              <path key={b.lane.id} d={b.d} fill="none" stroke={b.lane.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {/* commit nodes */}
            {commits.map((c) => {
              const li = laneIndex.get(c.branch) ?? 0
              const color = laneById.get(c.branch)?.color ?? '#999'
              return (
                <g key={`${c.col}-${c.branch}`}>
                  <circle cx={x(c.col)} cy={y(li)} r={NODE_R} fill="var(--n-bg)" stroke={color} strokeWidth={3} />
                  <circle cx={x(c.col)} cy={y(li)} r={2.4} fill={color} />
                </g>
              )
            })}
          </svg>

          {/* branch-name refs at each fork point */}
          {lanes.map((lane, li) => {
            if (li === mainIdx) return null
            const cs = commits.filter((c) => c.branch === lane.id).sort((a, b) => a.col - b.col)
            if (cs.length === 0) return null
            const left = x(cs[0].col) - COL_W * 0.7
            return (
              <span
                key={lane.id}
                style={{
                  position: 'absolute',
                  left: `${left}px`,
                  top: `${y(li) - 26}px`,
                  transform: 'translateX(-50%)',
                  fontFamily: MONO,
                  fontSize: '0.6875rem',
                  color: lane.color,
                  background: `${lane.color}14`,
                  border: `1px solid ${lane.color}40`,
                  borderRadius: '5px',
                  padding: '1px 6px',
                  whiteSpace: 'nowrap',
                }}
              >
                {lane.label}
              </span>
            )
          })}

          {/* main rail label */}
          <span
            style={{
              position: 'absolute',
              left: `${x(0) - 6}px`,
              top: `${y(mainIdx) - 26}px`,
              transform: 'translateX(-100%)',
              fontFamily: MONO,
              fontSize: '0.6875rem',
              color: lanes[mainIdx].color,
              background: 'var(--n-hover)',
              borderRadius: '5px',
              padding: '1px 6px',
              whiteSpace: 'nowrap',
            }}
          >
            {lanes[mainIdx].label}
          </span>

          {/* commit labels */}
          {commits.map((c) => {
            const li = laneIndex.get(c.branch) ?? 0
            const color = laneById.get(c.branch)?.color ?? '#999'
            const above = li === mainIdx
            return (
              <div
                key={`lbl-${c.col}-${c.branch}`}
                style={{
                  position: 'absolute',
                  left: `${x(c.col)}px`,
                  top: above ? `${y(li) - NODE_R - 10}px` : `${y(li) + NODE_R + 10}px`,
                  transform: above ? 'translate(-50%, -100%)' : 'translateX(-50%)',
                  width: '152px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.25 }}>
                  {c.href ? (
                    <a href={c.href} target="_blank" rel="noopener noreferrer" className="inline-link" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid var(--n-border)' }}>
                      {c.org}
                    </a>
                  ) : (
                    c.org
                  )}
                </div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color, margin: '2px 0 1px' }}>{c.role}</div>
                <div style={{ fontFamily: MONO, fontSize: '0.625rem', color: 'var(--n-light)' }}>{c.period}</div>
                {c.desc && (
                  <div style={{ fontSize: '0.6875rem', color: 'var(--n-secondary)', lineHeight: 1.4, marginTop: '3px' }}>{c.desc}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* scroll affordance */}
      {data.scrollHint && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '8px',
            fontSize: '0.6875rem',
            color: 'var(--n-light)',
          }}
        >
          <span style={{ fontFamily: MONO }}>{data.scrollHint}</span>
          <span aria-hidden>→</span>
        </div>
      )}
    </div>
  )
}
