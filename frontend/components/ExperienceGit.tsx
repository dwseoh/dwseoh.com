import { type Experience, trackColor } from './tracks'

const MONO =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'

// Stable 6-char pseudo-hash derived from the org name, for git-log flavor.
function hash(seed: string) {
  let h = 5381
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h + seed.charCodeAt(i)) >>> 0
  return h.toString(16).padStart(6, '0').slice(0, 6)
}

// Short branch ref like `feat/cerebras` from the org name.
function branchRef(org: string) {
  const slug = org
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .split('-')
    .slice(0, 2)
    .join('-')
  return slug
}

/**
 * Experiences rendered as a `git log --graph --oneline` style history: a single
 * "main" rail running top-to-bottom with each experience as a commit node,
 * colored by track, tagged with a branch ref and a pseudo-hash. Reads as code
 * for a SWE audience.
 */
export default function ExperienceGit({ items }: { items: Experience[] }) {
  return (
    <div
      style={{
        border: '1px solid var(--n-border)',
        borderRadius: '12px',
        background: 'var(--n-bg)',
        padding: '16px 18px',
        overflow: 'hidden',
      }}
    >
      {/* prompt header */}
      <div style={{ fontFamily: MONO, fontSize: '0.75rem', color: 'var(--n-light)', marginBottom: '14px' }}>
        <span style={{ color: 'var(--n-accent)' }}>$</span> git log --graph --oneline{' '}
        <span style={{ color: 'var(--n-secondary)' }}>main</span>
      </div>

      <div style={{ position: 'relative', paddingLeft: '22px' }}>
        {/* the "main" rail */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: '5px',
            top: '6px',
            bottom: '10px',
            width: '2px',
            background: 'var(--n-border)',
          }}
        />

        {items.map((e) => {
          const color = trackColor(e.track)
          return (
            <div key={`${e.org}-${e.role}`} style={{ position: 'relative', paddingBottom: '18px' }}>
              {/* commit node */}
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: '-22px',
                  top: '4px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'var(--n-bg)',
                  border: `2.5px solid ${color}`,
                  boxShadow: '0 0 0 3px var(--n-bg)',
                }}
              />

              {/* commit line: hash · (branch) · role @ org · period */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontFamily: MONO, fontSize: '0.75rem', color: 'var(--n-light)' }}>{hash(e.org)}</span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: '0.6875rem',
                    color,
                    background: `${color}14`,
                    border: `1px solid ${color}40`,
                    borderRadius: '5px',
                    padding: '1px 6px',
                  }}
                >
                  {branchRef(e.org)}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {e.href ? (
                    <a href={e.href} target="_blank" rel="noopener noreferrer" className="inline-link" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid var(--n-border)' }}>
                      {e.role} @ {e.org}
                    </a>
                  ) : (
                    <>
                      {e.role} @ {e.org}
                    </>
                  )}
                </span>
                <span style={{ fontFamily: MONO, fontSize: '0.6875rem', color: 'var(--n-light)', marginLeft: 'auto' }}>
                  {e.period}
                </span>
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
