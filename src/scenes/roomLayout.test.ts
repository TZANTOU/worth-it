import { describe, expect, it } from 'vitest'
import type { Category, Gadget } from '../types'
import { placeInRoom, ROOM_SLOTS } from './roomLayout'

let nextId = 1
function gadget(category: Category, price = 100): Gadget {
  const id = nextId++
  return {
    id,
    name: `${category} ${id}`,
    category,
    price,
    purchaseDate: '2025-01-01',
    frequency: 'daily',
    hoursPerSession: 1,
    createdAt: id,
  }
}

describe('placeInRoom', () => {
  it('puts each kind in its natural spot', () => {
    const { placed } = placeInRoom([gadget('laptop'), gadget('tv'), gadget('camera')])
    const zoneOf = (c: Category) => placed.find((p) => p.gadget.category === c)?.slot.zone
    expect(zoneOf('laptop')).toBe('desk-center')
    expect(zoneOf('tv')).toBe('tv-stand')
    expect(zoneOf('camera')).toBe('shelf')
  })

  it('gives the best spot to the most expensive gadget', () => {
    const cheap = gadget('laptop', 300)
    const pricey = gadget('laptop', 2000)
    const { placed } = placeInRoom([cheap, pricey])
    expect(placed.find((p) => p.gadget === pricey)?.slot.zone).toBe('desk-center')
    expect(placed.find((p) => p.gadget === cheap)?.slot.zone).toBe('desk')
  })

  it('never uses a slot twice and overflows the rest', () => {
    const many = Array.from({ length: 30 }, () => gadget('other'))
    const { placed, overflow } = placeInRoom(many)
    expect(new Set(placed.map((p) => p.slot.id)).size).toBe(placed.length)
    expect(placed.length + overflow.length).toBe(30)
    expect(placed.length).toBeLessThanOrEqual(ROOM_SLOTS.length)
    expect(overflow.length).toBeGreaterThan(0)
  })
})
