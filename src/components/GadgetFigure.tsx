import type { ReactNode } from 'react'
import type { Gadget } from '../types'
import { scoreGadget, VERDICT_LABELS, type Score } from '../lib/scoring'
import { percent } from '../lib/format'
import { GadgetArt } from './GadgetArt'

interface Props {
  gadget: Gadget
  onSelect: (g: Gadget) => void
  /** Pixel size of the drawing; leave out to let the scene's CSS size it. */
  size?: number
  /** Show a comic speech bubble with the name and score on hover. */
  bubble?: boolean
  /** Scene-specific text under or around the drawing. */
  label?: (score: Score) => ReactNode
  className?: string
}

/** A clickable gadget drawing, shared by every scene so hover and click behave the same. */
export function GadgetFigure({ gadget, onSelect, size, bubble, label, className = '' }: Props) {
  const s = scoreGadget(gadget)
  return (
    <button
      className={`gadget verdict-${s.verdict} ${className}`}
      data-category={gadget.category}
      onClick={() => onSelect(gadget)}
      aria-label={`${gadget.name}, ${percent(s.fulfilment)}, ${VERDICT_LABELS[s.verdict]}`}
    >
      {bubble && (
        <span className="bubble" aria-hidden="true">
          <span className="bubble-name">{gadget.name}</span>
          <span className="bubble-score">
            <strong>{percent(s.fulfilment)}</strong> · {VERDICT_LABELS[s.verdict]}
          </span>
        </span>
      )}
      <span className="gadget-stage">
        <GadgetArt category={gadget.category} size={size} />
      </span>
      {label?.(s)}
    </button>
  )
}
