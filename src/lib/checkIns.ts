import type { Gadget, UsageLevel } from '../types'

export const USAGE_LEVELS: Record<UsageLevel, { label: string; factor: number }> = {
  none: { label: 'Not at all', factor: 0 },
  little: { label: 'A little', factor: 0.4 },
  usual: { label: 'As usual', factor: 1 },
  lots: { label: 'More than usual', factor: 1.6 },
}

const DAY = 24 * 60 * 60 * 1000

/** Monday of the date's week (this week by default), as yyyy-mm-dd in local time. */
export function weekOf(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** The Mondays of the last `count` weeks, oldest first, ending with this week. */
export function recentWeeks(count: number, now = new Date()): string[] {
  return Array.from({ length: count }, (_, i) => weekOf(new Date(now.getTime() - (count - 1 - i) * 7 * DAY)))
}

/**
 * Gadgets to ask about this week: owned for at least a week, not answered for this week,
 * and not dismissed this week. The ones asked about longest ago come first.
 */
export function dueForCheckIn(gadgets: Gadget[], now = new Date()): Gadget[] {
  const thisWeek = weekOf(now)
  const lastAnswered = (g: Gadget) => g.checkIns?.map((c) => c.week).sort().at(-1) ?? ''
  return gadgets
    .filter(
      (g) =>
        now.getTime() - new Date(g.purchaseDate).getTime() >= 7 * DAY &&
        lastAnswered(g) !== thisWeek &&
        g.checkInSnoozedWeek !== thisWeek,
    )
    .sort((a, b) => lastAnswered(a).localeCompare(lastAnswered(b)))
}
