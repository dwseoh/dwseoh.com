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
  /** This browser's permanent place in line. Returned by the worker; unused by the UI. */
  ordinal: number
  /** Total unique visitors counted so far — the number the footer shows. */
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
 * Register this browser with the site-wide counter and read back the total.
 *
 * Identity is the same per-browser uuid the like button uses, so people sharing
 * a public IP are counted separately, and a browser the worker has already seen
 * bumps nothing — it just gets the current total. We cache the answer in
 * sessionStorage so navigating around the site neither re-requests it nor lets
 * the number tick upward while someone is reading.
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

/**
 * Compact display: 1234 -> "1.2k", 999999 -> "999k", 1234567 -> "1.2m".
 *
 * One decimal under 10 of a unit, whole numbers above. Truncates rather than
 * rounds, so a count never overflows its own unit — 9,999 reads "9.9k", not
 * "10k", and 999,999 reads "999k", not "1000k". The integer arithmetic (÷100
 * then ÷10) keeps the decimal exact instead of leaning on toFixed.
 */
export function formatCount(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) {
    return (n < 10_000 ? Math.floor(n / 100) / 10 : Math.floor(n / 1000)) + 'k'
  }
  return (n < 10_000_000 ? Math.floor(n / 100_000) / 10 : Math.floor(n / 1_000_000)) + 'm'
}
