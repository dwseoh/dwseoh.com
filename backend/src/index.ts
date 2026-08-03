/**
 * dwseoh.com — stats worker
 *
 * A tiny Cloudflare Worker that tracks per-post view and like counts, plus a
 * site-wide unique-visitor counter, in a KV namespace. It backs the counters on
 * the blog and the "you are the Nth visitor" line in the site footer (see
 * frontend/lib/stats.ts).
 *
 *   GET  /api/stats?slugs=a,b,c        -> { stats: { a: {views,likes}, ... } }
 *   POST /api/view    { slug }         -> { views }          (deduped per IP/12h)
 *   GET  /api/like?slug=x&visitor=v    -> { likes, liked }
 *   POST /api/like    { slug, visitor} -> { likes, liked }   (toggles)
 *   POST /api/visit   { visitor }      -> { ordinal, total } (one per browser)
 *   GET  /api/visits                   -> { total }          (read-only)
 *
 * KV keys:
 *   views:<slug>            running view count
 *   likes:<slug>            running like count
 *   viewed:<iphash>:<slug>  presence = this IP already counted (TTL'd)
 *   like:<visitor>:<slug>   presence = this visitor currently likes the post
 *   site:visits             running count of unique site visitors
 *   visit:<visitor>         the ordinal this browser was assigned (permanent)
 *   visitrate:<iphash>:<h>  new ordinals minted from this IP this hour (TTL'd)
 *
 * Counts are read-modify-write and thus not strictly atomic. That's fine for a
 * personal blog; for high-concurrency accuracy, move counters to a Durable
 * Object. See README.md.
 */

export interface Env {
  STATS: KVNamespace
  /** Comma-separated origin allowlist, e.g. "https://dwseoh.com,http://localhost:3000". */
  ALLOWED_ORIGINS?: string
  /** Secret used to salt hashed IPs. Set with: wrangler secret put SALT */
  SALT?: string
}

const VIEW_DEDUPE_TTL = 60 * 60 * 12 // 12 hours
const VISITS_KEY = 'site:visits'
// Site visitors are identified by the browser's localStorage uuid, not by IP —
// otherwise everyone behind one NAT (café wifi, campus, carrier CGNAT) collapses
// into a single visitor. The IP is kept only as an anti-farming budget: at most
// this many *new* ordinals may be minted from one IP per window, so someone
// clearing storage in a loop can't run the number up.
const VISIT_RATE_WINDOW = 60 * 60 // 1 hour
const VISIT_RATE_MAX = 20 // new ordinals per IP per window
const MAX_SLUGS = 50
const SLUG_RE = /^[a-z0-9-]{1,100}$/i

// ---------------------------------------------------------------- helpers ---

function pickOrigin(req: Request, env: Env): string {
  const origin = req.headers.get('Origin') ?? ''
  const allowed = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (allowed.length === 0) return origin || '*' // unconfigured: reflect/any
  if (origin && allowed.includes(origin)) return origin
  return allowed[0]
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function json(data: unknown, origin: string, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

async function count(env: Env, key: string): Promise<number> {
  const raw = await env.STATS.get(key)
  const n = raw ? parseInt(raw, 10) : 0
  return Number.isFinite(n) && n > 0 ? n : 0
}

async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function validSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && SLUG_RE.test(slug)
}

/** A browser-generated uuid from localStorage (see frontend visitorId()). */
function validVisitor(visitor: unknown): visitor is string {
  return typeof visitor === 'string' && visitor.length >= 8 && visitor.length <= 100
}

async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json()
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

// ---------------------------------------------------------------- routes ----

async function handleStats(url: URL, env: Env, origin: string): Promise<Response> {
  const slugs = (url.searchParams.get('slugs') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(validSlug)
    .slice(0, MAX_SLUGS)

  const stats: Record<string, { views: number; likes: number }> = {}
  await Promise.all(
    slugs.map(async (slug) => {
      const [views, likes] = await Promise.all([
        count(env, `views:${slug}`),
        count(env, `likes:${slug}`),
      ])
      stats[slug] = { views, likes }
    })
  )
  return json({ stats }, origin)
}

async function handleView(req: Request, env: Env, origin: string): Promise<Response> {
  const { slug } = await readBody(req)
  if (!validSlug(slug)) return json({ error: 'invalid slug' }, origin, 400)

  const viewsKey = `views:${slug}`
  const ip = req.headers.get('CF-Connecting-IP') ?? '0.0.0.0'
  const iphash = await hashIp(ip, env.SALT ?? 'dwseoh')
  const dedupeKey = `viewed:${iphash}:${slug}`

  // Already counted this IP recently → return the current total, don't inflate.
  if (await env.STATS.get(dedupeKey)) {
    return json({ views: await count(env, viewsKey) }, origin)
  }

  const views = (await count(env, viewsKey)) + 1
  await Promise.all([
    env.STATS.put(viewsKey, String(views)),
    env.STATS.put(dedupeKey, '1', { expirationTtl: VIEW_DEDUPE_TTL }),
  ])
  return json({ views }, origin)
}

async function handleLikeGet(url: URL, env: Env, origin: string): Promise<Response> {
  const slug = url.searchParams.get('slug')
  const visitor = url.searchParams.get('visitor') ?? ''
  if (!validSlug(slug)) return json({ error: 'invalid slug' }, origin, 400)

  const likes = await count(env, `likes:${slug}`)
  const liked = visitor ? Boolean(await env.STATS.get(`like:${visitor}:${slug}`)) : false
  return json({ likes, liked }, origin)
}

async function handleLikeToggle(req: Request, env: Env, origin: string): Promise<Response> {
  const { slug, visitor } = await readBody(req)
  if (!validSlug(slug)) return json({ error: 'invalid slug' }, origin, 400)
  if (!validVisitor(visitor)) return json({ error: 'invalid visitor' }, origin, 400)

  const likesKey = `likes:${slug}`
  const likeKey = `like:${visitor}:${slug}`
  const already = Boolean(await env.STATS.get(likeKey))

  let likes = await count(env, likesKey)
  let liked: boolean

  if (already) {
    likes = Math.max(0, likes - 1)
    liked = false
    await Promise.all([env.STATS.put(likesKey, String(likes)), env.STATS.delete(likeKey)])
  } else {
    likes = likes + 1
    liked = true
    await Promise.all([env.STATS.put(likesKey, String(likes)), env.STATS.put(likeKey, '1')])
  }
  return json({ likes, liked }, origin)
}

/**
 * Site-wide unique-visitor counter.
 *
 * Identity is the browser's localStorage uuid, so devices sharing one public IP
 * each get counted, and a given browser keeps its place in line forever — come
 * back next year and you're still the 42nd visitor.
 *
 * The IP is used only as a budget on *minting*: a browser we've never seen
 * before can only claim a new ordinal if its IP hasn't already minted
 * VISIT_RATE_MAX of them this hour. Over budget, we hand back the current total
 * as a plausible ordinal but neither persist it nor bump the counter — so
 * clearing localStorage in a loop gets you nothing.
 */
async function handleVisit(req: Request, env: Env, origin: string): Promise<Response> {
  const { visitor } = await readBody(req)
  if (!validVisitor(visitor)) return json({ error: 'invalid visitor' }, origin, 400)

  const visitKey = `visit:${visitor}`
  const seen = await env.STATS.get(visitKey)
  if (seen) {
    const ordinal = parseInt(seen, 10)
    if (Number.isFinite(ordinal) && ordinal > 0) {
      return json({ ordinal, total: await count(env, VISITS_KEY) }, origin)
    }
  }

  // New browser — check this IP's hourly minting budget before issuing one.
  const ip = req.headers.get('CF-Connecting-IP') ?? '0.0.0.0'
  const iphash = await hashIp(ip, env.SALT ?? 'dwseoh')
  const window = Math.floor(Date.now() / (VISIT_RATE_WINDOW * 1000))
  const rateKey = `visitrate:${iphash}:${window}`
  const minted = await count(env, rateKey)

  if (minted >= VISIT_RATE_MAX) {
    const total = await count(env, VISITS_KEY)
    return json({ ordinal: total, total, throttled: true }, origin)
  }

  const total = (await count(env, VISITS_KEY)) + 1
  await Promise.all([
    env.STATS.put(VISITS_KEY, String(total)),
    env.STATS.put(visitKey, String(total)), // no TTL: your place in line is permanent
    // 2x the window so an entry can't lapse mid-window and reset the budget
    env.STATS.put(rateKey, String(minted + 1), { expirationTtl: VISIT_RATE_WINDOW * 2 }),
  ])
  return json({ ordinal: total, total }, origin)
}

/** Read the visitor total without claiming an ordinal. */
async function handleVisits(env: Env, origin: string): Promise<Response> {
  return json({ total: await count(env, VISITS_KEY) }, origin)
}

// ----------------------------------------------------------------- entry ----

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = pickOrigin(req, env)
    const url = new URL(req.url)

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    try {
      if (url.pathname === '/api/stats' && req.method === 'GET') {
        return await handleStats(url, env, origin)
      }
      if (url.pathname === '/api/view' && req.method === 'POST') {
        return await handleView(req, env, origin)
      }
      if (url.pathname === '/api/like' && req.method === 'GET') {
        return await handleLikeGet(url, env, origin)
      }
      if (url.pathname === '/api/like' && req.method === 'POST') {
        return await handleLikeToggle(req, env, origin)
      }
      if (url.pathname === '/api/visit' && req.method === 'POST') {
        return await handleVisit(req, env, origin)
      }
      if (url.pathname === '/api/visits' && req.method === 'GET') {
        return await handleVisits(env, origin)
      }
      if (url.pathname === '/' || url.pathname === '/health') {
        return json({ ok: true, service: 'dwseoh-blog-stats' }, origin)
      }
      return json({ error: 'not found' }, origin, 404)
    } catch (err) {
      return json({ error: 'internal error', detail: String(err) }, origin, 500)
    }
  },
} satisfies ExportedHandler<Env>
