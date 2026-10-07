import { CALENDAR_STATUS_META } from '@/lib/socialMediaAIDummyData'

/** Bottom status-color legend + note for the calendar. */
export function StatusLegend({ note }) {
  return (
    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {Object.entries(CALENDAR_STATUS_META).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-1.5 text-slate-500">
            <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dotClass}`} />
            {meta.label}
          </span>
        ))}
      </div>

      {note && <div className="text-slate-400">{note}</div>}
    </div>
  )
}

export default StatusLegend
