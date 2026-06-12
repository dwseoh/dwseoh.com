'use client'

import { useEffect, useRef, useState } from 'react'

interface Particle {
  id: number
  note: string
  left: number // px from the word start (kept small so notes rise off the text)
  dx: number // horizontal drift (px)
  rot: number // rotation (deg)
  size: number // em
  dur: number // ms
  delay: number // ms
}

// Notes only emit from the first part of the word so shorter words don't
// look like they're spraying notes from empty space on the right.
const EMIT_WIDTH = 62

const NOTES = ['♪', '♫', '♬', '♩']

/**
 * Cycles through words inline (outgoing slides down + fades, incoming drops in
 * from above). Each switch also emits a few floating music-note particles. A
 * hidden sizer reserves the width of the longest word so text never reflows.
 */
export default function RotatingText({
  words,
  intervalMs = 1900,
}: {
  words: string[]
  intervalMs?: number
}) {
  const [index, setIndex] = useState(0)
  const [prev, setPrev] = useState(-1)
  const [tick, setTick] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const idRef = useRef(0)

  useEffect(() => {
    if (words.length <= 1) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // still rotate words, just skip the particle stream
      const id = setInterval(() => {
        setIndex((i) => {
          setPrev(i)
          return (i + 1) % words.length
        })
        setTick((t) => t + 1)
      }, intervalMs)
      return () => clearInterval(id)
    }

    const spawn = (count: number) => {
      const batch: Particle[] = Array.from({ length: count }, () => ({
        id: idRef.current++,
        note: NOTES[Math.floor(Math.random() * NOTES.length)],
        left: 2 + Math.random() * EMIT_WIDTH,
        dx: Math.random() * 52 - 26,
        rot: Math.random() * 80 - 40,
        size: 0.55 + Math.random() * 0.45,
        dur: 1900 + Math.random() * 1000,
        delay: Math.random() * 90,
      }))
      setParticles((p) => [...p, ...batch])
      const maxLife = Math.max(...batch.map((b) => b.dur + b.delay)) + 120
      window.setTimeout(() => {
        setParticles((p) => p.filter((x) => !batch.some((b) => b.id === x.id)))
      }, maxLife)
    }

    // steady stream
    const emit = setInterval(() => spawn(1), 300)

    // rotate words + a little burst on each switch
    const rotate = setInterval(() => {
      setIndex((i) => {
        setPrev(i)
        return (i + 1) % words.length
      })
      setTick((t) => t + 1)
      spawn(2)
    }, intervalMs)

    return () => {
      clearInterval(emit)
      clearInterval(rotate)
    }
  }, [words.length, intervalMs])

  const widest = words.reduce((a, b) => (b.length > a.length ? b : a), '')

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        whiteSpace: 'nowrap',
        verticalAlign: 'bottom',
        textAlign: 'left',
      }}
    >
      {/* hidden sizer — reserves width + baseline */}
      <span aria-hidden style={{ visibility: 'hidden', fontWeight: 600 }}>
        {widest}
      </span>

      {words.map((word, i) => {
        const isActive = i === index
        const isPrev = i === prev && prev !== index
        let animation = 'none'
        let opacity = 0
        if (isActive) {
          animation = 'roleIn 0.5s ease both'
          opacity = 1
        } else if (isPrev) {
          animation = 'roleOut 0.5s ease both'
        }
        return (
          <span
            key={isActive ? `in-${tick}` : isPrev ? `out-${tick}` : `idle-${i}`}
            aria-hidden={!isActive}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              whiteSpace: 'nowrap',
              fontWeight: 600,
              color: 'var(--n-accent)',
              opacity,
              animation,
            }}
          >
            {word}
          </span>
        )
      })}

      {/* music-note particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          aria-hidden
          style={{
            position: 'absolute',
            left: `${p.left}px`,
            top: '-2px',
            fontSize: `${p.size}em`,
            color: 'var(--n-accent)',
            pointerEvents: 'none',
            willChange: 'transform, opacity',
            animation: `musicFloat ${p.dur}ms cubic-bezier(0.22, 0.61, 0.36, 1) both`,
            animationDelay: `${p.delay}ms`,
            ['--dx' as string]: `${p.dx}px`,
            ['--rot' as string]: `${p.rot}deg`,
          } as React.CSSProperties}
        >
          {p.note}
        </span>
      ))}
    </span>
  )
}
