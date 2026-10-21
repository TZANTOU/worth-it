import type { Category, Frequency } from '../types'

export interface CategoryProfile {
  label: string
  /** How long a gadget of this kind is reasonably expected to last. */
  lifespanYears: number
  /** Hours of use per week that would make it a "well used" purchase. */
  expectedHoursPerWeek: number
}

export const CATEGORIES: Record<Category, CategoryProfile> = {
  headphones: { label: 'Headphones', lifespanYears: 3, expectedHoursPerWeek: 10 },
  phone: { label: 'Phone', lifespanYears: 3, expectedHoursPerWeek: 21 },
  laptop: { label: 'Laptop', lifespanYears: 4, expectedHoursPerWeek: 20 },
  tablet: { label: 'Tablet', lifespanYears: 4, expectedHoursPerWeek: 5 },
  console: { label: 'Console / controller', lifespanYears: 5, expectedHoursPerWeek: 6 },
  camera: { label: 'Camera', lifespanYears: 5, expectedHoursPerWeek: 2 },
  watch: { label: 'Watch / wearable', lifespanYears: 3, expectedHoursPerWeek: 70 },
  speaker: { label: 'Speaker', lifespanYears: 5, expectedHoursPerWeek: 5 },
  tv: { label: 'TV / monitor', lifespanYears: 7, expectedHoursPerWeek: 14 },
  other: { label: 'Other gadget', lifespanYears: 3, expectedHoursPerWeek: 5 },
}

export const FREQUENCIES: Record<Frequency, { label: string; sessionsPerWeek: number }> = {
  daily: { label: 'Every day', sessionsPerWeek: 7 },
  'few-week': { label: 'A few times a week', sessionsPerWeek: 3 },
  weekly: { label: 'About once a week', sessionsPerWeek: 1 },
  monthly: { label: 'About once a month', sessionsPerWeek: 0.25 },
  rarely: { label: 'Almost never', sessionsPerWeek: 0.05 },
}

/** Open Products Facts category tags, checked in order; the first match wins. */
const TAG_MATCHERS: [RegExp, Category][] = [
  [/headphone|earphone|earbud|headset/, 'headphones'],
  [/smartwatch|watches|wearable|fitness-tracker/, 'watch'],
  [/smartphone|mobile-phone|cell-phone/, 'phone'],
  [/laptop|notebook-computer|computers/, 'laptop'],
  [/tablet/, 'tablet'],
  [/console|gamepad|game-controller|video-game/, 'console'],
  [/camera/, 'camera'],
  [/speaker/, 'speaker'],
  [/television|monitor|screens/, 'tv'],
]

export function categoryFromTags(tags: string[] = [], name = ''): Category {
  const haystack = [...tags, name.toLowerCase()].join(' ')
  return TAG_MATCHERS.find(([re]) => re.test(haystack))?.[1] ?? 'other'
}
