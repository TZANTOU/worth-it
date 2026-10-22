import { useEffect, useState } from 'react'
import type { Gadget } from '../types'
import { Modal } from './Modal'

const FILE_NAME = 'worth-it.png'

type State = { status: 'drawing' } | { status: 'ready'; blob: Blob; url: string } | { status: 'error'; message: string }

/** Draws the comic card and offers the ways to get it out: share sheet, download, clipboard. */
export function ShareDialog({ gadgets, onClose }: { gadgets: Gadget[]; onClose: () => void }) {
  const [state, setState] = useState<State>({ status: 'drawing' })
  const [note, setNote] = useState<string | null>(null)

  useEffect(() => {
    let url: string | null = null
    let cancelled = false
    // Loaded on demand: the card code brings react-dom/server along, which the rest of the app doesn't need.
    import('../lib/shareCard')
      .then(({ renderShareCard }) => renderShareCard(gadgets))
      .then((blob) => {
        if (cancelled) return
        url = URL.createObjectURL(blob)
        setState({ status: 'ready', blob, url })
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ status: 'error', message: err instanceof Error ? err.message : 'Could not draw the card' })
      })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [gadgets])

  const file = state.status === 'ready' ? new File([state.blob], FILE_NAME, { type: 'image/png' }) : null
  const canShare = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })
  const canCopy = typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write

  async function share() {
    try {
      await navigator.share({ files: [file!], title: 'Worth it?', text: 'Were my gadgets worth it?' })
    } catch (err) {
      // Closing the share sheet counts as an error; only report real failures.
      if (err instanceof Error && err.name !== 'AbortError') setNote('Sharing didn’t work here. Try downloading it instead.')
    }
  }

  async function copy() {
    if (state.status !== 'ready') return
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': state.blob })])
      setNote('Copied. Paste it into a post or chat.')
    } catch {
      setNote('Couldn’t copy here. Try downloading it instead.')
    }
  }

  return (
    <Modal title="Share your shelf" onClose={onClose}>
      <div className="share">
        {state.status === 'drawing' && <p className="muted">Inking the panels…</p>}
        {state.status === 'error' && <p className="error">{state.message}</p>}
        {state.status === 'ready' && (
          <>
            <img className="share-preview" src={state.url} alt="Comic page of your gadgets with their scores" />
            {note && <p className="share-note">{note}</p>}
            <div className="form-actions">
              {canCopy && (
                <button className="button ghost" onClick={copy}>
                  Copy image
                </button>
              )}
              <a className="button ghost" href={state.url} download={FILE_NAME}>
                Download
              </a>
              {canShare && (
                <button className="button" onClick={share}>
                  Share…
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
