import type { Gadget } from '../types'
import { scoreGadget } from '../lib/scoring'
import { percent } from '../lib/format'
import { GadgetArt } from './GadgetArt'
import { Meter } from './Meter'

interface Props {
  gadgets: Gadget[]
  onSelect: (g: Gadget) => void
  onAdd: () => void
}

/**
 * The inventory as one continuous ink line: every gadget stands on its own segment of it,
 * and the segments run into each other like a skyline.
 */
export function Shelf({ gadgets, onSelect, onAdd }: Props) {
  return (
    <ul className="shelf">
      {gadgets.map((g) => {
        const s = scoreGadget(g)
        return (
          <li key={g.id}>
            <button className={`gadget verdict-${s.verdict}`} data-category={g.category} onClick={() => onSelect(g)}>
              <span className="gadget-stage">
                <GadgetArt category={g.category} />
              </span>
              <span className="gadget-label">
                <span className="gadget-name">{g.name}</span>
                <span className="gadget-percent">{percent(s.fulfilment)}</span>
                <Meter value={s.fulfilment} />
              </span>
            </button>
          </li>
        )
      })}
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
    </ul>
  )
}
