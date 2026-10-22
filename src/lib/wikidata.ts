import { categoryFromTags } from './categories'
import type { ProductHit } from './productSearch'

const API = 'https://www.wikidata.org/w/api.php'

interface Snak {
  mainsnak: { datavalue?: { value: unknown } }
}

export interface Entity {
  id: string
  labels?: Record<string, { value: string }>
  descriptions?: Record<string, { value: string }>
  claims?: Record<string, Snak[]>
}

async function call<T>(params: Record<string, string>, signal?: AbortSignal): Promise<T> {
  // origin=* is what lets the browser call the API directly (CORS).
  const query = new URLSearchParams({ ...params, format: 'json', origin: '*' })
  const res = await fetch(`${API}?${query}`, { signal })
  if (!res.ok) throw new Error(`Wikidata returned ${res.status}`)
  return res.json() as Promise<T>
}

/** Fetches entities in batches of 50, the most the API takes per request. */
async function getEntities(ids: string[], props: string, signal?: AbortSignal): Promise<Record<string, Entity>> {
  const batches = Array.from({ length: Math.ceil(ids.length / 50) }, (_, i) => ids.slice(i * 50, i * 50 + 50))
  const bodies = await Promise.all(
    batches.map((batch) =>
      call<{ entities: Record<string, Entity> }>(
        // "mul" holds the language-neutral label many products use, like "PlayStation 5".
        { action: 'wbgetentities', ids: batch.join('|'), props, languages: 'en|mul', languagefallback: '1' },
        signal,
      ),
    ),
  )
  return Object.assign({}, ...bodies.map((b) => b.entities))
}

const itemIds = (e: Entity, prop: string): string[] =>
  (e.claims?.[prop] ?? [])
    .map((c) => (c.mainsnak.datavalue?.value as { id?: string } | undefined)?.id)
    .filter((id): id is string => !!id)

const firstString = (e: Entity, prop: string) =>
  e.claims?.[prop]?.[0]?.mainsnak.datavalue?.value as string | undefined

const firstTime = (e: Entity, prop: string) =>
  (e.claims?.[prop]?.[0]?.mainsnak.datavalue?.value as { time?: string } | undefined)?.time

const labelOf = (e?: Entity) => e?.labels?.en?.value ?? e?.labels?.mul?.value

/** "Apple Inc." → "Apple", "Sony Interactive Entertainment" → "Sony", as people would say it. */
export function shortBrand(name?: string): string | undefined {
  if (!name) return undefined
  const suffix = /[\s,]+(inc\.?|corporation|corp\.?|group|ltd\.?|limited|co\.|company|gmbh|ag|s\.?a\.?|electronics|interactive entertainment)$/i
  let short = name.trim()
  while (suffix.test(short)) short = short.replace(suffix, '')
  return short || name
}
const descriptionOf = (e: Entity) => e.descriptions?.en?.value ?? ''

/** Products are typed "smartphone model", "earbuds model", "product model"… */
const PRODUCT_TYPE = /\bmodel( series)?$/i
/** …but chips and software are typed as models too, and aren't gadgets you own. */
const NOT_A_GADGET = /chip|cpu|processor|graphics|operating system|software|engine|font|\b(car|automobile|aircraft|vehicle)\b/i
/** For products we can't place in a category, keep only the ones that are clearly electronics. */
const ELECTRONICS = /electronic|device|gadget|drone|e-reader|reader|console|controller|keyboard|mouse|router|player|headset|vr|computer/i

/** Turns raw search results into gadgets, dropping articles, podcasts, categories and the like. */
export function toHits(ids: string[], items: Record<string, Entity>, related: Record<string, Entity>): ProductHit[] {
  const hits: ProductHit[] = []
  for (const id of ids) {
    const e = items[id]
    const name = labelOf(e)
    if (!e || !name) continue

    const types = itemIds(e, 'P31').map((t) => labelOf(related[t]) ?? '')
    if (!types.some((t) => PRODUCT_TYPE.test(t)) || types.some((t) => NOT_A_GADGET.test(t))) continue

    const description = descriptionOf(e)
    const category = categoryFromTags([...types, description], name)
    if (category === 'other' && !ELECTRONICS.test(`${types.join(' ')} ${description}`)) continue

    // Manufacturer or developer is the company ("Apple"); "brand" is often a product line ("MacBook").
    const brandId = itemIds(e, 'P176')[0] ?? itemIds(e, 'P178')[0] ?? itemIds(e, 'P1716')[0]
    const image = firstString(e, 'P18')
    // Times look like "+2025-09-19T00:00:00Z"; month or year precision still starts that way.
    const released = (firstTime(e, 'P577') ?? firstTime(e, 'P571'))?.slice(1, 11)

    hits.push({
      id: `wikidata:${id}`,
      name,
      // Last resort: descriptions like "wireless earbuds developed by Apple".
      brand: shortBrand(labelOf(related[brandId ?? '']) ?? description.match(/\b(?:by|from) ([A-Z][\w&-]+)/)?.[1]),
      description,
      category,
      imageUrl: image ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(image)}?width=120` : undefined,
      releaseDate: released && /^\d{4}-\d{2}-\d{2}$/.test(released) ? released.replace(/-00/g, '-01') : undefined,
    })
  }
  return hits
}

export async function searchWikidata(query: string, signal?: AbortSignal): Promise<ProductHit[]> {
  // Full-text search matches words in any order, so "airpods 3 pro" finds "AirPods Pro 3".
  const found = await call<{ query: { search: { title: string }[] } }>(
    { action: 'query', list: 'search', srsearch: query, srnamespace: '0', srlimit: '30' },
    signal,
  )
  const ids = found.query.search.map((s) => s.title)
  const items = await getEntities(ids, 'labels|descriptions|claims', signal)

  // One more round trip for the names of the types and brands the items point to.
  const relatedIds = new Set<string>()
  for (const e of Object.values(items)) {
    for (const id of [...itemIds(e, 'P31'), ...itemIds(e, 'P176'), ...itemIds(e, 'P178'), ...itemIds(e, 'P1716')]) {
      relatedIds.add(id)
    }
  }
  const related = await getEntities([...relatedIds], 'labels', signal)

  return toHits(ids, items, related)
}
