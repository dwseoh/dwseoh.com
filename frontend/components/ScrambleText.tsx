'use client'

import { useEffect, useRef, useState } from 'react'
import { randomGlyph } from './scramble'

// Re-randomize each scrambled glyph only ~30% of frames so it reads as a calm
// settle rather than a frantic flicker (especially important for Hangul).
const CHURN = 0.3

/**
 * "Decode" effect with hover control:
 *  - On mount AND whenever `text` changes (e.g. a language switch): letters
 *    scramble then resolve left-to-right into the text.
 *  - On hover: re-scrambles and holds (in a subtler color); resolves on leave.
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
  const prevText = useRef(text)
  const glyphs = useRef<string[]>([])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(text)
      return
    }
    // text changed (language switch) → decode again from scratch
    if (prevText.current !== text) {
      prevText.current = text
      progress.current = 0
      glyphs.current = []
    }

    const target = hovered ? 0 : 1
    const step = 1000 / 30 / duration
    let raf = 0

    const tick = () => {
      let p = progress.current
      if (p < target) p = Math.min(target, p + step)
      else if (p > target) p = Math.max(target, p - step)
      progress.current = p

      const revealed = Math.floor(p * text.length)
      let out = ''
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        if (ch === ' ') out += ' '
        else if (i < revealed) out += ch
        else {
          if (!glyphs.current[i] || Math.random() < CHURN) glyphs.current[i] = randomGlyph(ch)
          out += glyphs.current[i]
        }
      }
      setDisplay(out)

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
