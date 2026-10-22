import type { Gadget, UsageLevel } from '../types'
import { recentWeeks, USAGE_LEVELS, weekOf } from '../lib/checkIns'
import { recordCheckIn } from '../db'

const WEEKS_SHOWN = 8

/** Small ink marks for each answer, from nothing to a full bar. */
const MARKS: Record<UsageLevel, string> = {
  none: 'M5 5 L15 15 M15 5 L5 15',
  little: 'M4 15 L16 15',
  usual: 'M4 15 L16 15 M4 10 L16 10',
  lots: 'M4 15 L16 15 M4 10 L16 10 M4 5 L16 5',
}

/** The last few weeks of check-ins, plus buttons to answer (or change) this week. */
export function CheckInHistory({ gadget }: { gadget: Gadget }) {
  const answers = new Map((gadget.checkIns ?? []).map((c) => [c.week, c.level]))
  const thisWeek = weekOf()
  const firstWeek = weekOf(new Date(gadget.purchaseDate))
  const weeks = recentWeeks(WEEKS_SHOWN).filter((w) => w >= firstWeek)

  return (
    <div className="history">
      <p className="history-title">Weekly check-ins</p>
      <ol className="history-weeks">
        {weeks.map((week) => {
          const level = answers.get(week)
          const label = new Date(`${week}T00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
          return (
            <li key={week} title={`Week of ${label}: ${level ? USAGE_LEVELS[level].label : 'no answer, counted as usual'}`}>
              <svg viewBox="0 0 20 20" width="22" height="22" aria-hidden="true" className={level ? '' : 'unanswered'}>
                <rect x="1" y="1" width="18" height="18" rx="3" />
                {level && <path d={MARKS[level]} />}
              </svg>
              <span>{week === thisWeek ? 'now' : label}</span>
            </li>
          )
        })}
      </ol>

      <div className="history-answer">
        <span>This week:</span>
        {(Object.keys(USAGE_LEVELS) as UsageLevel[]).map((level) => (
          <button
            key={level}
            className="chip"
            aria-pressed={answers.get(thisWeek) === level}
            onClick={() => recordCheckIn(gadget, level)}
          >
            {USAGE_LEVELS[level].label}
          </button>
        ))}
      </div>
    </div>
  )
}
