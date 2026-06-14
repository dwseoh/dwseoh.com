'use client'

import { useState } from 'react'
import { EXPERIENCES, type Experience } from './experienceData'

/* Experience — a connected logo timeline. Each role is a node on a single rail
   running top to bottom; clicking a row expands its blurb + skills. One accent
   (the site blue) marks the current role. Designed to sit inline as a Notion
   block at the page column width. */

function PinMark() {
  // Fallback "logo" for Pinpoint — an on-theme location pin.
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-6.04 7-11a7 7 0 1 0-14 0c0 4.96 7 11 7 11Z"
        fill="var(--n-accent)"
        opacity="0.14"
      />
      <path
        d="M12 21s7-6.04 7-11a7 7 0 1 0-14 0c0 4.96 7 11 7 11Z"
        stroke="var(--n-accent)"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.4" fill="var(--n-accent)" />
    </svg>
  )
}

function Chevron() {
  return (
    <svg className="xp-chev-svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function OutIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 4h6v6M20 4 11 13M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </svg>
  )
}

function Row({ e, open, onToggle, last }: {
  e: Experience
  open: boolean
  onToggle: () => void
  last: boolean
}) {
  return (
    <li className={`xp-item${last ? ' xp-last' : ''}`}>
      <button
        type="button"
        className="xp-head"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className={`xp-logo${e.present ? ' xp-logo-live' : ''}`}>
          {e.logo ? (
            // plain img: these are small static brand marks, not layout-driving art
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.logo} alt={`${e.org} logo`} loading="lazy" />
          ) : (
            <PinMark />
          )}
        </span>

        <span className="xp-main">
          <span className="xp-toprow">
            <span className="xp-role">{e.role}</span>
            <span className="xp-period">{e.period}</span>
          </span>
          <span className="xp-subrow">
            <span className="xp-org">{e.org}</span>
            {e.present ? (
              <span className="xp-now"><span className="xp-dot" />Present</span>
            ) : (
              <span className="xp-dur">{e.duration}</span>
            )}
          </span>
        </span>

        <span className={`xp-chev${open ? ' is-open' : ''}`}><Chevron /></span>
      </button>

      <div className="xp-body" data-open={open}>
        <div className="xp-body-inner">
          <p className="xp-blurb">{e.blurb}</p>
          <div className="xp-skills">
            {e.skills.map((s) => (
              <span key={s} className="xp-skill">{s}</span>
            ))}
          </div>
          <div className="xp-meta">
            <span>{e.location}</span>
            <span className="xp-meta-dot">·</span>
            <span>{e.type}</span>
            {e.href && (
              <a
                className="xp-visit"
                href={e.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(ev) => ev.stopPropagation()}
              >
                Visit <OutIcon />
              </a>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

export default function Experience() {
  // The current role starts expanded; rows toggle independently.
  const [open, setOpen] = useState<Record<string, boolean>>(
    () => Object.fromEntries(EXPERIENCES.filter((e) => e.present).map((e) => [e.id, true])),
  )

  return (
    <div className="xp">
      <ol className="xp-list">
        {EXPERIENCES.map((e, i) => (
          <Row
            key={e.id}
            e={e}
            open={!!open[e.id]}
            last={i === EXPERIENCES.length - 1}
            onToggle={() => setOpen((s) => ({ ...s, [e.id]: !s[e.id] }))}
          />
        ))}
      </ol>
    </div>
  )
}
