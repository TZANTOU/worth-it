import type { Category } from '../types'
import { lookupBarcode } from './openProducts'
import { searchWikidata } from './wikidata'

export interface ProductHit {
  /** "wikidata:Q…" or "barcode:…", so we know where a gadget came from. */
  id: string
  name: string
  brand?: string
  description?: string
  imageUrl?: string
  category: Category
  /** ISO date the product came out, when known. */
  releaseDate?: string
}

/** A query of only 8–14 digits is treated as a barcode. */
const BARCODE = /^\d{8,14}$/

/**
 * Names go to Wikidata, which knows most consumer electronics by model name.
 * Barcodes go to Open Products Facts, which is the one that stores them.
 */
export function searchProducts(query: string, signal?: AbortSignal): Promise<ProductHit[]> {
  const q = query.trim()
  if (!q) return Promise.resolve([])
  return BARCODE.test(q) ? lookupBarcode(q, signal) : searchWikidata(q, signal)
}
