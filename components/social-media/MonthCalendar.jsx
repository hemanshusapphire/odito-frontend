import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MonthDayCell } from './MonthDayCell'

const DAY_MS = 24 * 60 * 60 * 1000
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS)
}

function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Monday-first weekday index: Mon=0 ... Sun=6 (JS's own getDay() is Sun-first).
function mondayIndex(date) {
  const day = date.getDay()
  return day === 0 ? 6 : day - 1
}

function daysInMonth(monthStart) {
  return new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate()
}

/** Full month nav header (month/year + Prev/Next/Today) and the 7-column day grid. */
export function MonthCalendar({ monthStart, posts, selectedPostId, onSelectPost, onPrevMonth, onNextMonth, onToday }) {
  const leadingDays = mondayIndex(monthStart)
  const totalDaysInMonth = daysInMonth(monthStart)
  const totalCells = Math.ceil((leadingDays + totalDaysInMonth) / 7) * 7
  const gridStart = addDays(monthStart, -leadingDays)

  const days = Array.from({ length: totalCells }, (_, i) => {
    const date = addDays(gridStart, i)
    return {
      date,
      iso: toISODate(date),
      dayNum: date.getDate(),
      isCurrentMonth: date.getMonth() === monthStart.getMonth(),
    }
  })

  const postsByDate = posts.reduce((acc, post) => {
    if (!acc[post.date]) acc[post.date] = []
    acc[post.date].push(post)
    return acc
  }, {})

  const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <h2 className="text-sm font-bold text-slate-900">{monthLabel}</h2>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToday}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 border-l border-t border-slate-200">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="border-b border-r border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold text-slate-500">
                {label}
              </div>
            ))}
            {days.map((day) => (
              <MonthDayCell
                key={day.iso}
                day={day}
                posts={postsByDate[day.iso] || []}
                selectedPostId={selectedPostId}
                onSelectPost={onSelectPost}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MonthCalendar
