"use client"

const VIEWS = [
  { id: 'month', label: 'Month' },
  { id: 'week', label: 'Week' },
]

/** Month / Week segmented control shown top-right of the calendar toolbar. */
export function CalendarViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      {VIEWS.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => onChange(v.id)}
          aria-pressed={view === v.id}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            view === v.id ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  )
}

export default CalendarViewToggle
