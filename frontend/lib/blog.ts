import { promises as fs } from 'fs'
import path from 'path'

/**
 * File-based blog. Each post is a Markdown file in `content/blog/<slug>.md`
 * with a small frontmatter block. No CMS, no Markdown dependency — a tiny
 * frontmatter parser here, and a hand-rolled renderer in `lib/markdown.tsx`.
 *
 * Posts are single-language (see `lang`). The site chrome is bilingual via
 * next-intl, but a given post is written once, in whatever language it's in.
 */

const POSTS_DIR = path.join(process.cwd(), 'content', 'blog')

export interface PostMeta {
  slug: string
  title: string
  date: string // ISO 'YYYY-MM-DD'
  summary: string
  tags: string[]
  lang: 'en' | 'ko'
  cover?: string // optional thumbnail/cover image (frontmatter `thumbnail:` or `cover:`)
  category?: string // editorial kicker shown above the title (falls back to first tag)
  readingMinutes: number
}

export interface Post extends PostMeta {
  content: string // raw Markdown body (frontmatter stripped)
}

/** Minimal YAML-subset frontmatter parser: `key: value`, quoted strings, and
 *  inline arrays like `[a, b, c]`. Enough for our fixed set of fields. */
function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?/.exec(raw)
  if (!match) return { data: {}, body: raw }

  const data: Record<string, unknown> = {}
  for (const line of match[1].split('\n')) {
    const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim())
    if (!kv) continue
    const key = kv[1]
    let value = kv[2].trim()

    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    } else {
      data[key] = value.replace(/^["']|["']$/g, '')
    }
  }
  return { data, body: raw.slice(match[0].length) }
}

/** ~200 wpm, rounded up, floor of 1 minute. */
function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

function toMeta(slug: string, data: Record<string, unknown>, body: string): PostMeta {
  const tags = Array.isArray(data.tags) ? (data.tags as string[]) : []
  // `thumbnail` is the friendly frontmatter name; `cover` is kept as an alias.
  const thumb = typeof data.thumbnail === 'string' && data.thumbnail ? data.thumbnail : undefined
  const cover = typeof data.cover === 'string' && data.cover ? data.cover : undefined
  return {
    slug,
    title: typeof data.title === 'string' ? data.title : slug,
    date: typeof data.date === 'string' ? data.date : '1970-01-01',
    summary: typeof data.summary === 'string' ? data.summary : '',
    tags,
    lang: data.lang === 'ko' ? 'ko' : 'en',
    cover: thumb ?? cover,
    category: typeof data.category === 'string' && data.category ? data.category : undefined,
    readingMinutes: readingTime(body),
  }
}

async function readPostFiles(): Promise<string[]> {
  try {
    const files = await fs.readdir(POSTS_DIR)
    return files.filter((f) => f.endsWith('.md'))
  } catch {
    return []
  }
}

/** All posts, newest first. Drafts (files prefixed with `_`) are skipped. */
export async function getAllPosts(): Promise<PostMeta[]> {
  const files = await readPostFiles()
  const metas: PostMeta[] = []
  for (const file of files) {
    if (file.startsWith('_')) continue
    const slug = file.replace(/\.md$/, '')
    const raw = await fs.readFile(path.join(POSTS_DIR, file), 'utf8')
    const { data, body } = parseFrontmatter(raw)
    metas.push(toMeta(slug, data, body))
  }
  return metas.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export async function getPost(slug: string): Promise<Post | null> {
  // Guard against path traversal — slugs are single path segments only.
  if (!/^[A-Za-z0-9_-]+$/.test(slug)) return null
  try {
    const raw = await fs.readFile(path.join(POSTS_DIR, `${slug}.md`), 'utf8')
    const { data, body } = parseFrontmatter(raw)
    return { ...toMeta(slug, data, body), content: body }
  } catch {
    return null
  }
}

export async function getPostSlugs(): Promise<string[]> {
  const files = await readPostFiles()
  return files.filter((f) => !f.startsWith('_')).map((f) => f.replace(/\.md$/, ''))
}
