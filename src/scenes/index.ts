import type { ComponentType } from 'react'
import type { SceneId } from '../lib/preferences'
import type { SceneProps } from './types'
import { ShelfScene } from './ShelfScene'
import { RoomScene } from './RoomScene'
import { BagScene } from './BagScene'

export const SCENES: Record<SceneId, { label: string; Component: ComponentType<SceneProps> }> = {
  shelf: { label: 'Shelf', Component: ShelfScene },
  room: { label: 'Room', Component: RoomScene },
  bag: { label: 'Bag', Component: BagScene },
}
