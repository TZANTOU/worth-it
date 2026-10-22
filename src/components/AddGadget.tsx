import { useState } from 'react'
import type { GadgetDraft } from '../types'
import type { ProductHit } from '../lib/productSearch'
import { categoryFromTags } from '../lib/categories'
import { db } from '../db'
import { Modal } from './Modal'
import { ProductSearch } from './ProductSearch'
import { GadgetForm } from './GadgetForm'

type Start = Pick<GadgetDraft, 'name' | 'category' | 'brand' | 'offCode' | 'wikidataId' | 'imageUrl' | 'releaseDate'>

export function AddGadget({ onClose }: { onClose: () => void }) {
  const [start, setStart] = useState<Start | null>(null)

  function pick(hit: ProductHit) {
    setStart({
      name: hit.brand && !hit.name.toLowerCase().includes(hit.brand.toLowerCase()) ? `${hit.brand} ${hit.name}` : hit.name,
      brand: hit.brand,
      category: hit.category,
      offCode: hit.id.startsWith('barcode:') ? hit.id.slice('barcode:'.length) : undefined,
      wikidataId: hit.id.startsWith('wikidata:') ? hit.id.slice('wikidata:'.length) : undefined,
      imageUrl: hit.imageUrl,
      releaseDate: hit.releaseDate,
    })
  }

  async function save(draft: GadgetDraft) {
    await db.gadgets.add({ ...draft, createdAt: Date.now() })
    onClose()
  }

  return (
    <Modal title={start ? 'A few questions' : 'Add a gadget'} onClose={onClose}>
      {start ? (
        <GadgetForm initial={start} submitLabel="Put it on the shelf" onSubmit={save} onBack={() => setStart(null)} />
      ) : (
        <ProductSearch onPick={pick} onManual={(name) => setStart({ name, category: categoryFromTags([], name) })} />
      )}
    </Modal>
  )
}
