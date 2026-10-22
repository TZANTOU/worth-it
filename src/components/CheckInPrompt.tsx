import { useState } from 'react'
import type { Gadget, UsageLevel } from '../types'
import { dueForCheckIn, USAGE_LEVELS } from '../lib/checkIns'
import { recordCheckIn, snoozeCheckIns } from '../db'
import { scoreGadget } from '../lib/scoring'
import { percent } from '../lib/format'
import { GadgetArt } from './GadgetArt'

/** The weekly "Did you use it?" reminder, one gadget at a time, shown above the scene. */
export function CheckInPrompt({ gadgets }: { gadgets: Gadget[] }) {
  const due = dueForCheckIn(gadgets)
  const [saved, setSaved] = useState<string | null>(null)
  const current = due[0]

  if (!current) {
    return saved ? <p className="checkin-done">✓ {saved} That’s everything for this week.</p> : null
  }

  async function answer(level: UsageLevel) {
    const before = scoreGadget(current).fulfilment
    const checkIns = await recordCheckIn(current, level)
    const after = scoreGadget({ ...current, checkIns })
    // Only the direction matters for the message; the shelf shows the exact new score.
    const change = after.fulfilment === before ? '' : after.fulfilment > before ? ' ↑' : ' ↓'
    setSaved(`Saved for ${current.name}.${change ? ` Score${change}` : ''}`)
  }

  return (
    <section className="checkin" aria-label="Weekly check-in">
      <div className="checkin-art">
        <GadgetArt category={current.category} size={72} />
      </div>
      <div className="checkin-bubble">
        <p className="checkin-question">
          Did you use the <strong>{current.name}</strong> this week?
        </p>
        <div className="checkin-answers">
          {(Object.keys(USAGE_LEVELS) as UsageLevel[]).map((level) => (
            <button key={level} className="button ghost" onClick={() => answer(level)}>
              {USAGE_LEVELS[level].label}
            </button>
          ))}
        </div>
        <p className="checkin-meta">
          {saved && <span className="checkin-saved">✓ {saved}</span>}
          <span>
            {due.length > 1 ? `${due.length} gadgets to check this week · ` : ''}
            Score now {percent(scoreGadget(current).fulfilment)}
          </span>
          <span className="checkin-skip">
            <button className="link-button" onClick={() => snoozeCheckIns([current])}>
              Skip
            </button>
            {due.length > 1 && (
              <button className="link-button" onClick={() => snoozeCheckIns(due)}>
                Not this week
              </button>
            )}
          </span>
        </p>
      </div>
    </section>
  )
}
