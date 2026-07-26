'use client'

/**
 * Client helpers for the views/likes API (a Cloudflare Worker; see backend/).
 *
 * The API base URL comes from NEXT_PUBLIC_STATS_API. If it's unset, every call
 * resolves to `null` and the UI hides its counters — the blog works fully
 * without a backend. Progressive enhancement, on purpose.
 *
 * Contract (implemented by backend/src/index.ts):
 *   GET  {BASE}/api/stats?slugs=a,b,c        -> { stats: { a: {views,likes}, ... } }
 *   POST {BASE}/api/view    { slug }         -> { views }
 *   GET  {BASE}/api/like?slug=x&visitor=v    -> { likes, liked }
 *   POST {BASE}/api/like    { slug, visitor} -> { likes, liked }   (toggles)
 */

const BASE = process.env.NEXT_PUBLIC_STATS_API?.replace(/\/$/, '') ?? ''

export interface Stat {
  views: number
  likes: number
}

export interface LikeState {
  likes: number
  liked: boolean
}

export const statsEnabled = BASE.length > 0

/** Stable per-browser id used to dedupe likes. Created lazily in localStorage. */
export function visitorId(): string {
  if (typeof window === 'undefined') return ''
  try {
    const KEY = 'blog:visitor'
    let id = localStorage.getItem(KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return ''
  }
}

async function json<T>(res: Response): Promise<T | null> {
  if (!res.ok) return null
  try {
    return (await res.json()) as T
  } catch {
    return null
  }
}

/** Batch-fetch stats for a set of slugs (used by the post list). */
export async function fetchStats(slugs: string[]): Promise<Record<string, Stat> | null> {
  if (!statsEnabled || slugs.length === 0) return null
  try {
    const q = encodeURIComponent(slugs.join(','))
    const res = await fetch(`${BASE}/api/stats?slugs=${q}`, { cache: 'no-store' })
    const data = await json<{ stats: Record<string, Stat> }>(res)
    return data?.stats ?? null
  } catch {
    return null
  }
}

/** Register a view. Deduped per-session client-side and per-IP on the server. */
export async function registerView(slug: string): Promise<number | null> {
  if (!statsEnabled) return null
  try {
    const key = `blog:viewed:${slug}`
    const already = sessionStorage.getItem(key)
    const res = await fetch(`${BASE}/api/view`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, seen: Boolean(already) }),
    })
    sessionStorage.setItem(key, '1')
    const data = await json<{ views: number }>(res)
    return data?.views ?? null
  } catch {
    return null
  }
}

/** Read this visitor's like state for a post. */
export async function fetchLike(slug: string): Promise<LikeState | null> {
  if (!statsEnabled) return null
  try {
    const res = await fetch(
      `${BASE}/api/like?slug=${encodeURIComponent(slug)}&visitor=${encodeURIComponent(visitorId())}`,
      { cache: 'no-store' }
    )
    return await json<LikeState>(res)
  } catch {
    return null
  }
}

/** Toggle this visitor's like for a post. */
export async function toggleLike(slug: string): Promise<LikeState | null> {
  if (!statsEnabled) return null
  try {
    const res = await fetch(`${BASE}/api/like`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, visitor: visitorId() }),
    })
    return await json<LikeState>(res)
  } catch {
    return null
  }
}

/** 1234 -> "1.2k" for compact display. */
export function formatCount(n: number): string {
  if (n < 1000) return String(n)
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  if (n < 1_000_000) return Math.round(n / 1000) + 'k'
  return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm'
}
