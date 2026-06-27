'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

/* Extracurriculars rendered as a side-scrolling mini golf course.
   Layout left -> right: red flag + hole (sits just inside the left arrow) ·
   markers (most-recent first) · golfer (sits just inside the right arrow). The
   golf ball is the only free mover.

   Camera (3 phases, like a platformer) as you advance right from the first item:
     1. ball rolls across the screen, course still, until the 3rd node centres;
     2. ball stays centred and the course scrolls until it hits its right end;
     3. course locked, ball rolls the rest of the way to the last node.
   So the golfer only appears at the far right and the flag only at the far left.

   On first scroll-into-view (and on Replay) the golfer swings and the ball arcs
   in from the right (parabolic hops, slope-aware landings) while the camera pans
   left, settling on the most-recent item. Detail for the selected item renders
   in a panel below the band, inside the same widget. Respects
   prefers-reduced-motion (no intro, instant). */

export interface Extracurricular {
  id: string
  name: string
  role: string
  date: string
  logo: string | null
  blurb: string
  href?: string
}

export interface ExtracurricularLabels {
  visit: string
  reset: string
}

// --- course geometry (px) ---
const H = 200 // band height
const BASE_Y = 152 // mean grass surface
const AMP = 9 // primary hill amplitude
const WAVE = 200 // primary hill wavelength
const BALL_R = 6.5
const INSET = 56 // safe zone each side so flag/golfer clear the arrows
const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)'
const TEE_BACK = 12 // ball tee sits this far left of the golfer's centre

// rolling-green surface (two harmonics for natural undulation); shared by the
// SVG path and the ball so it appears to rest on the slope as the course scrolls.
const baseSurface = (x: number) =>
  BASE_Y - AMP * Math.sin((x / WAVE) * Math.PI * 2) - AMP * 0.38 * Math.sin((x / (WAVE * 0.5)) * Math.PI * 2 + 0.8)
// Surface with a flat tee box around the golfer (far right) so he stands level
// rather than on a slope; smoothly blended into the rolling fairway.
const surfaceY = (x: number, L?: Layout): number => {
  const s = baseSurface(x)
  if (!L) return s
  const from = L.golferWorld - L.GAP * 0.55
  if (x <= from) return s
  const t = Math.min(1, (x - from) / (L.GAP * 0.32))
  const e = t * t * (3 - 2 * t) // smoothstep
  return s + (baseSurface(from) - s) * e
}
// distant hill line behind the fairway (depth)
const surfaceBack = (x: number) =>
  BASE_Y - 18 - 13 * Math.sin((x / (WAVE * 1.8)) * Math.PI * 2 + 1.1)

// scoped grass palette (kept in JS — SVG presentation attrs don't accept var())
const GRASS = {
  back: '#aedaa6',
  fairTop: '#74c65a',
  fairBot: '#45963b',
  stripeLt: 'rgba(255, 255, 255, 0.07)',
  stripeDk: 'rgba(16, 70, 26, 0.10)',
  crest: '#93da77',
  edge: '#3d8c35',
}

interface Layout {
  W: number
  GAP: number
  PAD: number
  center: number
  flagWorld: number
  golferWorld: number
  maxCam: number
  trackWidth: number
}

function computeLayout(W: number, n: number): Layout {
  const stage = Math.max(160, W - INSET * 2) // usable on-screen width between arrows
  const GAP = stage / 5 // five markers fill the stage (compressed)
  const center = W / 2
  const flagWorld = INSET + 14 // just inside the left arrow
  const PAD = flagWorld + GAP * 0.85 // first marker sits right of the flag
  const golferWorld = PAD + (n - 1) * GAP + GAP * 0.85
  const courseRight = golferWorld + INSET + 18 // golfer lands inside the right arrow when fully scrolled
  const maxCam = Math.max(0, courseRight - W)
  const trackWidth = courseRight + 40
  return { W, GAP, PAD, center, flagWorld, golferWorld, maxCam, trackWidth }
}

// camera offset: ball pinned to centre only between the 3rd node and the end
const camFor = (worldX: number, L: Layout) =>
  Math.min(Math.max(worldX - L.center, 0), L.maxCam)

const worldOf = (i: number, L: Layout) => L.PAD + i * L.GAP
const teeWorld = (L: Layout) => L.golferWorld - TEE_BACK

// --- intro flight: scripted parabolic hops (reliable landing, physical look) ---
interface Seg { x0: number; x1: number; y0: number; y1: number; apex: number; dur: number }
const WINDUP = 360 // ms of swing before contact (matches golferSwing's 50% impact)

function buildSegments(L: Layout): Seg[] {
  const start = teeWorld(L)
  const end = worldOf(0, L) // most-recent item
  const dist = start - end
  const fracs = [0.5, 0.78, 0.93, 1] // cumulative share of the journey per landing
  const apexes = [112, 58, 26, 0] // hop heights (px above surface), decaying
  const durs = [820, 520, 340, 300]
  const segs: Seg[] = []
  let prev = start
  fracs.forEach((f, k) => {
    const x1 = start - dist * f
    segs.push({
      x0: prev,
      x1,
      y0: surfaceY(prev, L) - BALL_R,
      y1: surfaceY(x1, L) - BALL_R,
      apex: apexes[k],
      dur: durs[k],
    })
    prev = x1
  })
  return segs
}

interface BallState { bx: number; by: number; done: boolean }

function introBallAt(elapsed: number, segs: Seg[]): BallState {
  if (elapsed < WINDUP) {
    return { bx: segs[0].x0, by: segs[0].y0, done: false }
  }
  const t = elapsed - WINDUP
  let acc = 0
  for (let k = 0; k < segs.length; k++) {
    const s = segs[k]
    const last = k === segs.length - 1
    if (t <= acc + s.dur || last) {
      const p = Math.min(1, (t - acc) / s.dur)
      const bx = s.x0 + (s.x1 - s.x0) * p
      const by = s.y0 + (s.y1 - s.y0) * p - s.apex * 4 * p * (1 - p)
      return { bx, by, done: last && p >= 1 }
    }
    acc += s.dur
  }
  const lastSeg = segs[segs.length - 1]
  return { bx: lastSeg.x1, by: lastSeg.y1, done: true }
}

// --- inline icons ---
function OutIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 4h6v6M20 4 11 13M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </svg>
  )
}
function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
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

/* A small shaded golfer facing left (toward the course). Body is static; the
   .golf-swing group (both arms + club) rotates about the shoulder on contact. */
function Golfer({ innerRef }: { innerRef: React.RefObject<SVGGElement | null> }) {
  return (
    <svg width="44" height="58" viewBox="0 0 44 58" fill="none" aria-hidden>
      <defs>
        <linearGradient id="golferSkin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0cca9" />
          <stop offset="1" stopColor="#d6a274" />
        </linearGradient>
        <linearGradient id="golferShirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3f5f8" />
          <stop offset="1" stopColor="#c2c8cf" />
        </linearGradient>
        <linearGradient id="golferPants" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5d6675" />
          <stop offset="1" stopColor="#3c424d" />
        </linearGradient>
        <linearGradient id="golferCap" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4ba0e6" />
          <stop offset="1" stopColor="#2a7bc0" />
        </linearGradient>
        <linearGradient id="golferArm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eccba8" />
          <stop offset="1" stopColor="#cf9c6e" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="24" cy="56" rx="13" ry="2.4" fill="rgba(0,0,0,0.16)" />

      {/* legs (back leg darker for depth) */}
      <path d="M24.5 37 L31 55" stroke="#363b45" strokeWidth="5.2" strokeLinecap="round" />
      <path d="M25 38 L19 55" stroke="url(#golferPants)" strokeWidth="5.4" strokeLinecap="round" />
      {/* shoes (pointing left) */}
      <path d="M17 55 q-3 0.4 -3 2 q0 1.4 3 1.2 l3 -0.3 q1.4 -0.2 0.6 -1.6 z" fill="#2c313a" />
      <path d="M29 55 q-1.6 1 -0.4 2.4 q0.9 1 3.4 0.7 l1 -0.2 q1.2 -0.4 0.2 -1.7 z" fill="#3a414c" />

      {/* torso (polo), leaning slightly toward the ball */}
      <path d="M19 22 q-2 9 0.5 17 q4.5 2 9.5 0 q2.4 -8.5 -0.5 -17 q-4.6 -2.2 -9.5 0 z" fill="url(#golferShirt)" />
      <path d="M19.4 22 q-1 8 0.4 16.5 q1.6 0.7 3 0.8 q-1.6 -8.6 -0.8 -17.6 q-1.4 0 -2.6 0.3 z" fill="rgba(0,0,0,0.06)" />

      {/* neck + head */}
      <path d="M21 19 l4 0 l0 4 l-4 0 z" fill="url(#golferSkin)" />
      <circle cx="22" cy="13.5" r="5.4" fill="url(#golferSkin)" />
      <path d="M16.8 12.8 a5.4 5.4 0 0 1 10.6 -0.9 q-5.4 -2.4 -10.6 0.9 z" fill="rgba(0,0,0,0.05)" />
      {/* cap + visor (the one site accent) */}
      <path d="M16.6 12.2 a5.6 5.6 0 0 1 11.1 -1.1 q-5.6 -2.2 -11.1 1.1 z" fill="url(#golferCap)" />
      <path d="M16.6 12.2 q-3.4 -0.2 -5 1.5 q3.2 0.8 5.2 -0.1 z" fill="url(#golferCap)" />
      <ellipse cx="27.4" cy="10.6" rx="1.1" ry="1.1" fill="#bfe0ff" opacity="0.7" />

      {/* swinging arms + club (rotates about the shoulder) */}
      <g ref={innerRef} className="golf-swing" style={{ transformOrigin: '24px 23px' }}>
        <path d="M24 23 L19 32" stroke="url(#golferArm)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="18.6" cy="32.2" r="2.4" fill="#e9eef2" stroke="#c4ccd2" strokeWidth="0.6" />
        {/* club shaft */}
        <path d="M18.6 32.2 L10 49" stroke="#9aa2a8" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M18.6 32.2 L10 49" stroke="#d7dde1" strokeWidth="0.6" strokeLinecap="round" />
        {/* club head */}
        <path d="M10 47.6 q-3.6 0.4 -4.2 2.6 q-0.2 1.6 2.4 1.8 l2.6 -0.6 q1.6 -0.6 0.6 -2.4 z" fill="#7f878d" />
        <path d="M10 47.6 q-3.6 0.4 -4.2 2.6 l1 0.4 q1 -1.8 3.6 -1.7 z" fill="#aab1b6" />
      </g>
    </svg>
  )
}

export default function GolfCourse({ items, labels }: { items: Extracurricular[]; labels: ExtracurricularLabels }) {
  const n = items.length
  const [W, setW] = useState(0)
  const [selected, setSelected] = useState(0)
  const [phase, setPhase] = useState<'intro' | 'idle'>('intro')
  const [scrolling, setScrolling] = useState(false) // reset pre-scroll to the tee
  const [reduce, setReduce] = useState(false)

  const bandRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const ballRef = useRef<HTMLDivElement>(null)
  const swingRef = useRef<SVGGElement>(null)
  const enteredRef = useRef(false)
  const introCancelRef = useRef(false)
  const rafRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // measure viewport width
  useLayoutEffect(() => {
    const el = bandRef.current
    if (!el) return
    const measure = () => setW(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const layout = useMemo(() => (W > 0 ? computeLayout(W, n) : null), [W, n])

  const terrain = useMemo(() => {
    if (!layout) return null
    const tw = layout.trackWidth
    const area = (surf: (x: number) => number) => {
      let d = `M0 ${H} L0 ${surf(0).toFixed(1)}`
      for (let x = 0; x <= tw; x += 12) d += ` L${x} ${surf(x).toFixed(1)}`
      return `${d} L${tw} ${H} Z`
    }
    const line = (surf: (x: number) => number) => {
      let d = `M0 ${surf(0).toFixed(1)}`
      for (let x = 12; x <= tw; x += 12) d += ` L${x} ${surf(x).toFixed(1)}`
      return d
    }
    const stripeW = layout.GAP / 2
    const stripes: number[] = []
    for (let x = 0; x < tw; x += stripeW) stripes.push(x)
    const surf = (x: number) => surfaceY(x, layout)
    return {
      fair: area(surf),
      back: area(surfaceBack),
      crest: line(surf),
      stripeW,
      stripes,
    }
  }, [layout])

  const stopAnim = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }, [])

  const runFlight = useCallback(() => {
    if (!layout) return
    const segs = buildSegments(layout)
    const sw = swingRef.current
    if (sw) {
      sw.classList.remove('is-swinging')
      void sw.getBoundingClientRect() // restart the keyframes on replay
      sw.classList.add('is-swinging')
    }
    const t0 = performance.now()
    const tick = (now: number) => {
      if (introCancelRef.current) return // a manual move took over
      const s = introBallAt(now - t0, segs)
      const cam = camFor(s.bx, layout)
      if (trackRef.current) trackRef.current.style.transform = `translateX(${-cam}px)`
      if (ballRef.current) {
        ballRef.current.style.left = `${s.bx - cam}px`
        ballRef.current.style.top = `${s.by}px`
      }
      if (s.done) { setPhase('idle'); setSelected(0); return }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [layout])

  // play (or replay) the intro: optional animated scroll to the tee, then swing
  const playIntro = useCallback((prescroll: boolean) => {
    if (!layout) return
    stopAnim()
    introCancelRef.current = false
    enteredRef.current = true
    if (reduce) { setScrolling(false); setPhase('idle'); setSelected(0); return }
    setPhase('intro')
    if (prescroll) {
      setScrolling(true)
      timerRef.current = setTimeout(() => { setScrolling(false); runFlight() }, 560)
    } else {
      timerRef.current = setTimeout(runFlight, 24) // let the tee first-frame commit
    }
  }, [layout, reduce, runFlight, stopAnim])

  // first scroll-into-view
  useEffect(() => {
    const el = bandRef.current
    if (!el || !layout || enteredRef.current) return
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { io.disconnect(); playIntro(false) } },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [layout, playIntro])

  useEffect(() => () => stopAnim(), [stopAnim])

  const jumpTo = (i: number) => {
    if (phase === 'intro') return // busy during the swing/flight
    if (i < 0 || i > n - 1) return
    introCancelRef.current = true
    stopAnim()
    setScrolling(false)
    setSelected(i)
  }

  if (n === 0) return null

  // resting view (idle) or the intro's first frame (ball at the tee)
  let cam = 0, ballX = 0, ballY = surfaceY(0) - BALL_R
  if (layout) {
    const bw = phase === 'idle' ? worldOf(selected, layout) : teeWorld(layout)
    cam = camFor(bw, layout)
    ballX = bw - cam
    ballY = surfaceY(bw, layout) - BALL_R
  }

  const busy = phase === 'intro'
  const animate = phase === 'idle' && !reduce
  const trackTrans = scrolling ? `transform 0.5s ${EASE}` : animate ? `transform 0.55s ${EASE}` : 'none'
  const ballTrans = scrolling
    ? `left 0.5s ${EASE}, top 0.5s ${EASE}`
    : animate ? `left 0.55s ${EASE}, top 0.55s ${EASE}` : 'none'
  const cur = items[phase === 'idle' ? selected : 0]
  const activeIdx = phase === 'idle' ? selected : 0

  return (
    <div className="golf-wrap">
      <div ref={bandRef} className="golf" role="group" aria-roledescription="carousel" aria-label="Extracurriculars" style={{ height: `${H}px` }}>
        {layout && terrain && (
          <>
            {/* sliding course: grass + flag + markers + golfer */}
            <div
              ref={trackRef}
              className="golf-track"
              style={{ width: `${layout.trackWidth}px`, transform: `translateX(${-cam}px)`, transition: trackTrans }}
            >
              <svg className="golf-grass" width={layout.trackWidth} height={H} viewBox={`0 0 ${layout.trackWidth} ${H}`} preserveAspectRatio="none" aria-hidden>
                <defs>
                  <linearGradient id="golfFair" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={GRASS.fairTop} />
                    <stop offset="1" stopColor={GRASS.fairBot} />
                  </linearGradient>
                  <clipPath id="golfClip"><path d={terrain.fair} /></clipPath>
                </defs>
                {/* distant hill */}
                <path d={terrain.back} fill={GRASS.back} opacity="0.65" />
                {/* fairway with mowing stripes */}
                <g clipPath="url(#golfClip)">
                  <rect x="0" y="0" width={layout.trackWidth} height={H} fill="url(#golfFair)" />
                  {terrain.stripes.map((x, i) => (
                    <rect key={i} x={x} y="0" width={terrain.stripeW} height={H} fill={i % 2 ? GRASS.stripeLt : GRASS.stripeDk} />
                  ))}
                </g>
                {/* sunlit crest + soft edge below it */}
                <path d={terrain.crest} fill="none" stroke={GRASS.crest} strokeWidth="2.4" strokeLinecap="round" />
                <path d={terrain.crest} fill="none" stroke={GRASS.edge} strokeWidth="1" strokeLinecap="round" opacity="0.45" transform="translate(0,2.6)" />
              </svg>

              {/* flag + hole (far-left feature) */}
              <span className="golf-flag-slot" style={{ left: `${layout.flagWorld}px`, bottom: `${H - surfaceY(layout.flagWorld, layout)}px` }}>
                <span className="golf-hole" />
                <span className="golf-flagstick"><span className="golf-flag" /></span>
              </span>

              {/* markers */}
              {items.map((item, i) => {
                const wx = worldOf(i, layout)
                const active = phase === 'idle' && i === selected
                return (
                  <span key={item.id} className="golf-marker-slot" style={{ left: `${wx}px`, bottom: `${H - surfaceY(wx, layout)}px` }}>
                    <button
                      type="button"
                      className={`golf-marker${active ? ' is-active' : ''}`}
                      aria-label={item.name}
                      aria-pressed={active}
                      disabled={busy}
                      onClick={() => jumpTo(i)}
                    >
                      <span className="golf-name">{item.name}</span>
                      <span className="golf-chip">
                        {item.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.logo} alt="" loading="lazy" />
                        ) : (
                          <span className="golf-chip-initial">{item.name.charAt(0)}</span>
                        )}
                      </span>
                      <span className="golf-pole" />
                      <span className="golf-base" />
                    </button>
                  </span>
                )
              })}

              {/* golfer (far-right tee) */}
              <span className="golf-golfer-slot" style={{ left: `${layout.golferWorld}px`, bottom: `${H - surfaceY(layout.golferWorld, layout)}px` }}>
                <Golfer innerRef={swingRef} />
              </span>
            </div>

            {/* ball — screen overlay, clean sphere, the only free mover */}
            <div
              ref={ballRef}
              className="golf-ball"
              style={{ left: `${ballX}px`, top: `${ballY}px`, transition: ballTrans }}
            />

            {/* navigation */}
            <button className="golf-arrow golf-arrow--prev" aria-label="Previous" onClick={() => jumpTo(selected - 1)} disabled={busy || selected === 0}>
              <ChevronLeft />
            </button>
            <button className="golf-arrow golf-arrow--next" aria-label="Next" onClick={() => jumpTo(selected + 1)} disabled={busy || selected === n - 1}>
              <ChevronRight />
            </button>
            <button className="golf-reset" onClick={() => playIntro(true)} disabled={busy}>
              <RefreshIcon /> {labels.reset}
            </button>
            <span className="golf-counter">{activeIdx + 1} / {n}</span>
          </>
        )}
      </div>

      {/* detail panel (part of the same widget) */}
      <div className="golf-detail">
        <div className="golf-detail-head">
          <span className="golf-detail-name">{cur.name}</span>
          <span className="golf-detail-sub">{cur.role} · {cur.date}</span>
        </div>
        <p className="golf-detail-blurb">{cur.blurb}</p>
        {cur.href && (
          <a className="golf-detail-visit" href={cur.href} target="_blank" rel="noopener noreferrer">
            {labels.visit} <OutIcon />
          </a>
        )}
      </div>
    </div>
  )
}
