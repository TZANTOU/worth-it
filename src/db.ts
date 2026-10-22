import Dexie, { type EntityTable } from 'dexie'
import type { CheckIn, Gadget, UsageLevel } from './types'
import { weekOf } from './lib/checkIns'

export const db = new Dexie('worth-it') as Dexie & {
  gadgets: EntityTable<Gadget, 'id'>
}

db.version(1).stores({
  gadgets: '++id, category, createdAt',
})

/** Saves this week's answer (replacing an earlier one) and returns the gadget's check-ins. */
export async function recordCheckIn(gadget: Gadget, level: UsageLevel, now = new Date()): Promise<CheckIn[]> {
  const week = weekOf(now)
  const checkIns = [...(gadget.checkIns ?? []).filter((c) => c.week !== week), { week, level }]
  await db.gadgets.update(gadget.id!, { checkIns })
  return checkIns
}

export async function snoozeCheckIns(gadgets: Gadget[], now = new Date()) {
  const week = weekOf(now)
  await db.gadgets.bulkUpdate(gadgets.map((g) => ({ key: g.id!, changes: { checkInSnoozedWeek: week } })))
}
