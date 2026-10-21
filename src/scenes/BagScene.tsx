import type { SceneProps } from './types'
import { money, percent } from '../lib/format'
import { GadgetFigure } from '../components/GadgetFigure'
import { Meter } from '../components/Meter'
import './BagScene.css'

/** Compartment codes like a parts organiser: A1…A4, B1…, so each slot has an ID. */
function slotCode(index: number, perRow = 4) {
  return `${String.fromCharCode(65 + Math.floor(index / perRow))}${(index % perRow) + 1}`
}

export function BagScene({ gadgets, onSelect, onAdd }: SceneProps) {
  const total = gadgets.reduce((sum, g) => sum + g.price, 0)

  return (
    <div className="bag">
      <div className="bag-zip" aria-hidden="true">
        <span className="bag-zip-pull" />
      </div>

      <div className="bag-inside">
        <p className="bag-readout">
          <span>TECH POUCH</span>
          <span>
            {String(gadgets.length).padStart(2, '0')} ITEMS · {money(total)}
          </span>
        </p>

        <ul className="bag-grid">
          {gadgets.map((g, i) => (
            <li key={g.id} className="bag-slot">
              <GadgetFigure
                gadget={g}
                onSelect={onSelect}
                label={(s) => (
                  <>
                    <span className="bag-tag bag-tag-code">{slotCode(i)}</span>
                    <span className="bag-tag bag-tag-score">{percent(s.fulfilment)}</span>
                    <span className="bag-strap" aria-hidden="true" />
                    <span className="bag-label">
                      <span className="bag-name">{g.name}</span>
                      <Meter value={s.fulfilment} />
                    </span>
                  </>
                )}
              />
            </li>
          ))}
          <li className="bag-slot bag-slot-empty">
            <button className="gadget" onClick={onAdd}>
              <span className="bag-tag bag-tag-code">{slotCode(gadgets.length)}</span>
              <span className="bag-empty-text">+ EMPTY SLOT</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
