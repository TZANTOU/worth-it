import { useEffect, useState } from 'react'
import { searchProducts, type ProductHit } from '../lib/openProducts'
import { CATEGORIES } from '../lib/categories'

interface Props {
  onPick: (hit: ProductHit) => void
  onManual: (name: string) => void
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; hits: ProductHit[] }
  | { status: 'error'; message: string }

export function ProductSearch({ onPick, onManual }: Props) {
  const [query, setQuery] = useState('')
  const [result, setState] = useState<State>({ status: 'idle' })
  // Queries too short to search show nothing, whatever the last search returned.
  const state: State = query.trim().length < 2 ? { status: 'idle' } : result

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setState({ status: 'loading' })
      searchProducts(q, controller.signal)
        .then((hits) => setState({ status: 'done', hits }))
        .catch((err: unknown) => {
          if (controller.signal.aborted) return
          setState({ status: 'error', message: err instanceof Error ? err.message : 'Search failed' })
        })
    }, 400)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  return (
    <div className="search">
      <label className="field">
        <span>Search Open Products Facts</span>
        <input
          autoFocus
          type="search"
          placeholder="e.g. headphones, Bose, or a barcode"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      {state.status === 'loading' && <p className="muted">Searching…</p>}
      {state.status === 'error' && <p className="error">{state.message}</p>}
      {state.status === 'done' && state.hits.length === 0 && (
        <p className="muted">Nothing found. The open catalogue is still small; you can add it by hand.</p>
      )}

      {state.status === 'done' && state.hits.length > 0 && (
        <ul className="results">
          {state.hits.map((hit) => (
            <li key={hit.code}>
              <button className="result" onClick={() => onPick(hit)}>
                {hit.imageUrl ? <img src={hit.imageUrl} alt="" loading="lazy" /> : <span className="thumb-empty" />}
                <span className="result-text">
                  <strong>{hit.name}</strong>
                  <small>
                    {[hit.brand, CATEGORIES[hit.category].label].filter(Boolean).join(' · ')}
                  </small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button className="link-button" onClick={() => onManual(query.trim())}>
        Can’t find it? Add it by hand →
      </button>
    </div>
  )
}
