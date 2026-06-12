'use client'

import { useEffect, useRef, useState } from 'react'
import type { VerovioToolkit } from 'verovio/esm'
import type { PlayerElement } from 'html-midi-player'

/**
 * Note-level synced score player. Renders a MusicXML score to SVG with Verovio
 * (each note carries a stable @id), plays the score's metronomic MIDI through a
 * soundfont, and lights up the note heads that are sounding at the current
 * playback time. Highlighting is exact because both the SVG and the MIDI come
 * from the same Verovio engraving — no hand-authored alignment needed.
 *
 * Everything heavy (the multi-MB Verovio WASM, the MIDI player web component and
 * its @magenta/music + Tone.js deps) is dynamically imported inside an effect so
 * it loads only on the detail route and never runs during SSR. The <midi-player>
 * element is created imperatively to avoid SSR markup and custom-element JSX
 * typing.
 */
export default function ScorePlayer({ musicXml }: { musicXml: string }) {
  const scoreRef = useRef<HTMLDivElement>(null)
  const playerHostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<PlayerElement | null>(null)
  const toolkitRef = useRef<VerovioToolkit | null>(null)
  const rafRef = useRef<number | null>(null)
  const highlightedRef = useRef<string[]>([])

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false

    const clearHighlight = () => {
      const host = scoreRef.current
      if (host) {
        for (const id of highlightedRef.current) {
          host.querySelector(`#${CSS.escape(id)}`)?.classList.remove('playing')
        }
      }
      highlightedRef.current = []
    }

    const tick = () => {
      const tk = toolkitRef.current
      const player = playerRef.current
      const host = scoreRef.current
      if (tk && player && host) {
        const ids = tk.getElementsAtTime(player.currentTime * 1000).notes ?? []
        if (ids.join() !== highlightedRef.current.join()) {
          clearHighlight()
          let firstEl: Element | null = null
          for (const id of ids) {
            const el = host.querySelector(`#${CSS.escape(id)}`)
            if (el) {
              el.classList.add('playing')
              firstEl ??= el
            }
          }
          highlightedRef.current = ids
          const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          if (firstEl && !reduceMotion) {
            firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    const startHighlightLoop = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick)
    }
    const stopHighlightLoop = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      clearHighlight()
    }

    // Click a note head to seek the player to that note's onset.
    const onScoreClick = (e: MouseEvent) => {
      const tk = toolkitRef.current
      const player = playerRef.current
      if (!tk || !player) return
      const note = (e.target as Element)?.closest('.note')
      if (!note?.id) return
      const ms = tk.getTimeForElement(note.id)
      if (Number.isFinite(ms)) player.currentTime = ms / 1000
    }

    async function init() {
      try {
        // Dynamic, client-only imports — these touch window/document/customElements.
        const [{ default: createVerovioModule }, { VerovioToolkit }] = await Promise.all([
          import('verovio/wasm'),
          import('verovio/esm'),
        ])
        await import('html-midi-player') // registers the <midi-player> element

        const VerovioModule = await createVerovioModule()
        if (cancelled) return

        const tk = new VerovioToolkit(VerovioModule)
        tk.setOptions({ scale: 40, adjustPageHeight: true, breaks: 'auto', footer: 'none', header: 'none' })

        const xml = await (await fetch(musicXml)).text()
        if (cancelled) return
        if (!tk.loadData(xml)) throw new Error('Verovio could not parse the score')
        toolkitRef.current = tk

        // Render every page into one continuous block.
        const host = scoreRef.current
        if (host) {
          let svg = ''
          for (let p = 1; p <= tk.getPageCount(); p++) svg += tk.renderToSVG(p)
          host.innerHTML = svg
          host.addEventListener('click', onScoreClick)
        }

        // Build the player from the score's MIDI and mount it.
        const player = document.createElement('midi-player') as PlayerElement
        player.setAttribute('sound-font', '')
        player.style.width = '100%'
        player.src = `data:audio/midi;base64,${tk.renderToMIDI()}`
        player.addEventListener('start', startHighlightLoop)
        player.addEventListener('stop', stopHighlightLoop)
        playerHostRef.current?.replaceChildren(player)
        playerRef.current = player

        if (!cancelled) setStatus('ready')
      } catch (err) {
        console.error('[ScorePlayer]', err)
        if (!cancelled) setStatus('error')
      }
    }

    init()

    return () => {
      cancelled = true
      stopHighlightLoop()
      scoreRef.current?.removeEventListener('click', onScoreClick)
      const player = playerRef.current
      if (player) {
        player.removeEventListener('start', startHighlightLoop)
        player.removeEventListener('stop', stopHighlightLoop)
        player.stop()
      }
      playerRef.current = null
    }
    // musicXml is stable per detail page; re-init only if it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicXml])

  return (
    <div className="score-player">
      {status === 'loading' && (
        <p style={{ color: 'var(--n-secondary)', fontSize: '0.875rem' }}>Loading interactive score…</p>
      )}
      {status === 'error' && (
        <p style={{ color: 'var(--n-secondary)', fontSize: '0.875rem' }}>
          The interactive score could not be loaded.
        </p>
      )}

      {/* Verovio injects the score SVG here. */}
      <div ref={scoreRef} className="score" aria-label="Musical score" />

      {/* html-midi-player <midi-player> is mounted here imperatively once ready. */}
      <div ref={playerHostRef} />
    </div>
  )
}
