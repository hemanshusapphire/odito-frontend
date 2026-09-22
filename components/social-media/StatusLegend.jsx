import { CALENDAR_STATUS_META } from '@/lib/socialMediaAIDummyData'

/** Bottom status-color legend + timezone/workflow note for the calendar. */
export function StatusLegend({ timezone, note }) {
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

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-400">
        <span>Timezone: {timezone}</span>
        <span className="hidden sm:inline">|</span>
        <span>{note}</span>
      </div>
    </div>
  )
}

export default StatusLegend
