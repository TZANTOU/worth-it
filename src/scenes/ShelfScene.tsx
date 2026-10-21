import type { SceneProps } from './types'
import { percent } from '../lib/format'
import { GadgetFigure } from '../components/GadgetFigure'
import { Meter } from '../components/Meter'
import './ShelfScene.css'

type Props = Omit<SceneProps, 'onAdd'> & { onAdd?: () => void }

/**
 * The inventory as one continuous ink line: every gadget stands on its own segment of it,
 * and the segments run into each other like a skyline. Without onAdd there is no add tile.
 */
export function ShelfScene({ gadgets, onSelect, onAdd }: Props) {
  return (
    <ul className="shelf">
      {gadgets.map((g) => (
        <li key={g.id}>
          <GadgetFigure
            gadget={g}
            onSelect={onSelect}
            size={110}
            label={(s) => (
              <span className="gadget-label">
                <span className="gadget-name">{g.name}</span>
                <span className="gadget-percent">{percent(s.fulfilment)}</span>
                <Meter value={s.fulfilment} />
              </span>
            )}
          />
        </li>
      ))}
      {onAdd && (
        <li>
          <button className="gadget gadget-add" onClick={onAdd}>
            <span className="gadget-stage">
              <svg className="gadget-art" viewBox="0 0 100 100" width={110} height={110} aria-hidden="true">
                <g className="ink" filter="url(#hand-drawn)">
                  <path pathLength={1} d="M50 62 L50 90 M36 76 L64 76" />
                </g>
              </svg>
            </span>
            <span className="gadget-label">
              <span className="gadget-name">Add a gadget</span>
            </span>
          </button>
        </li>
      )}
    </ul>
  )
}
