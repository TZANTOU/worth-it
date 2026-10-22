import type { Category } from '../types'
import { ART, L } from './gadgetDrawings'

interface Props {
  category: Category
  size?: number
}

export function GadgetArt({ category, size }: Props) {
  return (
    <svg className="gadget-art" viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <g className="ink" filter="url(#hand-drawn)">
        {ART[category]}
      </g>
      {/* Comic "wiggle" marks, only visible while hovered. */}
      <g className="ink motion-marks">
        <path {...L} d="M6 52 Q2 60 6 68" />
        <path {...L} d="M0 48 Q-5 60 0 72" />
        <path {...L} d="M94 52 Q98 60 94 68" />
        <path {...L} d="M100 48 Q105 60 100 72" />
      </g>
    </svg>
  )
}

/** One-off SVG defs shared by every drawing: a slight wobble so lines look hand-inked. */
export function InkDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <filter id="hand-drawn">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="1.6" />
      </filter>
    </svg>
  )
}
