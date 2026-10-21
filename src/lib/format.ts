const eur = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' })
const eurPrecise = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const money = (n: number) => eur.format(n)
export const moneyPrecise = (n: number) => eurPrecise.format(n)
export const percent = (n: number) => `${Math.round(n)}%`

export function hours(n: number): string {
  if (n < 1) return `${Math.round(n * 60)} min`
  return `${Math.round(n).toLocaleString()} h`
}

export function duration(weeks: number): string {
  if (weeks < 1) return 'less than a week'
  if (weeks < 9) return `${Math.round(weeks)} weeks`
  const months = weeks / 4.345
  if (months < 24) return `${Math.round(months)} months`
  return `${(months / 12).toFixed(1)} years`
}

export const today = () => new Date().toISOString().slice(0, 10)
