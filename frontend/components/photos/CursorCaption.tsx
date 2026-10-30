'use client'

import { useEffect, useRef } from 'react'

/**
 * Caption + date that trail the pointer over the grid (fine pointers only).
 * Reads `data-caption` / `data-date` from the hovered tile, so it's fully
 * self-contained: delete the one <CursorCaption /> line in PhotoGallery and
 * nothing else changes. Position is written straight to the DOM in a rAF, so
 * moving the mouse never re-renders React. The real cursor is never hidden.
 */
export default function CursorCaption({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const area = target.current
    const el = ref.current
    if (!area || !el) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const title = el.querySelector('b')!
    const sub = el.querySelector('span')!
    let frame = 0
    let x = 0
    let y = 0

    const hide = () => el.classList.remove('is-on')
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return hide()
      const tile = (e.target as HTMLElement).closest<HTMLElement>('[data-caption]')
      if (!tile) return hide()
      if (title.textContent !== tile.dataset.caption) {
        title.textContent = tile.dataset.caption ?? ''
        sub.textContent = tile.dataset.date ?? ''
      }
      x = e.clientX
      y = e.clientY
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0
          // Flip to the left of the pointer near the right edge so it never clips.
          const flip = x + 22 + el.offsetWidth > window.innerWidth - 12
          el.classList.toggle('is-flipped', flip)
          el.style.transform = `translate(${flip ? x - 22 - el.offsetWidth : x + 22}px, ${y - 8}px)`
          el.classList.add('is-on')
        })
      }
    }

    area.addEventListener('pointermove', onMove)
    area.addEventListener('pointerleave', hide)
    // Any click (opening the lightbox, switching tabs or density) swaps what's
    // under the pointer without a move event: hide until the next move.
    window.addEventListener('pointerdown', hide, true)
    window.addEventListener('scroll', hide, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      area.removeEventListener('pointermove', onMove)
      area.removeEventListener('pointerleave', hide)
      window.removeEventListener('pointerdown', hide, true)
      window.removeEventListener('scroll', hide)
    }
  }, [target])

  return (
    <div ref={ref} className="ph-cursor" aria-hidden>
      <b />
      <span />
    </div>
  )
}
