import { createElement, Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Category, Gadget } from '../types'
import { ART } from '../components/gadgetDrawings'
import { scoreGadget, VERDICT_LABELS, type Verdict } from './scoring'
import { money, percent } from './format'

/*
 * The share card: a comic page of your gadgets, drawn on a canvas so it can be saved as a PNG.
 * This module pulls in react-dom/server, so it is only loaded when someone opens the share dialog.
 */

const W = 1080
const H = 1350
const MARGIN = 40
const GUTTER = 22
const MAX_PANELS = 9

const PAPER = '#efe7d8'
const PAPER_DEEP = '#e2d6c0'
const INK = '#1f2b23'
const INK_SOFT = '#5d675f'
const VERDICT_COLOR: Record<Verdict, string> = {
  'paid-off': '#3f6b4a',
  'on-track': '#3f6b4a',
  'could-do-better': INK,
  'gathering-dust': '#9a4b35',
}

const HAND = "'Caveat', cursive"
const SANS = "'Inter', system-ui, sans-serif"

/** A tiny seeded random generator, so the hand-drawn wobble is the same every time. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** The gadget's line drawing as an image, with a heavier stroke for print. */
function artImage(category: Category): Promise<HTMLImageElement> {
  const inner = renderToStaticMarkup(createElement(Fragment, null, ART[category]))
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 116 116" width="600" height="600">` +
    `<filter id="hd"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7"/>` +
    `<feDisplacementMap in="SourceGraphic" scale="1.6"/></filter>` +
    `<g fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" filter="url(#hd)">${inner}</g></svg>`
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Could not draw ${category}`))
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  })
}

type Ctx = CanvasRenderingContext2D

/** A panel border with slightly uneven corners, like it was inked by hand. */
function inkRect(ctx: Ctx, x: number, y: number, w: number, h: number, rand: () => number, width = 6) {
  const j = () => (rand() - 0.5) * 5
  ctx.beginPath()
  ctx.moveTo(x + j(), y + j())
  ctx.lineTo(x + w + j(), y + j())
  ctx.lineTo(x + w + j(), y + h + j())
  ctx.lineTo(x + j(), y + h + j())
  ctx.closePath()
  ctx.lineWidth = width
  ctx.lineJoin = 'round'
  ctx.strokeStyle = INK
  ctx.stroke()
}

/** Shortens text with "…" until it fits the width. */
function fit(ctx: Ctx, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1)
  return `${t.trimEnd()}…`
}

/** Comic halftone: dots that shrink away from a corner. */
function halftone(ctx: Ctx, x: number, y: number, w: number, h: number) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.fillStyle = PAPER_DEEP
  const step = 16
  for (let dx = 0; dx < w; dx += step) {
    for (let dy = 0; dy < h; dy += step) {
      const fade = 1 - Math.hypot(w - dx, dy) / Math.hypot(w, h)
      const r = fade * 7
      if (r < 0.6) continue
      ctx.beginPath()
      ctx.arc(x + dx + (dy / step % 2) * (step / 2), y + dy, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

/** The "64%!" burst in the title panel. */
function burst(ctx: Ctx, cx: number, cy: number, outer: number, inner: number, spikes: number, rand: () => number) {
  ctx.beginPath()
  for (let i = 0; i < spikes * 2; i++) {
    const r = (i % 2 === 0 ? outer : inner) * (0.94 + rand() * 0.12)
    const a = (Math.PI * i) / spikes - Math.PI / 2
    const px = cx + Math.cos(a) * r
    const py = cy + Math.sin(a) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fillStyle = '#fbf6ec'
  ctx.fill()
  ctx.lineWidth = 5
  ctx.strokeStyle = INK
  ctx.lineJoin = 'round'
  ctx.stroke()
}

/** A speech bubble with a tail pointing down-left, at the gadget. */
function bubble(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, tailTo: [number, number]) {
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#fbf6ec'
  ctx.fill()
  ctx.lineWidth = 4
  ctx.strokeStyle = INK
  ctx.stroke()

  // Tail: two lines from the bubble's lower left out to a point, then paper over the seam.
  const a1 = Math.PI * 0.62
  const a2 = Math.PI * 0.76
  const p1: [number, number] = [cx + Math.cos(a1) * rx, cy + Math.sin(a1) * ry]
  const p2: [number, number] = [cx + Math.cos(a2) * rx, cy + Math.sin(a2) * ry]
  ctx.beginPath()
  ctx.moveTo(...p1)
  ctx.lineTo(...tailTo)
  ctx.lineTo(...p2)
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx - 2, ry - 2, 0, Math.PI * 0.55, Math.PI * 0.83)
  ctx.lineTo(cx, cy)
  ctx.fill()
}

function drawGadgetPanel(ctx: Ctx, g: Gadget, art: HTMLImageElement, x: number, y: number, w: number, h: number, rand: () => number) {
  const s = scoreGadget(g)
  const small = w < 400

  ctx.fillStyle = PAPER
  ctx.fillRect(x, y, w, h)

  // Ground line and the gadget standing on it, left of centre to leave room for the bubble.
  const ground = y + h - (small ? 52 : 70)
  const size = Math.min(w, h) * 0.52
  const artX = x + w * 0.36 - size / 2
  ctx.drawImage(art, artX, ground - size * (108 / 116), size, size)
  ctx.beginPath()
  ctx.moveTo(x + 18, ground)
  ctx.lineTo(x + w - 18, ground)
  ctx.lineWidth = 4
  ctx.strokeStyle = INK
  ctx.stroke()

  // Speech bubble with the score.
  const bx = x + w * 0.7
  const by = y + h * 0.3
  const rx = w * 0.24
  const ry = Math.max(h * 0.11, 34)
  bubble(ctx, bx, by, rx, ry, [x + w * 0.5, by + ry + h * 0.1])
  ctx.fillStyle = VERDICT_COLOR[s.verdict]
  ctx.font = `700 ${Math.round(ry * 1.15)}px ${HAND}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${percent(s.fulfilment)}!`, bx, by + 2)

  // Caption box with the name, top left, like a comic narration box.
  const capFont = small ? 22 : 28
  ctx.font = `500 ${capFont}px ${SANS}`
  const name = fit(ctx, g.name, w - 60)
  const capW = ctx.measureText(name).width + 28
  const capH = capFont + 22
  ctx.fillStyle = PAPER_DEEP
  ctx.fillRect(x + 14, y + 14, capW, capH)
  inkRect(ctx, x + 14, y + 14, capW, capH, rand, 3)
  ctx.fillStyle = INK
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(name, x + 28, y + 14 + capH / 2 + 1)

  // Verdict under the ground line.
  ctx.font = `600 ${small ? 17 : 22}px ${SANS}`
  ctx.fillStyle = VERDICT_COLOR[s.verdict]
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(VERDICT_LABELS[s.verdict].toUpperCase(), x + w / 2, ground + (small ? 34 : 46))

  inkRect(ctx, x, y, w, h, rand)
}

export async function renderShareCard(gadgets: Gadget[]): Promise<Blob> {
  await Promise.all([
    document.fonts.load(`600 80px ${HAND}`),
    document.fonts.load(`500 28px ${SANS}`),
    document.fonts.load(`600 22px ${SANS}`),
  ])

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const rand = seeded(42)

  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, W, H)

  // Biggest purchases first; past nine, the last panel says how many more there are.
  const byPrice = [...gadgets].sort((a, b) => b.price - a.price)
  const overflow = byPrice.length > MAX_PANELS ? byPrice.length - (MAX_PANELS - 1) : 0
  const shown = overflow ? byPrice.slice(0, MAX_PANELS - 1) : byPrice
  const arts = await Promise.all(shown.map((g) => artImage(g.category)))

  const total = gadgets.reduce((sum, g) => sum + g.price, 0)
  const overall = total > 0 ? gadgets.reduce((sum, g) => sum + Math.min(100, scoreGadget(g).fulfilment) * g.price, 0) / total : 0

  // ---- Title panel ----
  const titleH = 230
  const innerW = W - MARGIN * 2
  halftone(ctx, MARGIN, MARGIN, innerW, titleH)
  ctx.fillStyle = INK
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `600 124px ${HAND}`
  ctx.fillText('Worth it?', MARGIN + 36, MARGIN + 140)
  ctx.font = `500 30px ${SANS}`
  ctx.fillStyle = INK_SOFT
  ctx.fillText('My gadgets, scored by how much I use them', MARGIN + 40, MARGIN + 196)

  const burstX = W - MARGIN - 140
  const burstY = MARGIN + titleH / 2
  burst(ctx, burstX, burstY, 118, 88, 14, rand)
  ctx.textAlign = 'center'
  ctx.fillStyle = INK
  ctx.font = `700 76px ${HAND}`
  ctx.fillText(percent(overall), burstX, burstY + 14)
  ctx.font = `600 17px ${SANS}`
  ctx.fillText('EARNED BACK', burstX, burstY + 44)
  inkRect(ctx, MARGIN, MARGIN, innerW, titleH, rand, 7)

  // ---- Gadget panels ----
  const panels = shown.length + (overflow ? 1 : 0)
  const cols = panels <= 1 ? 1 : panels <= 4 ? 2 : 3
  const rows = Math.max(1, Math.ceil(panels / cols))
  const footerH = 70
  const gridTop = MARGIN + titleH + GUTTER
  const gridH = H - gridTop - footerH - MARGIN
  const pw = (innerW - GUTTER * (cols - 1)) / cols
  const ph = (gridH - GUTTER * (rows - 1)) / rows

  shown.forEach((g, i) => {
    const px = MARGIN + (i % cols) * (pw + GUTTER)
    const py = gridTop + Math.floor(i / cols) * (ph + GUTTER)
    drawGadgetPanel(ctx, g, arts[i], px, py, pw, ph, rand)
  })

  if (overflow) {
    const i = shown.length
    const px = MARGIN + (i % cols) * (pw + GUTTER)
    const py = gridTop + Math.floor(i / cols) * (ph + GUTTER)
    halftone(ctx, px, py, pw, ph)
    ctx.fillStyle = INK
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `700 ${Math.round(pw * 0.22)}px ${HAND}`
    ctx.fillText(`+${overflow} more`, px + pw / 2, py + ph / 2)
    inkRect(ctx, px, py, pw, ph, rand)
  }

  // ---- Footer ----
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = INK_SOFT
  ctx.textAlign = 'left'
  ctx.font = `500 26px ${SANS}`
  ctx.fillText(`${gadgets.length} gadget${gadgets.length === 1 ? '' : 's'} · ${money(total)} spent`, MARGIN + 4, H - MARGIN - 18)
  ctx.textAlign = 'right'
  ctx.fillStyle = INK
  ctx.font = `600 40px ${HAND}`
  ctx.fillText('made with Worth it?', W - MARGIN - 4, H - MARGIN - 14)

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create the image'))), 'image/png'),
  )
}
