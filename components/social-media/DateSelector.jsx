import { Calendar } from 'lucide-react'

const FIELD_CLASS =
  'w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 shadow-sm transition-colors focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-70'

/**
 * "Date" field in the Confirm Schedule panel. A native date input, so the
 * value is always an unambiguous "yyyy-MM-dd" the scheduler API can use (the
 * previous free-text field could not be turned into a real instant). `min` is
 * a UX hint only — the backend rejects past times authoritatively.
 */
export function DateSelector({ value, onChange, min, disabled = false }) {
  return (
    <div>
      <label htmlFor="schedule-date" className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
      <div className="relative">
        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input id="schedule-date" type="date" value={value} min={min} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={FIELD_CLASS} />
      </div>
    </div>
  )
}

export default DateSelector
