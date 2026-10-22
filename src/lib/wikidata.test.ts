import { describe, expect, it } from 'vitest'
import { shortBrand, toHits, type Entity } from './wikidata'

const item = (id: string, label: string, description: string, types: string[], extra: Entity['claims'] = {}): Entity => ({
  id,
  labels: { en: { value: label } },
  descriptions: { en: { value: description } },
  claims: {
    P31: types.map((t) => ({ mainsnak: { datavalue: { value: { id: t } } } })),
    ...extra,
  },
})

const label = (id: string, value: string): Entity => ({ id, labels: { en: { value } } })

// Shaped like real results for "airpods 3 pro".
const items: Record<string, Entity> = {
  Q1: item('Q1', 'AirPods Pro 3', 'wireless earbuds developed by Apple', ['T_EARBUDS'], {
    P176: [{ mainsnak: { datavalue: { value: { id: 'B_APPLE' } } } }],
    P577: [{ mainsnak: { datavalue: { value: { time: '+2025-09-19T00:00:00Z' } } } }],
  }),
  Q2: item('Q2', 'The Vergecast - AirPods Max review', 'episode of the Vergecast', ['T_PODCAST']),
  Q3: item('Q3', 'PlayStation 5 APU', 'system-on-a-chip of the PlayStation 5', ['T_SOC']),
  Q4: item('Q4', 'Mystery Model', 'a model of something', ['T_PRODUCT']),
  Q5: item('Q5', 'Kindle', 'e-reader by Amazon', ['T_PRODUCT']),
}
const related: Record<string, Entity> = {
  T_EARBUDS: label('T_EARBUDS', 'earbuds model'),
  T_PODCAST: label('T_PODCAST', 'podcast episode'),
  T_SOC: label('T_SOC', 'system on a chip model'),
  T_PRODUCT: label('T_PRODUCT', 'product model'),
  B_APPLE: label('B_APPLE', 'Apple Inc.'),
}

describe('toHits', () => {
  it('keeps gadgets and drops articles, chips and unknown products', () => {
    const hits = toHits(['Q1', 'Q2', 'Q3', 'Q4', 'Q5'], items, related)
    expect(hits).toEqual([
      expect.objectContaining({
        id: 'wikidata:Q1',
        name: 'AirPods Pro 3',
        brand: 'Apple',
        category: 'headphones',
        releaseDate: '2025-09-19',
      }),
      // No company on the item itself, so the brand comes from the description.
      expect.objectContaining({ id: 'wikidata:Q5', brand: 'Amazon', category: 'tablet' }),
    ])
  })
})

describe('shortBrand', () => {
  it('drops company suffixes', () => {
    expect(shortBrand('Apple Inc.')).toBe('Apple')
    expect(shortBrand('Sony Group Corporation')).toBe('Sony')
    expect(shortBrand('Sony Interactive Entertainment')).toBe('Sony')
    expect(shortBrand('Samsung Electronics')).toBe('Samsung')
    expect(shortBrand('Bose')).toBe('Bose')
  })
})
