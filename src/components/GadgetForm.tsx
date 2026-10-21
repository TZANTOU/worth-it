import { useState, type FormEvent } from 'react'
import type { Category, Frequency, GadgetDraft } from '../types'
import { CATEGORIES, FREQUENCIES } from '../lib/categories'
import { scoreGadget, VERDICT_LABELS } from '../lib/scoring'
import { percent, today } from '../lib/format'
import { GadgetArt } from './GadgetArt'

const SESSION_LENGTHS = [
  { label: '15 minutes', value: 0.25 },
  { label: '30 minutes', value: 0.5 },
  { label: '1 hour', value: 1 },
  { label: '2 hours', value: 2 },
  { label: '4 hours', value: 4 },
  { label: '8 hours', value: 8 },
  { label: 'All day (12h+)', value: 12 },
]

interface Props {
  initial: Partial<GadgetDraft> & Pick<GadgetDraft, 'name' | 'category'>
  submitLabel: string
  onSubmit: (draft: GadgetDraft) => void
  onBack?: () => void
}

export function GadgetForm({ initial, submitLabel, onSubmit, onBack }: Props) {
  const [name, setName] = useState(initial.name)
  const [category, setCategory] = useState<Category>(initial.category)
  const [price, setPrice] = useState(initial.price?.toString() ?? '')
  const [purchaseDate, setPurchaseDate] = useState(initial.purchaseDate ?? '')
  const [frequency, setFrequency] = useState<Frequency>(initial.frequency ?? 'daily')
  const [hoursPerSession, setHoursPerSession] = useState(initial.hoursPerSession ?? 1)
  const [resaleValue, setResaleValue] = useState(initial.resaleValue?.toString() ?? '')

  const priceNum = Number(price)
  const resaleNum = resaleValue === '' ? undefined : Number(resaleValue)
  const valid = name.trim() !== '' && priceNum > 0 && purchaseDate !== '' && purchaseDate <= today()

  const preview = valid
    ? scoreGadget({ category, price: priceNum, purchaseDate, frequency, hoursPerSession, resaleValue: resaleNum })
    : null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!valid) return
    onSubmit({
      name: name.trim(),
      brand: initial.brand,
      offCode: initial.offCode,
      imageUrl: initial.imageUrl,
      category,
      price: priceNum,
      purchaseDate,
      frequency,
      hoursPerSession,
      resaleValue: resaleNum,
    })
  }

  return (
    <form className="gadget-form" onSubmit={handleSubmit}>
      <div className="form-art">
        <GadgetArt category={category} size={120} />
        {preview && (
          <p className="preview">
            <strong>{percent(preview.fulfilment)}</strong>
            <span>{VERDICT_LABELS[preview.verdict]}</span>
          </p>
        )}
      </div>

      <div className="form-fields">
        <label className="field">
          <span>What is it?</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label className="field">
          <span>Kind of gadget</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {Object.entries(CATEGORIES).map(([key, c]) => (
              <option key={key} value={key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <div className="field-row">
          <label className="field">
            <span>How much did you pay? (€)</span>
            <input type="number" min="1" step="0.01" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </label>
          <label className="field">
            <span>When did you buy it?</span>
            <input type="date" max={today()} value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>How often do you use it?</span>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
              {Object.entries(FREQUENCIES).map(([key, f]) => (
                <option key={key} value={key}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>For how long each time?</span>
            <select value={hoursPerSession} onChange={(e) => setHoursPerSession(Number(e.target.value))}>
              {SESSION_LENGTHS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>What could you sell it for today? (optional, €)</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={resaleValue} onChange={(e) => setResaleValue(e.target.value)} />
        </label>

        <p className="muted small">
          Counts as fully paid off after about {CATEGORIES[category].expectedHoursPerWeek} h of use a week
          for {CATEGORIES[category].lifespanYears} years.
        </p>

        <div className="form-actions">
          {onBack && (
            <button type="button" className="button ghost" onClick={onBack}>
              Back
            </button>
          )}
          <button type="submit" className="button" disabled={!valid}>
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}
