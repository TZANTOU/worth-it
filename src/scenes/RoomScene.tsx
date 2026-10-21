import type { SceneProps } from './types'
import { placeInRoom, ROOM_SIZES } from './roomLayout'
import { GadgetFigure } from '../components/GadgetFigure'
import { ShelfScene } from './ShelfScene'
import './RoomScene.css'

const L = { pathLength: 1 }

/** The room itself, drawn in the same single ink line as the gadgets (1000×600 view box). */
function RoomBackdrop() {
  return (
    <svg className="room-backdrop" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
      <g className="ink" filter="url(#hand-drawn)">
        {/* Floor and wall corners */}
        <path {...L} d="M0 528 L1000 528" />
        <path {...L} d="M40 0 L40 528 L0 584 M960 0 L960 528 L1000 584" />
        <path {...L} d="M120 560 L250 560 M600 576 L770 576 M840 552 L930 552" />

        {/* Window with a small cloud, and its sill */}
        <rect {...L} x="100" y="72" width="180" height="198" rx="2" />
        <path {...L} d="M190 72 L190 270 M100 171 L280 171" />
        <path {...L} d="M122 128 q8 -16 24 -8 q10 -14 26 -2 q16 -2 12 14 Z" />
        <path {...L} d="M86 276 L294 276 M92 276 L92 284 L288 284 L288 276" />

        {/* Plant */}
        <path {...L} d="M128 528 L133 486 L173 486 L178 528" />
        <path {...L} d="M153 486 C143 452 118 448 112 430 M153 486 C152 444 162 424 172 408 M153 486 C168 462 190 458 196 442" />

        {/* Desk with a drawer */}
        <path {...L} d="M320 372 L620 372 L620 382 L320 382 Z" />
        <path {...L} d="M335 382 L335 528 M605 382 L605 528" />
        <rect {...L} x="520" y="382" width="85" height="50" />
        <path {...L} d="M552 407 L572 407" />

        {/* Two floating wall shelves */}
        <path {...L} d="M640 132 L900 132 M660 132 L660 144 L672 144 M880 132 L880 144 L868 144" />
        <path {...L} d="M640 228 L900 228 M660 228 L660 240 L672 240 M880 228 L880 240 L868 240" />

        {/* Media console */}
        <rect {...L} x="660" y="444" width="260" height="70" rx="3" />
        <path {...L} d="M790 444 L790 514 M676 514 L676 528 M904 514 L904 528" />
        <circle {...L} cx="780" cy="479" r="3" />
        <circle {...L} cx="800" cy="479" r="3" />
      </g>
    </svg>
  )
}

/** A sticky note pinned to the wall: the room's way to add a gadget. */
function AddNote({ onAdd }: { onAdd: () => void }) {
  return (
    <button className="room-note" onClick={onAdd}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <g className="ink" filter="url(#hand-drawn)">
          <path {...L} d="M10 12 L90 8 L92 88 L14 92 Z" />
          <circle {...L} cx="50" cy="14" r="4" />
        </g>
      </svg>
      <span>+ add a gadget</span>
    </button>
  )
}

export function RoomScene({ gadgets, onSelect, onAdd }: SceneProps) {
  const { placed, overflow } = placeInRoom(gadgets)

  return (
    <>
      <div className="room-scroll">
        <div className="room">
          <RoomBackdrop />
          <AddNote onAdd={onAdd} />
          {placed.map(({ gadget, slot }) => (
            <div
              key={gadget.id}
              className="room-item"
              style={{ left: `${slot.x}%`, bottom: `${100 - slot.y}%`, width: `${ROOM_SIZES[gadget.category]}%` }}
            >
              <GadgetFigure gadget={gadget} onSelect={onSelect} bubble />
            </div>
          ))}
        </div>
      </div>

      {overflow.length > 0 && (
        <section className="room-overflow">
          <h2>Didn’t fit in the room</h2>
          <ShelfScene gadgets={overflow} onSelect={onSelect} />
        </section>
      )}
    </>
  )
}
