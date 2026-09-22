import { Clock } from 'lucide-react'

const FIELD_CLASS =
  'w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 shadow-sm transition-colors focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 hover:border-slate-300'

/** "Time" field in the Confirm Schedule panel - text input, mock/local state. */
export function TimeSelector({ value, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Time</label>
      <div className="relative">
        <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={FIELD_CLASS} />
      </div>
    </div>
  )
}

export default TimeSelector
