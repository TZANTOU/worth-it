import type { Category } from '../types'
import { categoryFromTags } from './categories'

const BASE = 'https://world.openproductsfacts.org'
const FIELDS = 'code,product_name,brands,categories_tags,image_front_small_url'

export interface ProductHit {
  code: string
  name: string
  brand?: string
  imageUrl?: string
  category: Category
}

interface RawProduct {
  code: string
  product_name?: string
  brands?: string
  categories_tags?: string[]
  image_front_small_url?: string
}

function toHit(p: RawProduct): ProductHit {
  const name = p.product_name?.trim() || 'Unnamed product'
  return {
    code: p.code,
    name,
    brand: p.brands?.split(',')[0].trim() || undefined,
    imageUrl: p.image_front_small_url,
    category: categoryFromTags(p.categories_tags, name),
  }
}

/** A query of only 8–14 digits is treated as a barcode. */
const BARCODE = /^\d{8,14}$/

export async function searchProducts(query: string, signal?: AbortSignal): Promise<ProductHit[]> {
  const q = query.trim()
  if (!q) return []

  if (BARCODE.test(q)) {
    const res = await fetch(`${BASE}/api/v2/product/${q}?fields=${FIELDS}`, { signal })
    if (!res.ok) return []
    const body = (await res.json()) as { status: number; product?: RawProduct }
    return body.status === 1 && body.product ? [toHit({ ...body.product, code: q })] : []
  }

  const hits = await searchTerms(q, signal)
  const words = q.toLowerCase().split(/\s+/)
  if (hits.length > 0 || words.length === 1) return hits

  // The search only matches products containing every word, and the catalogue is small,
  // so "sony headphones" finds nothing. Fall back to each word and rank by how many match.
  const perWord = await Promise.all(words.map((w) => searchTerms(w, signal)))
  const byCode = new Map(perWord.flat().map((h) => [h.code, h]))
  const matches = (h: ProductHit) => {
    const text = `${h.name} ${h.brand ?? ''} ${h.category}`.toLowerCase()
    return words.filter((w) => text.includes(w)).length
  }
  return [...byCode.values()].sort((a, b) => matches(b) - matches(a))
}

async function searchTerms(terms: string, signal?: AbortSignal): Promise<ProductHit[]> {
  const params = new URLSearchParams({
    search_terms: terms,
    search_simple: '1',
    json: '1',
    page_size: '24',
    fields: FIELDS,
  })
  const res = await fetch(`${BASE}/cgi/search.pl?${params}`, { signal })
  if (!res.ok) throw new Error(`Open Products Facts returned ${res.status}`)
  const body = (await res.json()) as { products: RawProduct[] }
  return body.products.filter((p) => p.product_name).map(toHit)
}
