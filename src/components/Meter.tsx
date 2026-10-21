/** A thin ink line that fills up to the given percentage. */
export function Meter({ value }: { value: number }) {
  return (
    <svg className="meter" viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" y1="3" x2="100" y2="3" className="meter-track" />
      <line x1="0" y1="3" x2={Math.min(100, value)} y2="3" className="meter-fill" />
    </svg>
  )
}
