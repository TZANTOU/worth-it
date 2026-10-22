import { categoryFromTags } from './categories'
import type { ProductHit } from './productSearch'

const BASE = 'https://world.openproductsfacts.org'
const FIELDS = 'code,product_name,brands,categories_tags,image_front_small_url'

interface RawProduct {
  product_name?: string
  brands?: string
  categories_tags?: string[]
  image_front_small_url?: string
}

/** Exact barcode lookup. Its text search is too sparse for gadgets, so names go to Wikidata instead. */
export async function lookupBarcode(code: string, signal?: AbortSignal): Promise<ProductHit[]> {
  const res = await fetch(`${BASE}/api/v2/product/${code}?fields=${FIELDS}`, { signal })
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`Open Products Facts returned ${res.status}`)
  const body = (await res.json()) as { status: number; product?: RawProduct }
  const p = body.product
  if (body.status !== 1 || !p?.product_name) return []

  const name = p.product_name.trim()
  return [
    {
      id: `barcode:${code}`,
      name,
      brand: p.brands?.split(',')[0].trim() || undefined,
      imageUrl: p.image_front_small_url,
      category: categoryFromTags(p.categories_tags, name),
    },
  ]
}
