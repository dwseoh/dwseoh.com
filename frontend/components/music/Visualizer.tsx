'use client'

import { useEffect, useRef } from 'react'

// Each bar is BAR_CELLS square blocks wide; blocks are CELL px with GAP px between.
const CELL = 12
const GAP = 3
const BAR_CELLS = 2
const BAR_GAP = 9
// Space below the bottom row and above the tallest bar, in px. The box's top
// edge is the divider line, which the bars never cross.
const LIFT = 2
const HEADROOM = 6
// Frequency range the bars cover, spaced logarithmically like hearing. Acoustic
// ensembles have little energy above ~7 kHz, so stopping there keeps the whole
// width moving.
const F_MIN = 55
const F_MAX = 7000
// Peak caps hang this long (s), then fall at this fraction of the height per second.
const HOLD = 0.35
const FALL = 0.75

/**
 * A pixel-block spectrum filling its box (the strip under the list, behind the
 * player), as tall as the box allows. Each bar is one frequency band of whatever is playing
 * (read from `analyser`), lit from the bottom up with a falling peak cap. With
 * nothing playing it settles to a single still row of dim blocks and stops
 * drawing. Colour is the focused piece's light tone (--c2).
 */
export default function Visualizer({
  analyser,
  playing,
  tint,
  className,
}: {
  analyser: React.RefObject<AnalyserNode | null>
  playing: boolean
  /** Changes when the page colour does; the bars redraw while it fades. */
  tint: string
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const playingRef = useRef(playing)
  const startRef = useRef<() => void>(() => {})
  const tintUntil = useRef(0)

  useEffect(() => {
    playingRef.current = playing
    if (playing) startRef.current()
  }, [playing])

  // The page's colours fade over ~1.4s (see --c1/--c2 in the CSS).
  useEffect(() => {
    tintUntil.current = performance.now() + 1600
    startRef.current()
  }, [tint])

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const root = canvas.closest('.cw-root') as HTMLElement | null
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const barW = BAR_CELLS * CELL + (BAR_CELLS - 1) * GAP
    const pitchX = barW + BAR_GAP
    const pitchY = CELL + GAP

    let w = 0
    let h = 0
    let bars = 0
    let rows = 1
    let x0 = 0
    let levels = new Float32Array(0)
    let peaks = new Float32Array(0)
    let holds = new Float32Array(0)
    let edges: number[] = []
    let edgesFor: AnalyserNode | null = null
    let data = new Uint8Array(0)
    let color = '#c99a8f'
    let raf = 0
    let last = 0

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      bars = Math.max(1, Math.floor((w + BAR_GAP) / pitchX))
      x0 = Math.round((w - (bars * pitchX - BAR_GAP)) / 2)
      rows = Math.max(1, Math.floor((h - LIFT - HEADROOM) / pitchY))
      levels = new Float32Array(bars)
      peaks = new Float32Array(bars)
      holds = new Float32Array(bars)
      edgesFor = null
    }

    /** FFT bin boundaries for each bar, log-spaced between F_MIN and F_MAX. */
    const bandEdges = (an: AnalyserNode) => {
      const binHz = an.context.sampleRate / 2 / an.frequencyBinCount
      const out: number[] = []
      for (let b = 0; b <= bars; b++) {
        const f = F_MIN * Math.pow(F_MAX / F_MIN, b / bars)
        const bin = Math.min(an.frequencyBinCount - 1, Math.max(1, Math.round(f / binHz)))
        out.push(b ? Math.max(bin, out[b - 1] + 1) : bin)
      }
      return out
    }

    const draw = (dt: number) => {
      const an = analyser.current
      const live = playingRef.current && !!an
      if (live && an) {
        if (edgesFor !== an) {
          edges = bandEdges(an)
          data = new Uint8Array(an.frequencyBinCount)
          edgesFor = an
        }
        an.getByteFrequencyData(data)
      }
      if (root) color = getComputedStyle(root).getPropertyValue('--c2').trim() || color

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = color
      let busy = false

      for (let b = 0; b < bars; b++) {
        let target = 0
        if (live) {
          const lo = edges[b]
          const hi = Math.min(data.length, Math.max(edges[b + 1], lo + 1))
          let sum = 0
          for (let i = lo; i < hi; i++) sum += data[i]
          // Bass carries the most energy; tilt toward the highs to even it out.
          const v = Math.pow(sum / (hi - lo) / 255, 1.4) * (0.75 + 0.85 * (b / bars))
          target = Math.min(1, v) * rows
        }
        const cur = levels[b]
        levels[b] = cur + (target - cur) * (target > cur ? 0.55 : 0.14)

        if (levels[b] >= peaks[b]) {
          peaks[b] = levels[b]
          holds[b] = HOLD
        } else if ((holds[b] -= dt) < 0) {
          peaks[b] = Math.max(levels[b], peaks[b] - FALL * rows * dt)
        }
        if (levels[b] > 0.02 || peaks[b] > 0.02) busy = true

        const lit = Math.round(levels[b])
        const x = x0 + b * pitchX
        // The bottom row is always there, dimly: the visualizer at rest.
        for (let r = 0; r < Math.max(1, lit); r++) {
          ctx.globalAlpha = r < lit ? 0.08 + 0.14 * (r / rows) : 0.05
          for (let c = 0; c < BAR_CELLS; c++)
            ctx.fillRect(x + c * (CELL + GAP), h - LIFT - (r + 1) * pitchY, CELL, CELL)
        }
        const cap = Math.min(rows - 1, Math.round(peaks[b]))
        if (cap > lit) {
          ctx.globalAlpha = 0.22
          for (let c = 0; c < BAR_CELLS; c++)
            ctx.fillRect(x + c * (CELL + GAP), h - LIFT - (cap + 1) * pitchY, CELL, CELL)
        }
      }
      ctx.globalAlpha = 1
      return busy || live || performance.now() < tintUntil.current
    }

    const loop = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60
      last = now
      if (draw(dt)) {
        raf = requestAnimationFrame(loop)
      } else {
        raf = 0 // settled: nothing playing and every bar back at rest
        last = 0
      }
    }

    startRef.current = () => {
      if (reduced) draw(0)
      else if (!raf) raf = requestAnimationFrame(loop)
    }

    const ro = new ResizeObserver(() => {
      resize()
      draw(0)
    })
    ro.observe(canvas)
    if (playingRef.current) startRef.current()
    return () => {
      cancelAnimationFrame(raf)
      raf = 0
      ro.disconnect()
    }
  }, [analyser])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
