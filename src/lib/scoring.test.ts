import { describe, expect, it } from 'vitest'
import { scoreGadget } from './scoring'
import { categoryFromTags } from './categories'

const now = new Date('2026-01-01T00:00:00Z')

describe('scoreGadget', () => {
  it('reaches 100% after a full lifespan at the expected pace', () => {
    // headphones: 3 years × 10 h/week. Daily 1.5h ≈ 10.5 h/week.
    const s = scoreGadget(
      { category: 'headphones', price: 300, purchaseDate: '2023-01-01', frequency: 'daily', hoursPerSession: 1.5 },
      now,
    )
    expect(s.fulfilment).toBeGreaterThan(100)
    expect(s.verdict).toBe('paid-off')
    expect(s.weeksToPayoff).toBe(0)
    expect(s.paysOffInLifetime).toBe(true)
  })

  it('flags a barely used gadget', () => {
    const s = scoreGadget(
      { category: 'camera', price: 1200, purchaseDate: '2025-01-01', frequency: 'monthly', hoursPerSession: 2 },
      now,
    )
    expect(s.pace).toBeCloseTo(0.25)
    expect(s.verdict).toBe('gathering-dust')
    expect(s.fulfilment).toBeLessThan(10)
    expect(s.paysOffInLifetime).toBe(false)
  })

  it('subtracts resale value from cost per hour', () => {
    const base = { category: 'phone', price: 1000, purchaseDate: '2025-01-01', frequency: 'daily', hoursPerSession: 3 } as const
    const plain = scoreGadget(base, now)
    const resold = scoreGadget({ ...base, resaleValue: 400 }, now)
    expect(resold.costPerHour!).toBeCloseTo(plain.costPerHour! * 0.6)
  })

  it('handles a purchase made today', () => {
    const s = scoreGadget(
      { category: 'laptop', price: 1500, purchaseDate: '2026-01-01', frequency: 'daily', hoursPerSession: 4 },
      now,
    )
    expect(s.hoursUsed).toBe(0)
    expect(s.costPerHour).toBeNull()
    expect(s.weeksToPayoff).toBeGreaterThan(0)
  })
})

describe('categoryFromTags', () => {
  it('maps Open Products Facts tags', () => {
    expect(categoryFromTags(['en:electronics', 'en:headphones-headsets'])).toBe('headphones')
    expect(categoryFromTags(['en:televisions'])).toBe('tv')
    expect(categoryFromTags([], 'AirPods earbuds')).toBe('headphones')
    expect(categoryFromTags([], 'mystery box')).toBe('other')
  })
})
