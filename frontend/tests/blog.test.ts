import { describe, expect, it } from 'vitest'
import { getAllPosts, getPost, getPostSlugs, parseFrontmatter, readingTime } from '@/lib/blog'

describe('parseFrontmatter', () => {
  it('parses scalars, quoted strings and inline arrays', () => {
    const { data, body } = parseFrontmatter(
      ['---', 'title: "Hello: world"', "lang: 'ko'", 'tags: [a, "b", c]', '---', 'Body text'].join('\n')
    )
    expect(data).toEqual({ title: 'Hello: world', lang: 'ko', tags: ['a', 'b', 'c'] })
    expect(body).toBe('Body text')
  })

  it('returns the whole input as body when there is no frontmatter', () => {
    const raw = '# Just markdown\n\ntext'
    expect(parseFrontmatter(raw)).toEqual({ data: {}, body: raw })
  })

  it('drops empty array items and ignores malformed lines', () => {
    const { data } = parseFrontmatter('---\ntags: [a, , b]\nnot a pair\n---\n')
    expect(data).toEqual({ tags: ['a', 'b'] })
  })
})

describe('readingTime', () => {
  it('has a floor of one minute', () => {
    expect(readingTime('')).toBe(1)
    expect(readingTime('a few words')).toBe(1)
  })

  it('assumes ~200 words per minute', () => {
    expect(readingTime(Array(1000).fill('word').join(' '))).toBe(5)
  })
})

describe('content/blog', () => {
  it('every published post has valid frontmatter', async () => {
    const posts = await getAllPosts()
    expect(posts.length).toBeGreaterThan(0)
    for (const post of posts) {
      expect(post.title, post.slug).not.toBe(post.slug) // title was set
      expect(post.date, post.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(post.date)), post.slug).toBe(false)
      expect(post.summary, post.slug).not.toBe('')
      expect(['en', 'ko']).toContain(post.lang)
    }
  })

  it('lists posts newest first', async () => {
    const dates = (await getAllPosts()).map((p) => p.date)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it('skips drafts and has unique slugs', async () => {
    const slugs = await getPostSlugs()
    expect(slugs.some((s) => s.startsWith('_'))).toBe(false)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('loads a post body by slug', async () => {
    const [first] = await getAllPosts()
    const post = await getPost(first.slug)
    expect(post?.title).toBe(first.title)
    expect(post?.content).not.toMatch(/^---/)
  })

  it('rejects path traversal and unknown slugs', async () => {
    expect(await getPost('../package')).toBeNull()
    expect(await getPost('a/b')).toBeNull()
    expect(await getPost('does-not-exist')).toBeNull()
  })
})
