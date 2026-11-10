'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'

/** Height of one row on the drum's surface, in px. Matches `.cw-row` in the CSS. */
export const ROW_H = 64

// How round the drum is. A larger radius (relative to the drum's height) is
// flatter; a larger perspective (relative to the radius) foreshortens less.
const RADIUS = 0.76
const PERSPECTIVE = 3.6
// Rows further round than this (radians from the front) are hidden.
const MAX_ANGLE = 1.48
// How quickly the drum catches up with input (per second): higher is snappier.
const STIFFNESS = 18
const DRAG_STIFFNESS = 40
// Wheel scrolling settles on a row this long (ms) after the last event.
const WHEEL_SNAP = 100

interface Props {
  count: number
  /** The focused row. Changing it from outside turns the drum there. */
  index: number
  /** Changes whenever the list itself changes (a section), which re-seats the drum. */
  listKey: string
  label: string
  rowKey: (i: number) => string
  rowId: (i: number) => string
  renderRow: (i: number) => React.ReactNode
  onIndexChange: (i: number) => void
  /** Click on the focused row. */
  onActivate: (i: number) => void
}

/**
 * The list as a 3D drum: every row sits on the outside of a cylinder that
 * turns on the X axis, and a selector (the lens) sits on the focused row.
 *
 * Near the ends the drum holds still and the selector travels instead: the
 * list starts filled from the top with the selector on the first row, the
 * selector moves down until it reaches the middle, and from there the drum
 * turns under it. The same in reverse at the bottom. Pulling past either end
 * gives a little, then snaps back.
 *
 * Motion runs outside React. `target` is the focus position the drum is
 * headed for (wheel, drag and keys move it), `pos` eases toward it each frame,
 * and every row's transform/opacity is written straight to the DOM. React only
 * hears about it when the rounded target lands on a new row.
 */
export default function Drum(p: Props) {
  const viewRef = useRef<HTMLDivElement>(null)
  const rowsRef = useRef<(HTMLDivElement | null)[]>([])
  const lensRef = useRef<HTMLDivElement>(null)
  const cb = useRef({ onIndexChange: p.onIndexChange, onActivate: p.onActivate })
  const s = useRef({
    pos: 0,
    target: 0,
    /** Extra turn for the entrance spin; eases to 0. */
    spin: 0,
    /** Rows that fit above the middle: the drum holds still until the focus passes this many. */
    above: 3,
    emitted: p.index,
    count: p.count,
    raf: 0,
    last: 0,
    stiffness: STIFFNESS,
    R: 300,
    theta: ROW_H / 300,
    reduced: false,
    dragging: false,
    moved: false,
    startY: 0,
    startTarget: 0,
    downIndex: -1,
    samples: [] as { t: number; y: number }[],
    snapTimer: 0,
    lastWheel: -1e9,
    /** Direction of a wheel gesture that has hit an end; the rest of it is ignored. */
    wheelLock: 0,
  }).current

  useLayoutEffect(() => {
    cb.current = { onIndexChange: p.onIndexChange, onActivate: p.onActivate }
  })

  const clampI = (x: number) => Math.max(0, Math.min(s.count - 1, x))
  // The drum may be pulled a little past either end before snapping back.
  const soft = (x: number) => Math.max(-0.4, Math.min(s.count - 0.6, x))
  const indexOf = (x: number) => clampI(Math.round(x))

  /** Seat an element on the drum `d` rows from the middle. */
  function place(el: HTMLElement, d: number) {
    const a = d * s.theta
    const c = Math.cos(a)
    el.style.transform = `translate3d(0,${(s.R * Math.sin(a)).toFixed(2)}px,${(s.R * (c - 1)).toFixed(2)}px) rotateX(${(-a).toFixed(4)}rad)`
    return c
  }

  function layout() {
    const { pos, count, above } = s
    const last = count - 1
    // Where the drum faces: it follows the focus, but holds still while the
    // focus is within `above` rows of either end. Pulling past an end still
    // moves the list.
    const view =
      Math.min(Math.max(above, last - above), Math.max(above, pos)) +
      Math.min(0, pos) +
      Math.max(0, pos - last) +
      s.spin
    const rows = rowsRef.current
    for (let i = 0; i < count; i++) {
      const el = rows[i]
      if (!el) continue
      const d = i - view
      if (Math.abs(d * s.theta) > MAX_ANGLE) {
        if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden'
        continue
      }
      el.style.visibility = 'visible'
      const c = place(el, d)
      // --f is 1 on the focused row, easing to 0 one row away.
      const f = Math.max(0, 1 - Math.abs(i - pos))
      el.style.opacity = (c * c + (1 - c * c) * f).toFixed(3)
      el.style.setProperty('--f', f.toFixed(3))
    }
    // The selector rides on the focused row.
    if (lensRef.current) place(lensRef.current, Math.min(last, Math.max(0, pos)) - view)
  }

  /** How many rows fit above the middle before reaching the top fade. */
  function fitAbove(h: number) {
    const limit = h * 0.4 // half the drum, less the 10% fade at the top
    const P = s.R * PERSPECTIVE
    let n = 0
    for (;;) {
      const a = (n + 1.5) * s.theta // top edge of the next row up
      if (a > MAX_ANGLE) break
      // Height above the middle once foreshortened by the perspective.
      const y = (s.R * Math.sin(a) * P) / (P + s.R * (1 - Math.cos(a)))
      if (y > limit) break
      n++
    }
    return n
  }

  function tick(now: number) {
    const dt = s.last ? Math.min(0.05, (now - s.last) / 1000) : 0
    s.last = now
    const k = s.reduced ? 1 : 1 - Math.exp(-dt * (s.dragging ? DRAG_STIFFNESS : s.stiffness))
    s.pos += (s.target - s.pos) * k
    s.spin -= s.spin * k
    if (!s.dragging && Math.abs(s.target - s.pos) < 0.0005) s.pos = s.target
    if (Math.abs(s.spin) < 0.0005) s.spin = 0
    layout()
    if (s.dragging || s.pos !== s.target || s.spin !== 0) {
      s.raf = requestAnimationFrame(tick)
    } else {
      s.raf = 0
      s.last = 0
      s.stiffness = STIFFNESS
    }
  }

  function kick() {
    if (!s.raf) s.raf = requestAnimationFrame(tick)
  }

  function emit() {
    const i = indexOf(s.target)
    if (i !== s.emitted) {
      s.emitted = i
      cb.current.onIndexChange(i)
    }
  }

  function goTo(i: number) {
    s.target = clampI(i)
    emit()
    kick()
  }

  /** Settle on the nearest whole row. */
  function snap(x: number) {
    s.target = clampI(Math.round(x))
    emit()
    kick()
  }

  // A new list (first mount or a section): seat the drum on `index` with a
  // short spin into place.
  useLayoutEffect(() => {
    s.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    s.count = p.count
    s.emitted = p.index
    s.target = p.index
    s.pos = p.index
    s.spin = s.reduced ? 0 : 2.5
    s.stiffness = 6
    layout()
    kick()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.listKey])

  // Focus moved from outside (keys, the index rail, "now playing").
  useEffect(() => {
    if (p.index !== s.emitted) {
      s.emitted = p.index
      goTo(p.index)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.index])

  // Size the cylinder to the viewport.
  useEffect(() => {
    const view = viewRef.current!
    const ro = new ResizeObserver(() => {
      s.R = Math.max(170, view.clientHeight * RADIUS)
      s.theta = ROW_H / s.R
      s.above = fitAbove(view.clientHeight)
      view.style.perspective = `${Math.round(s.R * PERSPECTIVE)}px`
      layout()
    })
    ro.observe(view)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Wheel needs a non-passive listener to stop the page from scrolling.
  useEffect(() => {
    const view = viewRef.current!
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      e.preventDefault()
      let dy = e.deltaY
      if (e.deltaMode === 1) dy *= 18
      else if (e.deltaMode === 2) dy *= view.clientHeight
      // A pause between events starts a new gesture.
      if (e.timeStamp - s.lastWheel > 200) s.wheelLock = 0
      s.lastWheel = e.timeStamp
      // Once a gesture runs into an end, ignore the rest of it: a trackpad
      // keeps sending momentum events for a second or two after you let go,
      // which would otherwise hold the list stretched past the end.
      const dir = Math.sign(dy)
      if (dir === s.wheelLock) return
      s.wheelLock = 0
      const next = s.target + (dy / ROW_H) * 0.55
      const past = next < 0 || next > s.count - 1
      s.target = soft(next)
      emit()
      kick()
      window.clearTimeout(s.snapTimer)
      if (past) s.wheelLock = dir
      // Past an end: a brief give, then straight back.
      s.snapTimer = window.setTimeout(() => snap(s.target), past ? 60 : WHEEL_SNAP)
    }
    view.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      view.removeEventListener('wheel', onWheel)
      window.clearTimeout(s.snapTimer)
      cancelAnimationFrame(s.raf)
      s.raf = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const row = (e.target as HTMLElement).closest<HTMLElement>('[data-i]')
    s.downIndex = row ? Number(row.dataset.i) : -1
    s.dragging = true
    s.moved = false
    s.startY = e.clientY
    s.startTarget = s.target
    s.samples = [{ t: e.timeStamp, y: e.clientY }]
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!s.dragging) return
    const dy = e.clientY - s.startY
    if (!s.moved && Math.abs(dy) < 5) return
    if (!s.moved) {
      s.moved = true
      kick()
    }
    s.target = soft(s.startTarget - dy / ROW_H)
    s.samples.push({ t: e.timeStamp, y: e.clientY })
    while (s.samples.length > 2 && e.timeStamp - s.samples[0].t > 90) s.samples.shift()
    emit()
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!s.dragging) return
    s.dragging = false
    if (!s.moved) {
      const i = s.downIndex
      if (i >= 0 && e.type === 'pointerup') {
        if (i === s.emitted) cb.current.onActivate(i)
        else goTo(i)
      }
      return
    }
    // Fling: carry the release velocity a little further, then snap.
    const a = s.samples[0]
    const b = s.samples[s.samples.length - 1]
    const v = (b.y - a.y) / Math.max(16, b.t - a.t) // px per ms
    snap(s.target - (v / ROW_H) * 240)
  }

  return (
    <div
      ref={viewRef}
      className="cw-drum"
      role="listbox"
      aria-label={p.label}
      tabIndex={0}
      aria-activedescendant={p.count ? p.rowId(p.index) : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div ref={lensRef} className="cw-lens" aria-hidden="true" />
      {Array.from({ length: p.count }, (_, i) => (
        <div
          key={p.rowKey(i)}
          id={p.rowId(i)}
          role="option"
          aria-selected={i === p.index}
          data-i={i}
          className="cw-row"
          ref={(el) => {
            rowsRef.current[i] = el
          }}
        >
          {p.renderRow(i)}
        </div>
      ))}
    </div>
  )
}
