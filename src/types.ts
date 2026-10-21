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

export interface Gadget {
  id?: number
  name: string
  brand?: string
  category: Category
  /** Barcode from Open Products Facts, when the gadget was picked from there. */
  offCode?: string
  imageUrl?: string
  price: number
  /** ISO date (yyyy-mm-dd). */
  purchaseDate: string
  frequency: Frequency
  hoursPerSession: number
  resaleValue?: number
  createdAt: number
}

/** What the questionnaire fills in; everything else comes from search or is set on save. */
export type GadgetDraft = Omit<Gadget, 'id' | 'createdAt'>
