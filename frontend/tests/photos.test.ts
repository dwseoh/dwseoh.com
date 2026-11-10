import { describe, expect, it } from 'vitest'
import { carouselPhotos, photoHref, photos, photosIn } from '@/lib/photos'

describe('photos manifest', () => {
  it('has unique ids and known categories', () => {
    const ids = photos.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const p of photos) {
      expect(['photography', 'events', 'hobbies'], p.id).toContain(p.category)
      expect(p.caption.en, p.id).toBeTruthy()
      expect(p.alt.en, p.id).toBeTruthy()
      expect(p.width, p.id).toBeGreaterThan(0)
      expect(p.height, p.id).toBeGreaterThan(0)
    }
  })

  it('filters by category', () => {
    expect(photosIn()).toBe(photos)
    expect(photosIn('events').every((p) => p.category === 'events')).toBe(true)
  })
})

describe('photoHref', () => {
  it('links to the photo on its category tab, encoding the id', () => {
    expect(photoHref({ id: 'a b&c', category: 'events' })).toBe('/photos?c=events&p=a%20b%26c')
  })
})

describe('carouselPhotos', () => {
  it('is the events category in manifest order', () => {
    const events = photosIn('events').map((p) => p.id)
    expect(carouselPhotos('en').map((p) => p.id)).toEqual(events)
  })

  it('falls back to English when Korean copy is missing', () => {
    const ko = carouselPhotos('ko')
    photosIn('events').forEach((p, i) => {
      expect(ko[i].caption).toBe(p.caption.ko ?? p.caption.en)
      expect(ko[i].alt).toBe(p.alt.ko ?? p.alt.en)
      expect(ko[i].href).toBe(photoHref(p))
    })
  })
})
