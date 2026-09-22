import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarColumn } from './CalendarColumn'

const DAY_MS = 24 * 60 * 60 * 1000

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS)
}

function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatWeekRange(monday, sunday) {
  const sameMonth = monday.getMonth() === sunday.getMonth() && monday.getFullYear() === sunday.getFullYear()
  const dayNum = (d) => d.getDate()
  const monthShort = (d) => d.toLocaleDateString('en-US', { month: 'short' })
  const monthLong = (d) => d.toLocaleDateString('en-US', { month: 'long' })
  if (sameMonth) return `${dayNum(monday)} – ${dayNum(sunday)} ${monthLong(sunday)} ${sunday.getFullYear()}`
  return `${dayNum(monday)} ${monthShort(monday)} – ${dayNum(sunday)} ${monthShort(sunday)} ${sunday.getFullYear()}`
}

/** Weekly nav header (date range + Prev/Today) and the 7-column post grid. */
export function WeekCalendar({ weekStart, posts, selectedPostId, onSelectPost, onPrevWeek, onToday }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    return {
      date,
      iso: toISODate(date),
      dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dateLabel: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    }
  })
  const weekEnd = days[6].date

  const postsByDate = posts.reduce((acc, post) => {
    if (!acc[post.date]) acc[post.date] = []
    acc[post.date].push(post)
    return acc
  }, {})

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <button
          type="button"
          onClick={onPrevWeek}
          aria-label="Previous week"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <h2 className="text-sm font-bold text-slate-900">{formatWeekRange(weekStart, weekEnd)}</h2>

        <button
          type="button"
          onClick={onToday}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Today
        </button>
      </div>

      <div className="flex overflow-x-auto">
        {days.map((day, index) => (
          <CalendarColumn
            key={day.iso}
            day={day}
            posts={postsByDate[day.iso] || []}
            selectedPostId={selectedPostId}
            onSelectPost={onSelectPost}
            isLast={index === days.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

export default WeekCalendar
