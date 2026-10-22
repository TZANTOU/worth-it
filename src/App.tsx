import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { scoreGadget } from './lib/scoring'
import { money, percent } from './lib/format'
import { InkDefs } from './components/GadgetArt'
import { ScenePicker } from './components/ScenePicker'
import { SCENES } from './scenes'
import { useScene } from './lib/preferences'
import { AddGadget } from './components/AddGadget'
import { GadgetDetail } from './components/GadgetDetail'
import { CheckInPrompt } from './components/CheckInPrompt'
import { ShareDialog } from './components/ShareDialog'

export default function App() {
  const gadgets = useLiveQuery(() => db.gadgets.orderBy('createdAt').toArray())
  const [scene, setScene] = useScene()
  const [adding, setAdding] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = gadgets?.find((g) => g.id === selectedId)

  const totalSpent = gadgets?.reduce((sum, g) => sum + g.price, 0) ?? 0
  // Weighted by price, so an unused €1000 laptop matters more than unused €20 earbuds.
  const overall =
    gadgets && totalSpent > 0
      ? gadgets.reduce((sum, g) => sum + Math.min(100, scoreGadget(g).fulfilment) * g.price, 0) / totalSpent
      : 0

  const Scene = SCENES[scene].Component

  return (
    <>
      <InkDefs />
      <header className="top">
        <h1>Worth it?</h1>
        <div className="top-actions">
          <ScenePicker value={scene} onChange={setScene} />
          {gadgets && gadgets.length > 0 && (
            <button className="button ghost share-button" onClick={() => setSharing(true)}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M12 3 L12 15 M7 8 L12 3 L17 8 M5 13 L5 20 L19 20 L19 13" />
              </svg>
              Share
            </button>
          )}
        </div>
        {gadgets && gadgets.length > 0 && (
          <p className="summary">
            {gadgets.length} gadget{gadgets.length === 1 ? '' : 's'} · {money(totalSpent)} spent ·{' '}
            <strong>{percent(overall)}</strong> of it earned back in use
          </p>
        )}
      </header>

      <main>
        {gadgets && gadgets.length === 0 && (
          <p className="empty">Your shelf is empty. Add the first gadget and see if it was worth the money.</p>
        )}
        {gadgets && <CheckInPrompt gadgets={gadgets} />}
        {/* Keyed by scene so switching redraws the lines from scratch. */}
        {gadgets && (
          <Scene key={scene} gadgets={gadgets} onSelect={(g) => setSelectedId(g.id!)} onAdd={() => setAdding(true)} />
        )}
      </main>

      <footer className="credits">
        Product data from <a href="https://www.wikidata.org" target="_blank" rel="noreferrer">Wikidata</a> (CC0) and, for
        barcodes, <a href="https://world.openproductsfacts.org" target="_blank" rel="noreferrer">Open Products Facts</a> (ODbL).
        Your inventory stays in this browser.
      </footer>

      {adding && <AddGadget onClose={() => setAdding(false)} />}
      {sharing && gadgets && <ShareDialog gadgets={gadgets} onClose={() => setSharing(false)} />}
      {selected && <GadgetDetail key={selected.id} gadget={selected} onClose={() => setSelectedId(null)} />}
    </>
  )
}
