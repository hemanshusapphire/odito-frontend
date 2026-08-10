"use client"

import TimezoneSelect from './TimezoneSelect'
import DatePicker from './DatePicker'
import TimeSelector from './TimeSelector'

/**
 * Timezone + Date on their own row (timezone labels are long, e.g.
 * "(UTC -5:00) Eastern Standard Time", and native date inputs render badly
 * when squeezed), Hour/Min/Format on a second, narrower row below.
 */
export default function ScheduleSection({ schedule, onChange }) {
  function set(key, value) {
    onChange({ ...schedule, [key]: value })
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Schedule</span>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-2 min-w-0">
          <TimezoneSelect value={schedule.timezone} onChange={(v) => set('timezone', v)} />
        </div>
        <div className="flex-1 min-w-37.5">
          <DatePicker value={schedule.date} onChange={(v) => set('date', v)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <TimeSelector
          hour={schedule.hour}
          minute={schedule.minute}
          format={schedule.format}
          onHourChange={(v) => set('hour', v)}
          onMinuteChange={(v) => set('minute', v)}
          onFormatChange={(v) => set('format', v)}
        />
      </div>
    </div>
  )
}
