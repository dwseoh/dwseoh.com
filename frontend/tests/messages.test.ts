import { describe, expect, it } from 'vitest'
import en from '@/messages/en.json'
import ko from '@/messages/ko.json'

/** Dotted paths of every leaf; arrays count as leaves (their items are content). */
function keys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? keys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )
}

describe('messages', () => {
  it('ko.json has exactly the same keys as en.json', () => {
    const enKeys = keys(en)
    const koKeys = keys(ko)
    expect(enKeys.filter((k) => !koKeys.includes(k)), 'missing from ko.json').toEqual([])
    expect(koKeys.filter((k) => !enKeys.includes(k)), 'missing from en.json').toEqual([])
  })
})
