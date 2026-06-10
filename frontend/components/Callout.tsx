/**
 * Notion-style callout: a soft rounded box with an emoji and content.
 * Usage: <Callout emoji="💡">Some highlighted note</Callout>
 */
export default function Callout({
  emoji = '💡',
  children,
}: {
  emoji?: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        background: 'var(--n-callout-bg)',
        border: '1px solid var(--n-border)',
        borderRadius: '8px',
        padding: '14px 16px',
        margin: '1rem 0',
      }}
    >
      <span style={{ fontSize: '1.1rem', lineHeight: 1.4, flexShrink: 0 }}>{emoji}</span>
      <div style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--n-text)' }}>
        {children}
      </div>
    </div>
  )
}
