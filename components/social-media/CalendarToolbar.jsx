import { PlatformFilter } from './PlatformFilter'
import { StatusFilter } from './StatusFilter'
import { CalendarViewToggle } from './CalendarViewToggle'
import { CALENDAR_PLATFORM_FILTERS, CALENDAR_STATUS_OPTIONS } from '@/lib/socialMediaAIDummyData'

/** Filter + view-toggle row shown below the Content Calendar page header. */
export function CalendarToolbar({ activePlatforms, onTogglePlatform, statusFilter, onStatusChange, view, onViewChange }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <PlatformFilter platforms={CALENDAR_PLATFORM_FILTERS} activePlatforms={activePlatforms} onToggle={onTogglePlatform} />
        <StatusFilter options={CALENDAR_STATUS_OPTIONS} value={statusFilter} onChange={onStatusChange} />
      </div>

      <CalendarViewToggle view={view} onChange={onViewChange} />
    </div>
  )
}

export default CalendarToolbar
