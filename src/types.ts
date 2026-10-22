export type Category =
  | 'headphones'
  | 'phone'
  | 'laptop'
  | 'tablet'
  | 'console'
  | 'camera'
  | 'watch'
  | 'speaker'
  | 'tv'
  | 'other'

export type Frequency = 'daily' | 'few-week' | 'weekly' | 'monthly' | 'rarely'

/** The answer to "Did you use it this week?", compared with the usual frequency. */
export type UsageLevel = 'none' | 'little' | 'usual' | 'lots'

export interface CheckIn {
  /** Monday of the week the answer is about (yyyy-mm-dd). */
  week: string
  level: UsageLevel
}

export interface Gadget {
  id?: number
  name: string
  brand?: string
  category: Category
  /** Barcode from Open Products Facts, when the gadget was picked from there. */
  offCode?: string
  /** Wikidata item (Q…), when the gadget was picked from there. */
  wikidataId?: string
  imageUrl?: string
  /** When the product came out, if known; it can't have been bought before then. */
  releaseDate?: string
  price: number
  /** ISO date (yyyy-mm-dd). */
  purchaseDate: string
  frequency: Frequency
  hoursPerSession: number
  resaleValue?: number
  /** Weekly answers about actual use; they replace the estimate for those weeks. */
  checkIns?: CheckIn[]
  /** A week (Monday) the check-in reminder was dismissed for. */
  checkInSnoozedWeek?: string
  createdAt: number
}

/** What the questionnaire fills in; everything else comes from search or is set on save. */
export type GadgetDraft = Omit<Gadget, 'id' | 'createdAt' | 'checkIns' | 'checkInSnoozedWeek'>
