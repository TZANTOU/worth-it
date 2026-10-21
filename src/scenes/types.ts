import type { Gadget } from '../types'

/** Every scene draws the same inventory; only the setting changes. */
export interface SceneProps {
  gadgets: Gadget[]
  onSelect: (g: Gadget) => void
  onAdd: () => void
}
