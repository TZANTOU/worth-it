import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

interface Props {
  /** How far the zip is open: 0 closed, 1 fully open. */
  value: number
  /** Called while dragging (commit false) and when a move is finished (commit true). */
  onChange: (value: number, commit: boolean) => void
}

/** Keep in sync with --zip-pad in BagScene.css: the zip runs inside the bag's rounded corners. */
const PAD = 22
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

/**
 * A zipper you drag left and right. The pull tab swings with the speed of the drag
 * and settles with a little wobble when you let go.
 */
export function BagZip({ value, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const lastX = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [swing, setSwing] = useState(0)

  function valueAt(clientX: number) {
    const rect = trackRef.current!.getBoundingClientRect()
    return clamp((clientX - rect.left - PAD) / (rect.width - 2 * PAD), 0, 1)
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    lastX.current = e.clientX
    setDragging(true)
    onChange(valueAt(e.clientX), false)
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return
    // Dragging right swings the tab back to the left, like something hanging from a string.
    const dx = e.clientX - lastX.current
    lastX.current = e.clientX
    setSwing((s) => clamp(s * 0.6 - dx * 2.5, -40, 40))
    onChange(valueAt(e.clientX), false)
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return
    setDragging(false)
    setSwing(0)
    // Snap shut or fully open when let go right next to an end.
    const v = valueAt(e.clientX)
    onChange(v < 0.04 ? 0 : v > 0.96 ? 1 : v, true)
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 0.25 : 0.1
    const next: Record<string, number> = {
      ArrowRight: value + step,
      ArrowUp: value + step,
      ArrowLeft: value - step,
      ArrowDown: value - step,
      Home: 0,
      End: 1,
      Enter: value > 0.5 ? 0 : 1,
      ' ': value > 0.5 ? 0 : 1,
    }
    if (!(e.key in next)) return
    e.preventDefault()
    onChange(clamp(next[e.key], 0, 1), true)
  }

  return (
    <div
      ref={trackRef}
      className={`bag-zip ${dragging ? 'is-dragging' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <span className="bag-zip-open" aria-hidden="true" />
      <span className="bag-zip-closed" aria-hidden="true" />
      <div
        className="bag-zip-slider"
        role="slider"
        tabIndex={0}
        aria-label="Bag zip"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        aria-valuetext={value === 0 ? 'Closed' : value === 1 ? 'Open' : `${Math.round(value * 100)}% open`}
        onKeyDown={onKeyDown}
      >
        <span className="bag-zip-tab" style={{ rotate: `${swing}deg` }} />
      </div>
    </div>
  )
}
