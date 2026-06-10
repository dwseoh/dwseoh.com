'use client'

import { useEffect, useState } from 'react'

/**
 * Cycles through words inline. The outgoing word slides down + fades out while
 * the incoming word fades in from above. A hidden sizer reserves the width of
 * the longest word so surrounding text never reflows.
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

  useEffect(() => {
    if (words.length <= 1) return
    const id = setInterval(() => {
      setIndex((i) => {
        setPrev(i)
        return (i + 1) % words.length
      })
      setTick((t) => t + 1)
    }, intervalMs)
    return () => clearInterval(id)
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
    </span>
  )
}
