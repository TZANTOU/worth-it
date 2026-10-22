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

describe('scoreGadget with check-ins', () => {
  const base = { category: 'headphones', price: 200, purchaseDate: '2025-06-02', frequency: 'daily', hoursPerSession: 1 } as const
  // Wednesday noon, so the current week (from Monday 2025-12-29) is partly over.
  const wed = new Date('2025-12-31T12:00:00')

  it('counts an unused week as zero hours', () => {
    const plain = scoreGadget(base, wed)
    const skipped = scoreGadget({ ...base, checkIns: [{ week: '2025-12-15', level: 'none' }] }, wed)
    expect(plain.hoursUsed - skipped.hoursUsed).toBeCloseTo(7)
  })

  it('counts only the elapsed part of the current week', () => {
    const plain = scoreGadget(base, wed)
    const thisWeek = scoreGadget({ ...base, checkIns: [{ week: '2025-12-29', level: 'none' }] }, wed)
    expect(plain.hoursUsed - thisWeek.hoursUsed).toBeCloseTo(2.5)
  })

  it('sets the recent pace from recent answers', () => {
    const lazy = scoreGadget(
      {
        ...base,
        checkIns: ['2025-11-10', '2025-11-17', '2025-11-24', '2025-12-01', '2025-12-08', '2025-12-15', '2025-12-22', '2025-12-29'].map(
          (week) => ({ week, level: 'none' as const }),
        ),
      },
      wed,
    )
    expect(lazy.recentHoursPerWeek).toBe(0)
    expect(lazy.verdict).toBe('gathering-dust')
    expect(lazy.weeksToPayoff).toBeNull()
  })

  it('ignores answers from before the purchase', () => {
    const plain = scoreGadget(base, wed)
    const early = scoreGadget({ ...base, checkIns: [{ week: '2025-01-06', level: 'none' }] }, wed)
    expect(early.hoursUsed).toBeCloseTo(plain.hoursUsed)
  })
})
