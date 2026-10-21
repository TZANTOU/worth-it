import type { Category, Gadget } from '../types'

export type Zone = 'desk-center' | 'desk' | 'shelf' | 'sill' | 'tv-stand' | 'floor'

/** A spot in the room. x is the centre and y the surface the gadget stands on, both in % of the room. */
export interface Slot {
  id: string
  zone: Zone
  x: number
  y: number
}

// Matches the furniture drawn in RoomScene (a 1000×600 view box, so 1% = 10 × 6 units).
export const ROOM_SLOTS: Slot[] = [
  { id: 'desk-c', zone: 'desk-center', x: 47, y: 62 },
  { id: 'desk-l', zone: 'desk', x: 36, y: 62 },
  { id: 'desk-r', zone: 'desk', x: 58, y: 62 },
  { id: 'tv', zone: 'tv-stand', x: 79, y: 74 },
  { id: 'shelf-1a', zone: 'shelf', x: 68, y: 22 },
  { id: 'shelf-1b', zone: 'shelf', x: 76.5, y: 22 },
  { id: 'shelf-1c', zone: 'shelf', x: 85, y: 22 },
  { id: 'shelf-2a', zone: 'shelf', x: 68, y: 38 },
  { id: 'shelf-2b', zone: 'shelf', x: 76.5, y: 38 },
  { id: 'shelf-2c', zone: 'shelf', x: 85, y: 38 },
  { id: 'sill-a', zone: 'sill', x: 14, y: 46 },
  { id: 'sill-b', zone: 'sill', x: 24, y: 46 },
  { id: 'floor-a', zone: 'floor', x: 26, y: 88 },
  { id: 'floor-b', zone: 'floor', x: 40, y: 88 },
  { id: 'floor-c', zone: 'floor', x: 48, y: 88 },
]

/** Where each kind of gadget would naturally live, best spot first. */
const PREFERRED_ZONES: Record<Category, Zone[]> = {
  tv: ['tv-stand', 'floor'],
  laptop: ['desk-center', 'desk', 'floor'],
  tablet: ['desk', 'desk-center', 'shelf', 'sill'],
  phone: ['desk', 'sill', 'shelf', 'desk-center'],
  watch: ['sill', 'desk', 'shelf'],
  headphones: ['desk', 'shelf', 'desk-center', 'floor'],
  camera: ['shelf', 'sill', 'desk'],
  speaker: ['shelf', 'floor', 'desk'],
  console: ['floor', 'shelf', 'desk'],
  other: ['shelf', 'floor', 'sill', 'desk'],
}

/** Drawing width in % of the room, so a TV looks bigger than a watch. */
export const ROOM_SIZES: Record<Category, number> = {
  tv: 18,
  laptop: 13,
  headphones: 8,
  console: 8,
  camera: 7.5,
  tablet: 6.5,
  other: 6.5,
  speaker: 6,
  phone: 4.5,
  watch: 4,
}

export interface RoomLayout {
  placed: { gadget: Gadget; slot: Slot }[]
  /** Gadgets with no free spot left; the scene shows them elsewhere. */
  overflow: Gadget[]
}

/** Most expensive gadgets choose first, so the big purchases get the best spots. */
export function placeInRoom(gadgets: Gadget[]): RoomLayout {
  const free = new Set(ROOM_SLOTS)
  const layout: RoomLayout = { placed: [], overflow: [] }
  const byPrice = [...gadgets].sort((a, b) => b.price - a.price || a.createdAt - b.createdAt)

  for (const gadget of byPrice) {
    const slot = PREFERRED_ZONES[gadget.category]
      .flatMap((zone) => [...free].filter((s) => s.zone === zone))
      .at(0)
    if (slot) {
      free.delete(slot)
      layout.placed.push({ gadget, slot })
    } else {
      layout.overflow.push(gadget)
    }
  }
  return layout
}
