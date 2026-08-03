'use client'

/**
 * Client helpers for the stats API (a Cloudflare Worker; see backend/).
 *
 * The API base URL comes from NEXT_PUBLIC_STATS_API. If it's unset, every call
 * resolves to `null` and the UI hides its counters — the site works fully
 * without a backend. Progressive enhancement, on purpose.
 *
 * Contract (implemented by backend/src/index.ts):
 *   GET  {BASE}/api/stats?slugs=a,b,c        -> { stats: { a: {views,likes}, ... } }
 *   POST {BASE}/api/view    { slug }         -> { views }
 *   GET  {BASE}/api/like?slug=x&visitor=v    -> { likes, liked }
 *   POST {BASE}/api/like    { slug, visitor} -> { likes, liked }   (toggles)
 *   POST {BASE}/api/visit   { visitor }      -> { ordinal, total }
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

export interface Visit {
  /** This visitor's place in line — the "N" in "you are the Nth visitor". */
  ordinal: number
  /** Total unique visitors counted so far. */
  total: number
  /** Set when the IP's hourly budget was spent: shown, but not persisted. */
  throttled?: boolean
}

export const statsEnabled = BASE.length > 0

/**
 * Stable per-browser id, used to dedupe likes and to identify site visitors.
 * Created lazily in localStorage. (The `blog:` key name predates the site-wide
 * use — renaming it would reset everyone's likes, so it stays.)
 */
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

const VISIT_KEY = 'site:visit'

/**
 * Claim this visitor's place in line for the site-wide counter.
 *
 * Identity is the same per-browser uuid the like button uses, so people sharing
 * a public IP are counted separately and a returning browser keeps its original
 * ordinal. We also cache the answer in sessionStorage so navigating around the
 * site neither re-requests it nor lets the number drift while someone reads.
 */
export async function registerVisit(): Promise<Visit | null> {
  if (!statsEnabled) return null
  try {
    const cached = sessionStorage.getItem(VISIT_KEY)
    if (cached) {
      const visit = JSON.parse(cached) as Visit
      if (typeof visit?.ordinal === 'number') return visit
    }
  } catch {
    // no sessionStorage (private mode, blocked storage) — just ask the server
  }

  // No usable localStorage means no stable identity; skip rather than mint an
  // ordinal on every page load.
  const visitor = visitorId()
  if (!visitor) return null

  try {
    const res = await fetch(`${BASE}/api/visit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ visitor }),
    })
    const visit = await json<Visit>(res)
    if (!visit || typeof visit.ordinal !== 'number') return null
    try {
      sessionStorage.setItem(VISIT_KEY, JSON.stringify(visit))
    } catch {
      // caching is a nicety, not a requirement
    }
    return visit
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
