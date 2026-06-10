/**
 * Notion-style inline "mention" link: a small site favicon + underlined text,
 * sitting inline within a paragraph.
 *
 * HOW TO ADD ONE (for future edits):
 *   1. In messages/en.json, wrap the words in a custom tag, e.g.
 *        "...working at <cerebras>Cerebras Systems</cerebras> as..."
 *   2. In app/[locale]/page.tsx, map that tag inside t.rich():
 *        cerebras: (chunks) => <InlineLink href="https://cerebras.net">{chunks}</InlineLink>
 *   The favicon is fetched automatically from the href's domain.
 */
export default function InlineLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const isExternal = href.startsWith('http')
  let favicon = ''
  if (isExternal) {
    try {
      const domain = new URL(href).hostname
      favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      favicon = ''
    }
  }

  return (
    <a
      className="inline-link"
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        textDecoration: 'none',
        color: 'inherit',
        borderBottom: '1px solid var(--n-light)',
        paddingBottom: '1px',
        margin: '0 1px',
        padding: '0 2px',
        whiteSpace: 'nowrap',
      }}
    >
      {favicon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={favicon}
          alt=""
          width={15}
          height={15}
          style={{ display: 'inline-block', borderRadius: '3px', verticalAlign: 'middle' }}
        />
      )}
      <span style={{ fontWeight: 500 }}>{children}</span>
    </a>
  )
}
