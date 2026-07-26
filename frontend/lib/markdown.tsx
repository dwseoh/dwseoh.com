import React from 'react'
import Callout from '@/components/Callout'

/**
 * A small, dependency-free Markdown → React renderer. It supports the subset a
 * blog/newsletter actually uses:
 *
 *   Block:  # headings, paragraphs, - / 1. lists, > quotes, ``` code fences,
 *           --- rules, | pipe | tables |, image-only lines, and GitHub-style
 *           > [!NOTE] callouts.
 *   Inline: **bold**, *italic* / _italic_, `code`, ~~strike~~, [links](url),
 *           and ![images](src).
 *
 * It is intentionally not spec-complete CommonMark. It is predictable, easy to
 * read, and covers everything the posts in content/blog/ need.
 */

// ---------------------------------------------------------------- inline ----

interface InlineRule {
  re: RegExp
  render: (m: RegExpExecArray, key: string) => React.ReactNode
}

// Ordered by precedence. `code` first so its contents are never re-parsed;
// bold before italic so `**` wins over `*` at the same position.
const INLINE_RULES: InlineRule[] = [
  {
    re: /`([^`]+)`/,
    render: (m, key) => (
      <code key={key} className="prose-code">
        {m[1]}
      </code>
    ),
  },
  {
    re: /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/,
    render: (m, key) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img key={key} src={m[2]} alt={m[1]} title={m[3] || undefined} className="prose-img-inline" />
    ),
  },
  {
    re: /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/,
    render: (m, key) => {
      const href = m[2]
      const external = /^https?:\/\//.test(href)
      return (
        <a
          key={key}
          className="prose-link"
          href={href}
          title={m[3] || undefined}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
        >
          {parseInline(m[1], key)}
        </a>
      )
    },
  },
  {
    re: /\*\*([^]+?)\*\*/,
    render: (m, key) => <strong key={key}>{parseInline(m[1], key)}</strong>,
  },
  {
    re: /__([^]+?)__/,
    render: (m, key) => <strong key={key}>{parseInline(m[1], key)}</strong>,
  },
  {
    re: /~~([^]+?)~~/,
    render: (m, key) => (
      <del key={key} style={{ color: 'var(--n-light)' }}>
        {parseInline(m[1], key)}
      </del>
    ),
  },
  {
    re: /\*([^]+?)\*/,
    render: (m, key) => <em key={key}>{parseInline(m[1], key)}</em>,
  },
  {
    re: /(?<![A-Za-z0-9])_([^]+?)_(?![A-Za-z0-9])/,
    render: (m, key) => <em key={key}>{parseInline(m[1], key)}</em>,
  },
]

/** Parse inline Markdown into React nodes by repeatedly consuming the earliest
 *  matching rule and recursing into the remainder. */
function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let rest = text
  let i = 0

  while (rest.length > 0) {
    let best: { rule: InlineRule; match: RegExpExecArray } | null = null
    for (const rule of INLINE_RULES) {
      const m = rule.re.exec(rest)
      if (m && (best === null || m.index < best.match.index)) {
        best = { rule, match: m }
        if (m.index === 0) break
      }
    }

    if (!best) {
      out.push(rest)
      break
    }

    const { rule, match } = best
    if (match.index > 0) out.push(rest.slice(0, match.index))
    out.push(rule.render(match, `${keyPrefix}-${i++}`))
    rest = rest.slice(match.index + match[0].length)
  }

  return out
}

// ----------------------------------------------------------------- block ----

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const CALLOUT_EMOJI: Record<string, string> = {
  NOTE: '📝',
  TIP: '💡',
  IMPORTANT: '📌',
  WARNING: '⚠️',
  CAUTION: '🚫',
}

/** Split the body into raw block strings, keeping fenced code intact. */
function splitBlocks(src: string): string[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const blocks: string[] = []
  let buf: string[] = []
  let inFence = false

  const flush = () => {
    if (buf.length) blocks.push(buf.join('\n'))
    buf = []
  }

  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      if (!inFence) {
        flush()
        inFence = true
        buf.push(line)
      } else {
        buf.push(line)
        blocks.push(buf.join('\n'))
        buf = []
        inFence = false
      }
      continue
    }
    if (inFence) {
      buf.push(line)
      continue
    }
    if (line.trim() === '') {
      flush()
    } else {
      buf.push(line)
    }
  }
  flush()
  return blocks
}

function renderBlock(block: string, key: string): React.ReactNode {
  const lines = block.split('\n')
  const first = lines[0]
  const trimmed = first.trim()

  // fenced code
  if (/^```/.test(trimmed)) {
    const code = lines.slice(1, lines[lines.length - 1].trim().startsWith('```') ? -1 : undefined).join('\n')
    return (
      <pre key={key} className="prose-pre">
        <code>{code}</code>
      </pre>
    )
  }

  // heading
  const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed)
  if (heading) {
    const level = heading[1].length
    const Tag = `h${Math.min(level, 6)}` as keyof React.JSX.IntrinsicElements
    const text = heading[2]
    const id = slugify(text)
    return (
      <Tag key={key} id={id} className={`prose-h prose-h${level}`}>
        {parseInline(text, key)}
      </Tag>
    )
  }

  // horizontal rule
  if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
    return <hr key={key} className="prose-hr" />
  }

  // blockquote / callout
  if (/^>\s?/.test(trimmed)) {
    const inner = lines.map((l) => l.replace(/^\s*>\s?/, '')).join('\n')
    const callout = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/i.exec(inner)
    if (callout) {
      const type = callout[1].toUpperCase()
      const rest = inner.slice(callout[0].length).trim()
      return (
        <div key={key} className="prose-callout">
          <Callout emoji={CALLOUT_EMOJI[type]}>{parseInline(rest, key)}</Callout>
        </div>
      )
    }
    return (
      <blockquote key={key} className="prose-quote">
        {inner.split('\n').map((l, idx) => (
          <p key={idx}>{parseInline(l, `${key}-${idx}`)}</p>
        ))}
      </blockquote>
    )
  }

  // unordered list
  if (/^[-*]\s+/.test(trimmed)) {
    const items = lines.filter((l) => l.trim()).map((l) => l.replace(/^\s*[-*]\s+/, ''))
    return (
      <ul key={key} className="prose-ul">
        {items.map((it, idx) => (
          <li key={idx}>{parseInline(it, `${key}-${idx}`)}</li>
        ))}
      </ul>
    )
  }

  // ordered list
  if (/^\d+\.\s+/.test(trimmed)) {
    const items = lines.filter((l) => l.trim()).map((l) => l.replace(/^\s*\d+\.\s+/, ''))
    return (
      <ol key={key} className="prose-ol">
        {items.map((it, idx) => (
          <li key={idx}>{parseInline(it, `${key}-${idx}`)}</li>
        ))}
      </ol>
    )
  }

  // table — a header row, a `| --- | :--: |` delimiter row, then body rows
  if (
    lines.length >= 2 &&
    lines[0].includes('|') &&
    /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(lines[1])
  ) {
    const cells = (row: string): string[] => {
      let r = row.trim()
      if (r.startsWith('|')) r = r.slice(1)
      if (r.endsWith('|')) r = r.slice(0, -1)
      return r.split('|').map((c) => c.trim())
    }
    const aligns = cells(lines[1]).map((c) => {
      const l = c.startsWith(':')
      const r = c.endsWith(':')
      return r ? (l ? 'center' : 'right') : l ? 'left' : undefined
    })
    const head = cells(lines[0])
    const body = lines.slice(2).filter((l) => l.trim()).map(cells)
    const align = (i: number): React.CSSProperties | undefined => {
      const a = aligns[i]
      return a ? { textAlign: a } : undefined
    }
    return (
      <div key={key} className="prose-table-wrap">
        <table className="prose-table">
          <thead>
            <tr>
              {head.map((c, i) => (
                <th key={i} style={align(i)}>
                  {parseInline(c, `${key}-h${i}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri}>
                {row.map((c, ci) => (
                  <td key={ci} style={align(ci)}>
                    {parseInline(c, `${key}-${ri}-${ci}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // image-only block → figure
  const imgOnly = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/.exec(trimmed)
  if (imgOnly && lines.length === 1) {
    return (
      <figure key={key} className="prose-figure">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgOnly[2]} alt={imgOnly[1]} />
        {imgOnly[3] && <figcaption>{imgOnly[3]}</figcaption>}
      </figure>
    )
  }

  // paragraph — soft-wrap lines join with spaces
  return (
    <p key={key} className="prose-p">
      {parseInline(lines.join(' ').trim(), key)}
    </p>
  )
}

export function Markdown({ children }: { children: string }) {
  const blocks = splitBlocks(children)
  return <>{blocks.map((b, i) => renderBlock(b, `b${i}`))}</>
}

export default Markdown
