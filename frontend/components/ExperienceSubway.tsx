import { type Experience, trackColor, TRACK_LABELS } from './tracks'

/**
 * Experiences rendered as a vertical metro/subway line: a colored route running
 * top-to-bottom with each experience as a station stop. Each segment is tinted
 * by the track of the station below it, and stations are interchange-style rings
 * recolored when the line changes track. A small legend names the lines.
 */
export default function ExperienceSubway({ items }: { items: Experience[] }) {
  // Which tracks actually appear, in first-seen order, for the legend.
  const tracks: string[] = []
  for (const e of items) if (e.track && !tracks.includes(e.track)) tracks.push(e.track)

  return (
    <div
      style={{
        border: '1px solid var(--n-border)',
        borderRadius: '12px',
        background: 'var(--n-bg)',
        padding: '16px 18px',
      }}
    >
      {/* legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
        {tracks.map((tr) => (
          <span key={tr} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '18px', height: '4px', borderRadius: '2px', background: trackColor(tr) }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--n-secondary)' }}>
              {TRACK_LABELS[tr] ?? tr} Line
            </span>
          </span>
        ))}
      </div>

      <div style={{ position: 'relative', paddingLeft: '30px' }}>
        {items.map((e, i) => {
          const color = trackColor(e.track)
          const prev = items[i - 1]
          const isInterchange = i > 0 && prev?.track !== e.track
          const isLast = i === items.length - 1
          return (
            <div key={`${e.org}-${e.role}`} style={{ position: 'relative', paddingBottom: isLast ? 0 : '22px' }}>
              {/* line segment running down to the next station */}
              {!isLast && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: '-23px',
                    top: '10px',
                    bottom: '-2px',
                    width: '4px',
                    borderRadius: '2px',
                    // blend from this station's color into the next station's color
                    background: `linear-gradient(${color}, ${trackColor(items[i + 1]?.track)})`,
                  }}
                />
              )}

              {/* station marker — interchange stations get a larger double ring */}
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: isInterchange ? '-30px' : '-28px',
                  top: '2px',
                  width: isInterchange ? '18px' : '14px',
                  height: isInterchange ? '18px' : '14px',
                  borderRadius: '50%',
                  background: 'var(--n-bg)',
                  border: `${isInterchange ? 4 : 3}px solid ${color}`,
                  boxSizing: 'border-box',
                  boxShadow: '0 0 0 3px var(--n-bg)',
                }}
              />

              {/* station label */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                  {e.href ? (
                    <a href={e.href} target="_blank" rel="noopener noreferrer" className="inline-link" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid var(--n-border)' }}>
                      {e.org}
                    </a>
                  ) : (
                    e.org
                  )}
                </span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color, background: `${color}14`, borderRadius: '5px', padding: '1px 7px' }}>
                  {e.role}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--n-light)', marginLeft: 'auto' }}>{e.period}</span>
              </div>

              {e.desc && (
                <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--n-secondary)', lineHeight: 1.55 }}>
                  {e.desc}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
