import type { GadgetDraft } from '../types'
import { CATEGORIES, FREQUENCIES } from './categories'

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
  /** Actual weekly use divided by the expected weekly use for the category. */
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
>

export function scoreGadget(g: ScoreInput, now: Date = new Date()): Score {
  const profile = CATEGORIES[g.category]
  const weeksOwned = Math.max(0, (now.getTime() - new Date(g.purchaseDate).getTime()) / MS_PER_WEEK)
  const hoursPerWeek = FREQUENCIES[g.frequency].sessionsPerWeek * g.hoursPerSession

  const hoursUsed = weeksOwned * hoursPerWeek
  const hoursExpected = profile.lifespanYears * 52 * profile.expectedHoursPerWeek
  const fulfilment = (hoursUsed / hoursExpected) * 100
  const pace = hoursPerWeek / profile.expectedHoursPerWeek

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

  return { fulfilment, hoursUsed, hoursExpected, pace, costPerHour, weeksToPayoff, paysOffInLifetime, verdict }
}
