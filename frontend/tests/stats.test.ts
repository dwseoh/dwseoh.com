import { describe, expect, it } from 'vitest'
import { fetchStats, formatCount, registerView, statsEnabled } from '@/lib/stats'

describe('formatCount', () => {
  it.each([
    [0, '0'],
    [999, '999'],
    [1000, '1k'],
    [1234, '1.2k'],
    [9999, '9.9k'],
    [10_000, '10k'],
    [999_999, '999k'],
    [1_000_000, '1m'],
    [1_234_567, '1.2m'],
    [12_345_678, '12m'],
  ])('%i -> %s', (n, expected) => {
    expect(formatCount(n)).toBe(expected)
  })
})

describe('without NEXT_PUBLIC_STATS_API', () => {
  it('is disabled and every call resolves to null', async () => {
    expect(statsEnabled).toBe(false)
    expect(await fetchStats(['a'])).toBeNull()
    expect(await registerView('a')).toBeNull()
  })
})
