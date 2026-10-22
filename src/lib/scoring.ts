import type { CheckIn, GadgetDraft } from '../types'
import { CATEGORIES, FREQUENCIES } from './categories'
import { recentWeeks, USAGE_LEVELS, weekOf } from './checkIns'

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

export type Verdict = 'paid-off' | 'on-track' | 'could-do-better' | 'gathering-dust'

export const VERDICT_LABELS: Record<Verdict, string> = {
  'paid-off': 'Paid off',
  'on-track': 'On track',
  'could-do-better': 'Could do better',
  'gathering-dust': 'Gathering dust',
}

export interface Score {
  /** Share of the expected lifetime use already reached; 100 means the purchase has paid for itself. */
  fulfilment: number
  hoursUsed: number
  hoursExpected: number
  /** Hours a week lately: from recent check-ins where there are any, otherwise the usual estimate. */
  recentHoursPerWeek: number
  /** Recent weekly use divided by the expected weekly use for the category. */
  pace: number
  /** What each hour of use has cost so far, after resale value; null before any use. */
  costPerHour: number | null
  /** Weeks until 100% at the current pace; 0 when already there, null when it never will be. */
  weeksToPayoff: number | null
  /** Whether it reaches 100% at the current pace before the category's expected lifespan ends. */
  paysOffInLifetime: boolean
  verdict: Verdict
}

type ScoreInput = Pick<
  GadgetDraft,
  'category' | 'price' | 'purchaseDate' | 'frequency' | 'hoursPerSession' | 'resaleValue'
> & { checkIns?: CheckIn[] }

/** How many recent weeks of check-ins decide the current pace. */
const RECENT_WEEKS = 8

export function scoreGadget(g: ScoreInput, now: Date = new Date()): Score {
  const profile = CATEGORIES[g.category]
  const weeksOwned = Math.max(0, (now.getTime() - new Date(g.purchaseDate).getTime()) / MS_PER_WEEK)
  const usualHoursPerWeek = FREQUENCIES[g.frequency].sessionsPerWeek * g.hoursPerSession
  const purchased = new Date(g.purchaseDate)
  const firstWeek = weekOf(purchased)
  const checkIns = (g.checkIns ?? []).filter((c) => c.week >= firstWeek && c.week <= weekOf(now))

  // Every week owned counts at the usual rate, except weeks with a check-in, which count
  // at the answered rate. The current week only counts for the part that has gone by.
  let hoursUsed = weeksOwned * usualHoursPerWeek
  for (const c of checkIns) {
    const start = Math.max(new Date(`${c.week}T00:00`).getTime(), purchased.getTime())
    const elapsed = Math.min(1, Math.max(0, (now.getTime() - start) / MS_PER_WEEK))
    hoursUsed += (USAGE_LEVELS[c.level].factor - 1) * usualHoursPerWeek * elapsed
  }
  hoursUsed = Math.max(0, hoursUsed)

  // Lately: average the last few weeks, answered weeks at their answer, the rest as usual.
  const recent = recentWeeks(RECENT_WEEKS, now).filter((w) => w >= firstWeek)
  const answered = new Map(checkIns.map((c) => [c.week, USAGE_LEVELS[c.level].factor]))
  const hasRecentAnswers = recent.some((w) => answered.has(w))
  const recentHoursPerWeek = hasRecentAnswers
    ? (recent.reduce((sum, w) => sum + (answered.get(w) ?? 1), 0) / recent.length) * usualHoursPerWeek
    : usualHoursPerWeek
  const hoursPerWeek = recentHoursPerWeek

  const hoursExpected = profile.lifespanYears * 52 * profile.expectedHoursPerWeek
  const fulfilment = (hoursUsed / hoursExpected) * 100
  const pace = recentHoursPerWeek / profile.expectedHoursPerWeek

  const netCost = Math.max(0, g.price - (g.resaleValue ?? 0))
  const costPerHour = hoursUsed > 0 ? netCost / hoursUsed : null

  let weeksToPayoff: number | null = null
  if (fulfilment >= 100) weeksToPayoff = 0
  else if (hoursPerWeek > 0) weeksToPayoff = (hoursExpected - hoursUsed) / hoursPerWeek

  const lifespanWeeks = profile.lifespanYears * 52
  const paysOffInLifetime =
    fulfilment >= 100 || (weeksToPayoff !== null && weeksOwned + weeksToPayoff <= lifespanWeeks)

  let verdict: Verdict
  if (fulfilment >= 100) verdict = 'paid-off'
  else if (pace >= 0.8) verdict = 'on-track'
  else if (pace >= 0.35) verdict = 'could-do-better'
  else verdict = 'gathering-dust'

  return {
    fulfilment,
    hoursUsed,
    hoursExpected,
    recentHoursPerWeek,
    pace,
    costPerHour,
    weeksToPayoff,
    paysOffInLifetime,
    verdict,
  }
}
