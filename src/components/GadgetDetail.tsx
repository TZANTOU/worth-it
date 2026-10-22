import { useState } from 'react'
import type { Gadget, GadgetDraft } from '../types'
import { db } from '../db'
import { CATEGORIES, FREQUENCIES } from '../lib/categories'
import { scoreGadget, VERDICT_LABELS } from '../lib/scoring'
import { duration, hours, money, moneyPrecise, percent } from '../lib/format'
import { Modal } from './Modal'
import { GadgetArt } from './GadgetArt'
import { GadgetForm } from './GadgetForm'
import { Meter } from './Meter'
import { CheckInHistory } from './CheckInHistory'

export function GadgetDetail({ gadget, onClose }: { gadget: Gadget; onClose: () => void }) {
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const s = scoreGadget(gadget)

  async function save(draft: GadgetDraft) {
    await db.gadgets.update(gadget.id!, { ...draft })
    setEditing(false)
  }

  async function remove() {
    await db.gadgets.delete(gadget.id!)
    onClose()
  }

  if (editing) {
    return (
      <Modal title={`Edit ${gadget.name}`} onClose={onClose}>
        <GadgetForm initial={gadget} submitLabel="Save changes" onSubmit={save} onBack={() => setEditing(false)} />
      </Modal>
    )
  }

  return (
    <Modal title={gadget.name} onClose={onClose}>
      <div className="detail">
        <div className="detail-art">
          <GadgetArt category={gadget.category} size={150} />
          <p className="big-percent">{percent(s.fulfilment)}</p>
          <p className={`verdict verdict-${s.verdict}`}>{VERDICT_LABELS[s.verdict]}</p>
          <Meter value={s.fulfilment} />
        </div>

        <dl className="stats">
          <Stat label="Paid" value={`${money(gadget.price)} · ${new Date(gadget.purchaseDate).toLocaleDateString()}`} />
          <Stat label="Use" value={`${FREQUENCIES[gadget.frequency].label}, ${hours(gadget.hoursPerSession)} each`} />
          <Stat label="Used so far" value={`${hours(s.hoursUsed)} of ~${hours(s.hoursExpected)}`} />
          <Stat label="Lately" value={`${hours(s.recentHoursPerWeek)} a week`} />
          <Stat label="Cost per hour" value={s.costPerHour === null ? '—' : moneyPrecise(s.costPerHour)} />
          <Stat label="Pace" value={`${percent(s.pace * 100)} of a typical ${CATEGORIES[gadget.category].label.toLowerCase()}`} />
          <Stat
            label="Paid off"
            value={
              s.weeksToPayoff === 0
                ? 'Already — enjoy it'
                : s.weeksToPayoff === null
                  ? 'Never at this pace'
                  : s.paysOffInLifetime
                    ? `in ${duration(s.weeksToPayoff)} at this pace`
                    : `Not before it wears out (${duration(s.weeksToPayoff)} at this pace)`
            }
          />
          {gadget.resaleValue !== undefined && <Stat label="Resale value" value={money(gadget.resaleValue)} />}
        </dl>
      </div>

      <CheckInHistory gadget={gadget} />

      <div className="form-actions">
        {confirmingDelete ? (
          <>
            <span className="muted">Remove it from the shelf?</span>
            <button className="button ghost" onClick={() => setConfirmingDelete(false)}>
              Keep it
            </button>
            <button className="button danger" onClick={remove}>
              Remove
            </button>
          </>
        ) : (
          <>
            <button className="button ghost" onClick={() => setConfirmingDelete(true)}>
              Remove
            </button>
            <button className="button" onClick={() => setEditing(true)}>
              Edit answers
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
