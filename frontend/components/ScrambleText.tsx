'use client'

import { useEffect, useRef, useState } from 'react'

const CHARS = '!<>-_\\/[]{}—=+*^?#abcdefghijklmnopqrstuvwxyz0123456789'

/**
 * "Decode" effect with hover control:
 *  - On load: letters scramble then resolve left-to-right into the real text.
 *  - On hover: the text re-scrambles and STAYS scrambled (in a subtler color).
 *  - On unhover: it decodes back to the real text.
 * A hidden sizer reserves the final width so the heading never jiggles.
 */
export default function ScrambleText({
  text,
  duration = 1100,
}: {
  text: string
  duration?: number
}) {
  const [display, setDisplay] = useState(text)
  const [hovered, setHovered] = useState(false)
  const progress = useRef(0) // 0 = fully scrambled, 1 = fully resolved

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(text)
      return
    }
    const target = hovered ? 0 : 1
    const step = 1000 / 30 / duration // progress per frame to span `duration`
    let raf = 0

    const tick = () => {
      let p = progress.current
      if (p < target) p = Math.min(target, p + step)
      else if (p > target) p = Math.max(target, p - step)
      progress.current = p

      const revealed = Math.floor(p * text.length)
      let out = ''
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') out += ' '
        else if (i < revealed) out += text[i]
        else out += CHARS[Math.floor(Math.random() * CHARS.length)]
      }
      setDisplay(out)

      // keep animating while not settled, or continuously while held scrambled
      if (p !== target || target === 0) raf = requestAnimationFrame(tick)
      else setDisplay(text)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [hovered, text, duration])

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'inline-block',
        whiteSpace: 'pre',
        cursor: 'default',
        color: hovered ? 'var(--n-scramble)' : 'inherit',
        transition: 'color 0.25s ease',
      }}
    >
      <span aria-hidden style={{ visibility: 'hidden' }}>{text}</span>
      <span aria-label={text} style={{ position: 'absolute', left: 0, top: 0, whiteSpace: 'pre' }}>
        {display}
      </span>
    </span>
  )
}
