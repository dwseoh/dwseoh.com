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
const BALL_SINK = 3 // how far the ball nestles into the crest so it rests *on* the grass
const PLANT = 3 // how far stakes/flag/golfer sink into the turf so they read as planted
const INSET = 56 // safe zone each side so flag/golfer clear the arrows
const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)'
const TEE_BACK = 22 // ball tee sits under the club head at address (left of golfer centre)
const TRAIL_N = 11 // motion-trail particles (the "wind whoosh" behind the struck ball)

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

// ball's top (css) so it rests on the crest with a slight nestle into the grass
const ballTopAt = (x: number, L?: Layout) => surfaceY(x, L) - BALL_R * 2 + BALL_SINK

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

// "ongoing" items (still active today) get the periodic gold shimmer + sparkle
const isOngoing = (date: string) => /\b(present|current|now|ongoing)\b/i.test(date)

// --- intro shot: one ballistic arc -> a single small bounce -> roll to the cup ---
// On contact the ball gets a launch velocity and flies a gravity-governed
// parabola (constant horizontal speed, vertical decelerating to the apex then
// accelerating down) toward the most-recent marker. It lands just short, takes
// ONE small bounce, then rolls the rest of the way into the cup along the
// terrain (handed off to the energy roll below).
interface Seg { x0: number; x1: number; y0: number; y1: number; apex: number; dur: number }
const WINDUP = 800 // ms of swing before contact (matches the swing's ~64% impact)

function buildFlightSegs(L: Layout): Seg[] {
  const start = teeWorld(L)
  const target = worldOf(0, L) // most-recent item
  const landX = target + L.GAP * 0.34 // land a touch short (ball travels leftward)
  const bounceX = target + L.GAP * 0.14 // one small bounce carries it most of the rest
  return [
    // the flight: a tall, gravity-shaped arc
    { x0: start, x1: landX, y0: ballTopAt(start, L), y1: ballTopAt(landX, L), apex: 116, dur: 1080 },
    // the single bounce: low, energy mostly spent
    { x0: landX, x1: bounceX, y0: ballTopAt(landX, L), y1: ballTopAt(bounceX, L), apex: 21, dur: 300 },
  ]
}

// parabolic position within a flight/bounce segment (p in 0..1); constant
// horizontal speed, symmetric vertical arc = no air resistance, just gravity.
function arcAt(s: Seg, p: number): { bx: number; by: number } {
  const bx = s.x0 + (s.x1 - s.x0) * p
  const by = s.y0 + (s.y1 - s.y0) * p - s.apex * 4 * p * (1 - p)
  return { bx, by }
}

// --- idle putt: terrain-following roll with energy-based speed ---
// Each nav is a fresh "hit" toward the target marker. Speed tracks
// sqrt(E - elevation), so the ball labours up rises and quickens through dips;
// a decay envelope bleeds energy so it settles to rest at the cup. y is sampled
// from the surface every frame, so the ball hugs the terrain instead of cutting
// a straight chord across it.
interface RollProfile { xs: number[]; cumT: number[]; total: number }
function buildRollProfile(x0: number, x1: number, L: Layout): RollProfile {
  const dir = Math.sign(x1 - x0) || 1
  const dist = Math.abs(x1 - x0)
  const xs: number[] = [x0]
  for (let x = x0 + 2 * dir; dir > 0 ? x < x1 : x > x1; x += 2 * dir) xs.push(x)
  xs.push(x1)
  const N = xs.length
  const elev = xs.map((x) => BASE_Y - surfaceY(x, L)) // higher ground -> larger
  const eMax = Math.max(...elev)
  const E = eMax + 30 // kinetic headroom above the highest point (the hit's strength)
  const speed = elev.map((e, k) => {
    const u = N > 1 ? k / (N - 1) : 0
    const env = 0.3 + 0.7 * (1 - u) // shed energy: brisk off the hit, easing to rest
    return Math.max(0.06, Math.sqrt(Math.max(0.001, E - e)) * env)
  })
  const cumT = [0]
  for (let k = 1; k < N; k++) {
    const dx = Math.abs(xs[k] - xs[k - 1])
    const v = (speed[k] + speed[k - 1]) / 2
    cumT.push(cumT[k - 1] + dx / v)
  }
  const raw = cumT[N - 1] || 1
  const total = Math.min(820, Math.max(360, dist * 1.15))
  for (let k = 0; k < N; k++) cumT[k] = (cumT[k] / raw) * total
  return { xs, cumT, total }
}

function rollXAt(p: RollProfile, t: number): number {
  const { xs, cumT } = p
  const N = xs.length
  if (t <= 0) return xs[0]
  if (t >= cumT[N - 1]) return xs[N - 1]
  let k = 1
  while (k < N && cumT[k] < t) k++
  const span = cumT[k] - cumT[k - 1]
  const f = span > 0 ? (t - cumT[k - 1]) / span : 0
  return xs[k - 1] + (xs[k] - xs[k - 1]) * f
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

/* A shaded side-view golfer facing left (toward the course). The swing is a
   kinetic chain of nested groups, each pivoting about an anatomical joint and
   each lagging the previous so power transfers from the ground up:
     .golf-lower (hips)  ->  .golf-torso (chest/shoulders)  ->
       .golf-head (kept ~stable, eyes on the ball)  +
       .golf-arms (shoulder swing)  ->  .golf-club (wrist cock + release).
   Because the groups nest, rotations compound (the shoulders carry the arms,
   the arms carry the club) — the backswing is a body turn, not just arm-flapping.
   The club cocks at the top and *releases* through impact (the whip). The root
   .golf-anim carries the .is-swinging trigger so all five restart in lockstep. */
function Golfer({ innerRef }: { innerRef: React.RefObject<SVGGElement | null> }) {
  return (
    <svg width="52" height="66" viewBox="0 0 56 70" fill="none" aria-hidden style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="golferSkin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3d0ae" />
          <stop offset="1" stopColor="#d39f6f" />
        </linearGradient>
        <linearGradient id="golferShirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbfcfd" />
          <stop offset="1" stopColor="#c0c7cf" />
        </linearGradient>
        <linearGradient id="golferPants" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5d6675" />
          <stop offset="1" stopColor="#363c47" />
        </linearGradient>
        <linearGradient id="golferCap" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5aa8ea" />
          <stop offset="1" stopColor="#2a7bc0" />
        </linearGradient>
        <linearGradient id="golferArm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#efcaa6" />
          <stop offset="1" stopColor="#cd9a6c" />
        </linearGradient>
        <linearGradient id="golferShaft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6ebee" />
          <stop offset="1" stopColor="#9aa2a8" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="27" cy="65.5" rx="15" ry="2.6" fill="rgba(0,0,0,0.16)" />

      {/* legs — planted; back leg (right) darker for depth */}
      <path d="M30 41 Q33.4 51.5 35.2 62.5" stroke="#363c47" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M25 41 Q21.5 51.5 16.5 62.5" stroke="url(#golferPants)" strokeWidth="6.4" fill="none" strokeLinecap="round" />
      {/* shoes (pointing left) */}
      <path d="M35.4 62 q-1.6 1.2 -0.3 2.6 q1 1 3.4 0.6 l1.1 -0.2 q1.3 -0.5 0.2 -1.9 z" fill="#3a414c" />
      <path d="M16.5 62 q-3.6 0.4 -4.3 2.3 q-0.3 1.7 2.7 1.6 l3.3 -0.3 q1.6 -0.3 0.7 -1.9 z" fill="#2c313a" />

      {/* animated rig: kinetic chain hips -> torso -> (head, arms -> club) */}
      <g ref={innerRef} className="golf-anim">
        {/* hips — lead the downswing; the whole upper body turns about them */}
        <g className="golf-lower" style={{ transformOrigin: '28px 43px' }}>
          {/* hips / belt */}
          <path d="M23 38 q5 -1.4 10 0 l-0.3 5 q-4.7 1.4 -9.4 0 z" fill="url(#golferPants)" />

          {/* torso / chest — the big coil; carries the arms */}
          <g className="golf-torso" style={{ transformOrigin: '28px 41px' }}>
            <path d="M23.4 40 q-1.4 -10 2.6 -19 q3.2 -1.4 6.4 0 q3 9 1.6 19 q-5.4 2 -10.6 0 z" fill="url(#golferShirt)" />
            <path d="M24 40 q-1.2 -9.5 2.4 -18.4 q1.4 -0.5 2.2 -0.3 q-3 9 -1.6 19 q-1.6 0.2 -3 -0.3 z" fill="rgba(0,0,0,0.06)" />
            <path d="M26 21 q2.8 -1.2 5.6 0 l-1 2.2 q-1.8 -0.7 -3.6 0 z" fill="rgba(255,255,255,0.55)" />

            {/* head — counter-rotates so the eyes stay on the ball, lifts at finish */}
            <g className="golf-head" style={{ transformOrigin: '28px 19px' }}>
              <path d="M26 18.5 l4.2 0 l-0.3 4 l-3.6 0 z" fill="url(#golferSkin)" />
              <circle cx="28" cy="12.4" r="5.4" fill="url(#golferSkin)" />
              <path d="M22.8 11.8 a5.4 5.4 0 0 1 10.4 -1.3 q-5.2 -2.4 -10.4 1.3 z" fill="rgba(0,0,0,0.05)" />
              {/* cap + brim (the one site accent), pointing left */}
              <path d="M22.7 11 a5.6 5.6 0 0 1 10.9 -1.2 q-5.5 -2.2 -10.9 1.2 z" fill="url(#golferCap)" />
              <path d="M22.9 10.8 q-3.6 -0.1 -5.3 1.7 q3.3 0.9 5.5 0 z" fill="url(#golferCap)" />
              <ellipse cx="31" cy="8.4" rx="1.2" ry="1.1" fill="#cce6ff" opacity="0.75" />
            </g>

            {/* arms — swing about the shoulder */}
            <g className="golf-arms" style={{ transformOrigin: '27px 23px' }}>
              {/* trail (back) arm */}
              <path d="M30 23 L21.5 38.5" stroke="#c89464" strokeWidth="3.6" strokeLinecap="round" />
              {/* lead (front) arm */}
              <path d="M27 23 L21 38.5" stroke="url(#golferArm)" strokeWidth="4" strokeLinecap="round" />
              {/* gloved hands on the grip */}
              <circle cx="21" cy="38.6" r="2.6" fill="#eef2f5" stroke="#c4ccd2" strokeWidth="0.7" />

              {/* club — cocks against the arms, then whips through impact */}
              <g className="golf-club" style={{ transformOrigin: '21px 38.6px' }}>
                {/* shaft */}
                <path d="M21 38.6 L6.5 58" stroke="url(#golferShaft)" strokeWidth="1.8" strokeLinecap="round" />
                {/* driver head */}
                <g transform="rotate(-20 5 60)">
                  <ellipse cx="5" cy="60" rx="4.6" ry="3.1" fill="#737a80" />
                  <ellipse cx="4.2" cy="59.2" rx="3" ry="1.7" fill="#a9b0b5" opacity="0.85" />
                  <path d="M1 60.4 l8 0" stroke="#5c6266" strokeWidth="0.5" opacity="0.7" />
                </g>
              </g>
            </g>
          </g>
        </g>
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
  const [rolling, setRolling] = useState<{ from: number; to: number } | null>(null) // a putt in flight
  const [reduce, setReduce] = useState(false)

  const bandRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const ballRef = useRef<HTMLDivElement>(null)
  const swingRef = useRef<SVGGElement>(null)
  const trailRefs = useRef<(HTMLDivElement | null)[]>([])
  const histRef = useRef<{ x: number; y: number }[]>([]) // recent screen positions
  const enteredRef = useRef(false)
  const introCancelRef = useRef(false)
  const rollCancelRef = useRef(false)
  const rafRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // wind-whoosh trail: a short comet tail of the ball's recent positions.
  // paintTrail pushes the live point and re-lays the pool with fading opacity;
  // fadeTrail bleeds it out as the ball slows into a roll; clearTrail resets it.
  const paintTrail = useCallback((sx: number, sy: number) => {
    const h = histRef.current
    h.unshift({ x: sx, y: sy })
    if (h.length > TRAIL_N + 1) h.length = TRAIL_N + 1
    for (let i = 0; i < TRAIL_N; i++) {
      const el = trailRefs.current[i]
      if (!el) continue
      const p = h[i]
      if (!p) { el.style.opacity = '0'; continue }
      const k = i / TRAIL_N
      // stretch each puff along the ball's travel so it reads as a motion streak
      const q = h[i + 1]
      let ang = 0, stretch = 1
      if (q) {
        const dx = p.x - q.x, dy = p.y - q.y
        ang = Math.atan2(dy, dx) * 180 / Math.PI
        stretch = Math.min(2.6, 1 + Math.hypot(dx, dy) / 9)
      }
      el.style.left = `${p.x}px`
      el.style.top = `${p.y}px`
      el.style.transform = `translate(-50%, -50%) rotate(${ang.toFixed(1)}deg) scale(${(stretch * (1 - 0.45 * k)).toFixed(2)}, ${(1 - 0.55 * k).toFixed(2)})`
      el.style.opacity = `${(0.62 * (1 - k)).toFixed(3)}`
    }
  }, [])
  const fadeTrail = useCallback(() => {
    for (const el of trailRefs.current) {
      if (!el) continue
      const o = parseFloat(el.style.opacity || '0')
      el.style.opacity = o > 0.012 ? `${(o * 0.78).toFixed(3)}` : '0'
    }
  }, [])
  const clearTrail = useCallback(() => {
    histRef.current.length = 0
    for (const el of trailRefs.current) if (el) el.style.opacity = '0'
  }, [])

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
    introCancelRef.current = true
    rollCancelRef.current = true
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }, [])

  const runFlight = useCallback(() => {
    if (!layout) return
    const segs = buildFlightSegs(layout)
    const flightDur = segs.reduce((a, s) => a + s.dur, 0)
    const startX = segs[0].x0
    const bounceEndX = segs[segs.length - 1].x1
    const target = worldOf(0, layout)
    const rollProf = buildRollProfile(bounceEndX, target, layout) // the settle into the cup
    // During the flight the camera pans smoothly (tracking the ball's horizontal
    // progress) from the tee view to the flag view, instead of pinning the ball
    // at screen-centre. That way the ball traces a real parabola across the
    // screen rather than appearing to go straight up and straight back down.
    const camStart = camFor(startX, layout)
    const camEnd = camFor(bounceEndX, layout) // == the roll's starting camera, so the hand-off is seamless
    const flightSpan = startX - bounceEndX || 1
    const camFlight = (bx: number) => {
      const hp = Math.min(1, Math.max(0, (startX - bx) / flightSpan))
      return camStart + (camEnd - camStart) * hp
    }
    const sw = swingRef.current
    if (sw) {
      sw.classList.remove('is-swinging')
      void sw.getBoundingClientRect() // restart the keyframes on replay
      sw.classList.add('is-swinging')
    }
    clearTrail()
    const place = (bx: number, by: number, cam: number) => {
      if (trackRef.current) trackRef.current.style.transform = `translateX(${-cam}px)`
      if (ballRef.current) {
        ballRef.current.style.left = `${bx - cam}px`
        ballRef.current.style.top = `${by}px`
      }
    }
    const t0 = performance.now()
    const tick = (now: number) => {
      if (introCancelRef.current) return // a manual move took over
      const elapsed = now - t0
      // wind-up: ball waits at the tee until the club reaches it (impact)
      if (elapsed < WINDUP) {
        place(startX, segs[0].y0, camStart)
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      const t = elapsed - WINDUP
      if (t < flightDur) {
        // the ballistic arc + single bounce — fast, so it leaves a whoosh trail
        let acc = 0, k = 0
        while (k < segs.length - 1 && t > acc + segs[k].dur) { acc += segs[k].dur; k++ }
        const s = segs[k]
        const p = Math.min(1, (t - acc) / s.dur)
        const { bx, by } = arcAt(s, p)
        const cam = camFlight(bx)
        place(bx, by, cam)
        paintTrail(bx - cam, by)
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      // roll the rest of the way into the cup, hugging the terrain
      const tr = t - flightDur
      if (tr >= rollProf.total) {
        place(target, ballTopAt(target, layout), camFor(target, layout))
        clearTrail()
        if (sw) sw.classList.remove('is-swinging') // ease the golfer back to address
        setPhase('idle'); setSelected(0)
        return
      }
      const x = rollXAt(rollProf, tr)
      place(x, ballTopAt(x, layout), camFor(x, layout))
      fadeTrail() // the whoosh dies away as the ball slows to a roll
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [layout, paintTrail, fadeTrail, clearTrail])

  // putt the ball from one marker to another, hugging the terrain (idle nav)
  const runRoll = useCallback((from: number, to: number) => {
    if (!layout) return
    const prof = buildRollProfile(worldOf(from, layout), worldOf(to, layout), layout)
    rollCancelRef.current = false
    const t0 = performance.now()
    const tick = (now: number) => {
      if (rollCancelRef.current) return
      const t = now - t0
      const x = rollXAt(prof, t)
      const cam = camFor(x, layout)
      if (trackRef.current) trackRef.current.style.transform = `translateX(${-cam}px)`
      if (ballRef.current) {
        ballRef.current.style.left = `${x - cam}px`
        ballRef.current.style.top = `${ballTopAt(x, layout)}px`
      }
      if (t >= prof.total) { setSelected(to); setRolling(null); return }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [layout])

  // launch a putt once the freeze-at-start frame has committed
  useEffect(() => { if (rolling) runRoll(rolling.from, rolling.to) }, [rolling, runRoll])

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
    if (phase === 'intro' || rolling) return // busy during the swing/flight or a putt
    if (i < 0 || i > n - 1 || i === selected) return
    stopAnim()
    setScrolling(false)
    if (reduce) { setSelected(i); return }
    setRolling({ from: selected, to: i }) // the effect kicks off the rAF putt
  }

  if (n === 0) return null

  // resting view (idle) or the intro's first frame (ball at the tee). While a putt
  // is rolling, freeze this to the start marker — the rAF loop drives the rest.
  let cam = 0, ballX = 0, ballY = ballTopAt(0)
  if (layout) {
    const bw = phase === 'idle' ? worldOf(selected, layout) : teeWorld(layout)
    cam = camFor(bw, layout)
    ballX = bw - cam
    ballY = ballTopAt(bw, layout)
  }

  const busy = phase === 'intro' || !!rolling
  const animate = phase === 'idle' && !reduce && !rolling
  const trackTrans = scrolling ? `transform 0.5s ${EASE}` : animate ? `transform 0.55s ${EASE}` : 'none'
  const ballTrans = scrolling
    ? `left 0.5s ${EASE}, top 0.5s ${EASE}`
    : animate ? `left 0.55s ${EASE}, top 0.55s ${EASE}` : 'none'
  const activeIdx = phase === 'intro' ? 0 : rolling ? rolling.to : selected
  const cur = items[activeIdx]

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
              <span className="golf-flag-slot" style={{ left: `${layout.flagWorld}px`, bottom: `${H - surfaceY(layout.flagWorld, layout) - PLANT}px` }}>
                <span className="golf-hole" />
                <span className="golf-flagstick"><span className="golf-flag" /></span>
              </span>

              {/* markers */}
              {items.map((item, i) => {
                const wx = worldOf(i, layout)
                const active = phase !== 'intro' && i === activeIdx
                const ongoing = isOngoing(item.date)
                return (
                  <span key={item.id} className="golf-marker-slot" style={{ left: `${wx}px`, bottom: `${H - surfaceY(wx, layout) - PLANT}px` }}>
                    <button
                      type="button"
                      className={`golf-marker${active ? ' is-active' : ''}${ongoing ? ' is-ongoing' : ''}`}
                      aria-label={item.name}
                      aria-pressed={active}
                      disabled={busy}
                      onClick={() => jumpTo(i)}
                    >
                      <span className="golf-name">{item.name}</span>
                      <span className="golf-chip-wrap">
                        <span className="golf-chip">
                          {item.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.logo} alt="" loading="lazy" />
                          ) : (
                            <span className="golf-chip-initial">{item.name.charAt(0)}</span>
                          )}
                        </span>
                        {ongoing && (
                          <span className="golf-sparkles" aria-hidden>
                            <i className="golf-spark golf-spark--1" />
                            <i className="golf-spark golf-spark--2" />
                            <i className="golf-spark golf-spark--3" />
                          </span>
                        )}
                      </span>
                      <span className="golf-pole" />
                      <span className="golf-base" />
                    </button>
                  </span>
                )
              })}

              {/* golfer (far-right tee) */}
              <span className="golf-golfer-slot" style={{ left: `${layout.golferWorld}px`, bottom: `${H - surfaceY(layout.golferWorld, layout) - PLANT}px` }}>
                <Golfer innerRef={swingRef} />
              </span>
            </div>

            {/* wind-whoosh trail — screen overlay behind the ball, driven by rAF */}
            {Array.from({ length: TRAIL_N }).map((_, i) => (
              <div
                key={i}
                ref={(el) => { trailRefs.current[i] = el }}
                className="golf-trail"
                aria-hidden
              />
            ))}

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

      {/* detail panel — same widget; mirrors an Experience row (logo · text) */}
      <div className="golf-detail">
        <span className="golf-detail-logo">
          {cur.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cur.logo} alt="" loading="lazy" />
          ) : (
            <span className="golf-detail-initial">{cur.name.charAt(0)}</span>
          )}
        </span>
        <div className="golf-detail-main">
          <div className="golf-detail-line">
            <span className="golf-detail-role">
              <strong>{cur.role}</strong>
              <span className="golf-detail-at"> @{cur.name}</span>
            </span>
            {cur.href && (
              <a className="golf-detail-visit" href={cur.href} target="_blank" rel="noopener noreferrer">
                {labels.visit} <OutIcon />
              </a>
            )}
            <span className="golf-detail-date">{cur.date}</span>
          </div>
          <p className="golf-detail-blurb">{cur.blurb}</p>
        </div>
      </div>
    </div>
  )
}
