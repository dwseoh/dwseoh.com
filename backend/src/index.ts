/**
 * dwseoh.com — blog stats worker
 *
 * A tiny Cloudflare Worker that tracks per-post view and like counts in a KV
 * namespace. It backs the counters on the blog (see frontend/lib/stats.ts).
 *
 *   GET  /api/stats?slugs=a,b,c        -> { stats: { a: {views,likes}, ... } }
 *   POST /api/view    { slug }         -> { views }          (deduped per IP/12h)
 *   GET  /api/like?slug=x&visitor=v    -> { likes, liked }
 *   POST /api/like    { slug, visitor} -> { likes, liked }   (toggles)
 *
 * KV keys:
 *   views:<slug>            running view count
 *   likes:<slug>            running like count
 *   viewed:<iphash>:<slug>  presence = this IP already counted (TTL'd)
 *   like:<visitor>:<slug>   presence = this visitor currently likes the post
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
  if (typeof visitor !== 'string' || visitor.length < 8 || visitor.length > 100) {
    return json({ error: 'invalid visitor' }, origin, 400)
  }

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
      if (url.pathname === '/' || url.pathname === '/health') {
        return json({ ok: true, service: 'dwseoh-blog-stats' }, origin)
      }
      return json({ error: 'not found' }, origin, 404)
    } catch (err) {
      return json({ error: 'internal error', detail: String(err) }, origin, 500)
    }
  },
} satisfies ExportedHandler<Env>
