import { beforeEach, describe, expect, it } from 'vitest'
import worker, { type Env } from '../src/index'

/** Just enough of KVNamespace for the worker: get / put / delete on a Map. */
function memoryKV() {
  const store = new Map<string, string>()
  const kv = {
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => void store.set(key, value),
    delete: async (key: string) => void store.delete(key),
  }
  return { store, kv: kv as unknown as KVNamespace }
}

let store: Map<string, string>
let env: Env

beforeEach(() => {
  const mem = memoryKV()
  store = mem.store
  env = { STATS: mem.kv, ALLOWED_ORIGINS: 'https://dwseoh.com,http://localhost:3000', SALT: 'test' }
})

const VISITOR = 'visitor-1234'

async function call(
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {}
) {
  const req = new Request(`https://stats.example${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const res = await worker.fetch(req, env)
  const text = await res.text()
  return { res, data: text ? JSON.parse(text) : null }
}

describe('routing', () => {
  it('answers health checks', async () => {
    const { res, data } = await call('GET', '/health')
    expect(res.status).toBe(200)
    expect(data).toEqual({ ok: true, service: 'dwseoh-blog-stats' })
  })

  it('404s unknown routes and wrong methods', async () => {
    expect((await call('GET', '/nope')).res.status).toBe(404)
    expect((await call('GET', '/api/view')).res.status).toBe(404)
  })
})

describe('CORS', () => {
  it('reflects an allowed origin', async () => {
    const { res } = await call('GET', '/health', undefined, { Origin: 'http://localhost:3000' })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')
  })

  it('falls back to the first allowed origin for strangers', async () => {
    const { res } = await call('GET', '/health', undefined, { Origin: 'https://evil.example' })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://dwseoh.com')
  })

  it('answers preflight with 204', async () => {
    const { res } = await call('OPTIONS', '/api/like')
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST')
  })
})

describe('views', () => {
  it('counts a view once per IP', async () => {
    const ip = { 'CF-Connecting-IP': '1.2.3.4' }
    expect((await call('POST', '/api/view', { slug: 'post' }, ip)).data).toEqual({ views: 1 })
    expect((await call('POST', '/api/view', { slug: 'post' }, ip)).data).toEqual({ views: 1 })
    const other = { 'CF-Connecting-IP': '5.6.7.8' }
    expect((await call('POST', '/api/view', { slug: 'post' }, other)).data).toEqual({ views: 2 })
  })

  it('never stores raw IPs', async () => {
    await call('POST', '/api/view', { slug: 'post' }, { 'CF-Connecting-IP': '1.2.3.4' })
    expect([...store.keys()].some((k) => k.includes('1.2.3.4'))).toBe(false)
  })

  it('a view increases the count the blog reads back', async () => {
    const views = async () => (await call('GET', '/api/stats?slugs=post')).data.stats.post.views
    expect(await views()).toBe(0)

    await call('POST', '/api/view', { slug: 'post' }, { 'CF-Connecting-IP': '1.1.1.1' })
    expect(await views()).toBe(1)

    await call('POST', '/api/view', { slug: 'post' }, { 'CF-Connecting-IP': '2.2.2.2' })
    await call('POST', '/api/view', { slug: 'post' }, { 'CF-Connecting-IP': '3.3.3.3' })
    expect(await views()).toBe(3)
    expect(store.get('views:post')).toBe('3')
  })

  it('a repeat view from the same IP leaves the count unchanged', async () => {
    const ip = { 'CF-Connecting-IP': '1.1.1.1' }
    await call('POST', '/api/view', { slug: 'post' }, ip)
    await call('POST', '/api/view', { slug: 'post' }, ip)
    await call('POST', '/api/view', { slug: 'post' }, ip)
    expect((await call('GET', '/api/stats?slugs=post')).data.stats.post.views).toBe(1)
  })

  it('counts the same IP again once its 12-hour dedupe entry expires', async () => {
    const ip = { 'CF-Connecting-IP': '1.1.1.1' }
    await call('POST', '/api/view', { slug: 'post' }, ip)
    // Simulate KV expiring the TTL'd `viewed:` key.
    for (const key of store.keys()) if (key.startsWith('viewed:')) store.delete(key)
    expect((await call('POST', '/api/view', { slug: 'post' }, ip)).data).toEqual({ views: 2 })
  })

  it('a view on one post leaves other posts unchanged', async () => {
    await call('POST', '/api/view', { slug: 'a' }, { 'CF-Connecting-IP': '1.1.1.1' })
    const { data } = await call('GET', '/api/stats?slugs=a,b')
    expect(data.stats).toEqual({ a: { views: 1, likes: 0 }, b: { views: 0, likes: 0 } })
  })

  it('rejects invalid slugs', async () => {
    expect((await call('POST', '/api/view', { slug: '../etc' })).res.status).toBe(400)
    expect((await call('POST', '/api/view', {})).res.status).toBe(400)
  })
})

describe('likes', () => {
  it('toggles a like on and off', async () => {
    const on = await call('POST', '/api/like', { slug: 'post', visitor: VISITOR })
    expect(on.data).toEqual({ likes: 1, liked: true })
    const state = await call('GET', `/api/like?slug=post&visitor=${VISITOR}`)
    expect(state.data).toEqual({ likes: 1, liked: true })
    const off = await call('POST', '/api/like', { slug: 'post', visitor: VISITOR })
    expect(off.data).toEqual({ likes: 0, liked: false })
  })

  it('never goes below zero', async () => {
    store.set(`like:${VISITOR}:post`, '1') // liked, but the counter was lost
    const { data } = await call('POST', '/api/like', { slug: 'post', visitor: VISITOR })
    expect(data).toEqual({ likes: 0, liked: false })
  })

  it('rejects a missing or too-short visitor id', async () => {
    expect((await call('POST', '/api/like', { slug: 'post' })).res.status).toBe(400)
    expect((await call('POST', '/api/like', { slug: 'post', visitor: 'x' })).res.status).toBe(400)
  })
})

describe('stats', () => {
  it('batch-reads views and likes, skipping invalid slugs', async () => {
    store.set('views:a', '3')
    store.set('likes:a', '1')
    const { data } = await call('GET', '/api/stats?slugs=a,b,../bad')
    expect(data).toEqual({ stats: { a: { views: 3, likes: 1 }, b: { views: 0, likes: 0 } } })
  })
})

describe('visits', () => {
  it('gives each browser a permanent ordinal', async () => {
    const first = await call('POST', '/api/visit', { visitor: 'browser-aaaa' })
    const second = await call('POST', '/api/visit', { visitor: 'browser-bbbb' })
    const again = await call('POST', '/api/visit', { visitor: 'browser-aaaa' })
    expect(first.data).toEqual({ ordinal: 1, total: 1 })
    expect(second.data).toEqual({ ordinal: 2, total: 2 })
    expect(again.data).toEqual({ ordinal: 1, total: 2 })
    expect((await call('GET', '/api/visits')).data).toEqual({ total: 2 })
  })

  it('throttles new ordinals from one IP after 20 an hour', async () => {
    const ip = { 'CF-Connecting-IP': '9.9.9.9' }
    for (let i = 0; i < 20; i++) {
      await call('POST', '/api/visit', { visitor: `browser-${i}-xxxx` }, ip)
    }
    const { data } = await call('POST', '/api/visit', { visitor: 'browser-new-xxxx' }, ip)
    expect(data).toEqual({ ordinal: 20, total: 20, throttled: true })
    expect(store.has('visit:browser-new-xxxx')).toBe(false)
  })
})
