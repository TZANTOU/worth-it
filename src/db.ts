import Dexie, { type EntityTable } from 'dexie'
import type { Gadget } from './types'

export const db = new Dexie('worth-it') as Dexie & {
  gadgets: EntityTable<Gadget, 'id'>
}

db.version(1).stores({
  gadgets: '++id, category, createdAt',
})
