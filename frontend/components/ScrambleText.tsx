'use client'

import { useEffect, useState } from 'react'

const CHARS = '!<>-_\\/[]{}—=+*^?#abcdefghijklmnopqrstuvwxyz0123456789'

/**
 * "Decode" effect: on mount the letters scramble like a terminal, then resolve
 * left-to-right into the real text. A hidden sizer reserves the final width so
 * the heading doesn't jiggle while scrambling.
 */
export default function ScrambleText({
  text,
  duration = 1100,
}: {
  text: string
  duration?: number
}) {
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(text)
      return
    }
    const totalFrames = Math.max(1, Math.round(duration / 33))
    let frame = 0
    const id = setInterval(() => {
      frame++
      const revealed = Math.floor((frame / totalFrames) * text.length)
      let out = ''
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') out += ' '
        else if (i < revealed) out += text[i]
        else out += CHARS[Math.floor(Math.random() * CHARS.length)]
      }
      setDisplay(out)
      if (frame >= totalFrames) {
        setDisplay(text)
        clearInterval(id)
      }
    }, 33)
    return () => clearInterval(id)
  }, [text, duration])

  return (
    <span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'pre' }}>
      <span aria-hidden style={{ visibility: 'hidden' }}>{text}</span>
      <span aria-label={text} style={{ position: 'absolute', left: 0, top: 0, whiteSpace: 'pre' }}>
        {display}
      </span>
    </span>
  )
}
