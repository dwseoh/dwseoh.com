import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Markdown } from '@/lib/markdown'

const render = (md: string) => renderToStaticMarkup(<Markdown>{md}</Markdown>)

describe('Markdown', () => {
  it('renders headings and paragraphs', () => {
    const html = render('# Title\n\nA paragraph.')
    expect(html).toMatch(/<h1[^>]*>Title<\/h1>/)
    expect(html).toContain('A paragraph.')
  })

  it('renders inline formatting', () => {
    const html = render('**bold** *italic* `code` ~~gone~~')
    expect(html).toContain('<strong')
    expect(html).toContain('<em')
    expect(html).toMatch(/<code[^>]*>code<\/code>/)
    expect(html).toMatch(/<(del|s)\b/)
  })

  it('does not parse formatting inside inline code', () => {
    expect(render('`**not bold**`')).not.toContain('<strong')
  })

  it('opens external links in a new tab, internal links in place', () => {
    const ext = render('[x](https://example.com)')
    expect(ext).toContain('target="_blank"')
    expect(ext).toContain('rel="noopener noreferrer"')
    expect(render('[x](/blog)')).not.toContain('target=')
  })

  it('renders lists, code fences and rules', () => {
    const html = render('- a\n- b\n\n1. one\n2. two\n\n```\nconst x = 1\n```\n\n---')
    expect(html).toContain('<ul')
    expect(html).toContain('<ol')
    expect(html).toContain('<pre')
    expect(html).toContain('const x = 1')
    expect(html).toContain('<hr')
  })

  it('renders pipe tables', () => {
    const html = render('| a | b |\n| --- | :--: |\n| 1 | 2 |')
    expect(html).toContain('<table')
    expect(html).toMatch(/<th[^>]*>a<\/th>/)
    expect(html).toMatch(/<td[^>]*>2<\/td>/)
  })

  it('renders GitHub-style callouts instead of plain quotes', () => {
    const callout = render('> [!NOTE]\n> Heads up')
    expect(callout).toContain('prose-callout')
    expect(callout).toContain('Heads up')
    expect(callout).not.toContain('[!NOTE]')
    expect(render('> just a quote')).toContain('<blockquote')
  })

  it('escapes raw HTML', () => {
    expect(render('<script>alert(1)</script>')).not.toContain('<script>')
  })
})
