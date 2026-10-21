import type { ReactNode } from 'react'
import type { Category } from '../types'

/*
 * Each drawing sits in a 100×100 box and stands on y = 100, so every gadget rests on
 * the shelf line. Shapes carry pathLength={1} so CSS can "draw" them with one dash.
 */
const L = { pathLength: 1 }

const ART: Record<Category, ReactNode> = {
  headphones: (
    <>
      <path {...L} d="M24 64 C24 16 76 16 76 64" />
      <path {...L} d="M30 62 C30 26 70 26 70 62" />
      <rect {...L} x="16" y="62" width="14" height="36" rx="6" />
      <rect {...L} x="70" y="62" width="14" height="36" rx="6" />
      <path {...L} d="M30 70 L34 70 L34 90 L30 90 M70 70 L66 70 L66 90 L70 90" />
    </>
  ),
  phone: (
    <>
      <rect {...L} x="32" y="20" width="36" height="80" rx="7" />
      <path {...L} d="M45 26 L55 26" />
      <rect {...L} x="36" y="32" width="28" height="56" rx="2" />
      <circle {...L} cx="50" cy="94" r="2.5" />
    </>
  ),
  laptop: (
    <>
      <rect {...L} x="20" y="36" width="60" height="46" rx="3" />
      <rect {...L} x="25" y="41" width="50" height="36" rx="1" />
      <path {...L} d="M20 82 L80 82 L90 98 Q90 100 88 100 L12 100 Q10 100 10 98 Z" />
      <path {...L} d="M42 92 L58 92" />
    </>
  ),
  tablet: (
    <>
      <rect {...L} x="24" y="24" width="52" height="76" rx="6" />
      <rect {...L} x="29" y="31" width="42" height="60" rx="2" />
      <circle {...L} cx="50" cy="95.5" r="2" />
    </>
  ),
  console: (
    <>
      <path {...L} d="M24 70 C10 70 6 98 18 99 C26 100 30 88 40 86 L60 86 C70 88 74 100 82 99 C94 98 90 70 76 70 Z" />
      <path {...L} d="M29 74 L29 84 M24 79 L34 79" />
      <circle {...L} cx="70" cy="76" r="2" />
      <circle {...L} cx="76" cy="81" r="2" />
      <circle {...L} cx="43" cy="80" r="3" />
      <circle {...L} cx="57" cy="80" r="3" />
    </>
  ),
  camera: (
    <>
      <path {...L} d="M36 52 L40 42 L60 42 L64 52" />
      <rect {...L} x="14" y="52" width="72" height="47" rx="5" />
      <circle {...L} cx="50" cy="76" r="15" />
      <circle {...L} cx="50" cy="76" r="8" />
      <rect {...L} x="72" y="58" width="8" height="5" rx="1" />
      <path {...L} d="M20 52 L20 48 L28 48 L28 52" />
    </>
  ),
  watch: (
    <>
      <path {...L} d="M41 36 L41 12 L59 12 L59 36" />
      <rect {...L} x="34" y="36" width="32" height="38" rx="9" />
      <path {...L} d="M41 74 L41 100 M59 74 L59 100" />
      <path {...L} d="M66 50 L70 50 L70 60 L66 60" />
      <path {...L} d="M50 55 L50 45 M50 55 L57 59" />
    </>
  ),
  speaker: (
    <>
      <rect {...L} x="30" y="28" width="40" height="72" rx="6" />
      <circle {...L} cx="50" cy="46" r="7" />
      <circle {...L} cx="50" cy="78" r="13" />
      <circle {...L} cx="50" cy="78" r="4" />
    </>
  ),
  tv: (
    <>
      <rect {...L} x="8" y="26" width="84" height="54" rx="3" />
      <rect {...L} x="13" y="31" width="74" height="44" rx="1" />
      <path {...L} d="M30 80 L24 100 M70 80 L76 100" />
      <path {...L} d="M40 18 L50 26 L60 14" />
    </>
  ),
  other: (
    <>
      <rect {...L} x="26" y="44" width="48" height="56" rx="4" />
      <path {...L} d="M53 52 L42 72 L52 72 L46 92" />
      <path {...L} d="M38 44 L38 36 M62 44 L62 36" />
    </>
  ),
}

interface Props {
  category: Category
  size?: number
}

export function GadgetArt({ category, size = 110 }: Props) {
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
