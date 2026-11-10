import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const API = 'https://stats.example'

/** A stand-in for the worker's view endpoint: counts every view it's sent. */
function fakeViewApi() {
  let views = 0
  const fetch = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === `${API}/api/view` && init?.method === 'POST') {
      views += 1
      return new Response(JSON.stringify({ views }))
    }
    return new Response('not found', { status: 404 })
  })
  return { fetch }
}

/** An in-memory sessionStorage (Node has none). */
function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
  }
}

let api: ReturnType<typeof fakeViewApi>

beforeEach(() => {
  // lib/stats reads the base URL at import time, so set it and re-import.
  vi.stubEnv('NEXT_PUBLIC_STATS_API', `${API}/`)
  vi.resetModules()
  api = fakeViewApi()
  vi.stubGlobal('fetch', api.fetch)
  vi.stubGlobal('sessionStorage', memoryStorage())
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('registerView with the stats API configured', () => {
  it('posts the view and returns the new count', async () => {
    const { registerView, statsEnabled } = await import('@/lib/stats')
    expect(statsEnabled).toBe(true)

    expect(await registerView('my-post')).toBe(1)
    expect(api.fetch).toHaveBeenCalledWith(
      `${API}/api/view`, // trailing slash on the env var is stripped
      expect.objectContaining({ method: 'POST' })
    )
    const body = JSON.parse(api.fetch.mock.calls[0][1]!.body as string)
    expect(body).toEqual({ slug: 'my-post', seen: false })
  })

  it('returns the increased count on each new view', async () => {
    const { registerView } = await import('@/lib/stats')
    expect(await registerView('my-post')).toBe(1)
    sessionStorage.clear() // a new browser session
    expect(await registerView('my-post')).toBe(2)
  })

  it('flags a repeat view in the same session as already seen', async () => {
    const { registerView } = await import('@/lib/stats')
    await registerView('my-post')
    await registerView('my-post')
    const second = JSON.parse(api.fetch.mock.calls[1][1]!.body as string)
    expect(second).toEqual({ slug: 'my-post', seen: true })
  })

  it('returns null instead of throwing when the API is down', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })))
    const { registerView } = await import('@/lib/stats')
    expect(await registerView('my-post')).toBeNull()
  })
})
