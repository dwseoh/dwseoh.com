'use client'

import { useEffect, useState } from 'react'

/**
 * Cycles through an array of words inline, swapping every `intervalMs`
 * with a fade + slide transition. Used for the "I am a [role]" line.
 */
export default function RotatingText({
  words,
  intervalMs = 1600,
}: {
  words: string[]
  intervalMs?: number
}) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (words.length <= 1) return
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length)
        setVisible(true)
      }, 250)
    }, intervalMs)
    return () => clearInterval(id)
  }, [words.length, intervalMs])

  return (
    <span
      style={{
        display: 'inline-block',
        fontWeight: 600,
        color: 'var(--n-accent)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-6px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
    >
      {words[index]}
    </span>
  )
}
