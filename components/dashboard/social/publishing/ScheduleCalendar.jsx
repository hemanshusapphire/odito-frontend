"use client"

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Plus, Loader2 } from 'lucide-react'
import CalendarToolbar from './CalendarToolbar'
import CalendarDay from './CalendarDay'
import StatusBadge from './StatusBadge'
import { platformConfig } from '@/lib/socialFeedsDummyData'
import { DateTime } from 'luxon'
import { dateKeyInTimezone } from '@/lib/scheduleTime'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Grid cells (buildMonthGrid/buildWeekGrid below) are plain calendar days —
// constructed via LOCAL Date arithmetic and labelled via date.getDate() in
// CalendarDay.jsx — so they must be keyed the same way (Luxon's
// DateTime.fromJSDate defaults to the local zone). Using toISOString()
// here (UTC) used to key a LOCAL day against a UTC day: for any viewer
// whose browser timezone has a non-zero UTC offset, the cell visually
// labelled e.g. "26" could carry the key for a different real day than the
// one a post bucketed via a UTC-based key would land on — exactly the
// bug where a 9:00 AM IST post landed one cell over from where its own
// "25" label said it should be.
function toDateKey(date) {
  return DateTime.fromJSDate(date).toFormat('yyyy-LL-dd')
}

function buildMonthGrid(viewDate) {
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const gridStart = new Date(firstOfMonth)
  gridStart.setDate(gridStart.getDate() - firstOfMonth.getDay())
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    return d
  })
}

function buildWeekGrid(viewDate) {
  const start = new Date(viewDate)
  start.setDate(start.getDate() - start.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

/**
 * Month/Week/Day calendar for real draft/scheduled/published/failed/
 * cancelled SocialPublication records (see app/app/social/publishing/
 * page.jsx's useSocialPublishing). A post's calendar day is
 * scheduledAt for anything not yet published, publishedAt for anything
 * that is — matching Phase 5's explicit "use scheduledAt for scheduled
 * posts, publishedAt for published posts". A draft with neither date set
 * simply doesn't appear on the calendar (it has no date to appear on);
 * it's still visible in the Posts tab.
 */
export default function ScheduleCalendar({ posts, isLoading, onCompose }) {
  const [view, setView] = useState('month')
  const [viewDate, setViewDate] = useState(() => new Date())

  const postsByDay = useMemo(() => {
    const map = {}
    for (const post of posts || []) {
      const dateValue = post.scheduledAt || post.publishedAt
      if (!dateValue) continue
      // A stored scheduledAt is an absolute UTC instant; bucket it by the
      // calendar day it falls on IN THE ZONE THE USER SCHEDULED IT FOR
      // (matching DayAgenda's/PostsTable's own display logic below), not
      // the viewer's browser zone and not raw UTC. publishedAt has no
      // "chosen zone" concept, so it falls back to the viewer's own
      // timezone — same convention already established elsewhere in this
      // file/PostsTable.jsx.
      const key = dateKeyInTimezone(dateValue, post.scheduledAt ? post.timezone : null)
      if (!key) continue
      if (!map[key]) map[key] = []
      map[key].push(post)
    }
    for (const key in map) map[key].sort((a, b) => new Date(a.scheduledAt || a.publishedAt) - new Date(b.scheduledAt || b.publishedAt))
    return map
  }, [posts])

  function shift(amount) {
    setViewDate((prev) => {
      const next = new Date(prev)
      if (view === 'month') next.setMonth(next.getMonth() + amount)
      else if (view === 'week') next.setDate(next.getDate() + amount * 7)
      else next.setDate(next.getDate() + amount)
      return next
    })
  }

  const todayKey = toDateKey(new Date())

  return (
    <Card className="p-5 flex flex-col gap-4">
      <CalendarToolbar
        viewDate={viewDate}
        view={view}
        onPrev={() => shift(-1)}
        onNext={() => shift(1)}
        onToday={() => setViewDate(new Date())}
        onViewChange={setView}
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading your posts…</span>
        </div>
      ) : view === 'day' ? (
        <DayAgenda date={viewDate} posts={postsByDay[toDateKey(viewDate)] || []} onCompose={onCompose} />
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <div className="grid grid-cols-7 bg-muted/40 border-b">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground">{label}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {(view === 'week' ? buildWeekGrid(viewDate) : buildMonthGrid(viewDate)).map((date) => {
              const key = toDateKey(date)
              return (
                <CalendarDay
                  key={key}
                  date={date}
                  isCurrentMonth={view === 'week' || date.getMonth() === viewDate.getMonth()}
                  isToday={key === todayKey}
                  isPast={key < todayKey}
                  posts={postsByDay[key] || []}
                  onCompose={onCompose}
                />
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}

function DayAgenda({ date, posts, onCompose }) {
  const isPast = toDateKey(date) < toDateKey(new Date())

  return (
    <div className="rounded-xl border divide-y">
      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
          <p className="text-sm">Nothing scheduled for this day.</p>
          {!isPast && (
            <button onClick={() => onCompose(date)} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              <Plus className="h-3.5 w-3.5" />
              Compose Message
            </button>
          )}
        </div>
      ) : (
        posts.map((post) => {
          const platform = platformConfig(post.platform)
          const Icon = platform.icon
          const displayDate = post.scheduledAt || post.publishedAt
          // A stored scheduledAt is an absolute UTC instant; when it also
          // carries the IANA zone the user picked, show the time back in
          // THAT zone (matching what they actually chose) instead of the
          // viewer's own browser zone. publishedAt has no such "chosen
          // zone" concept, so it always displays in the viewer's local time.
          const displayTime = displayDate
            ? (post.scheduledAt && post.timezone
              ? DateTime.fromJSDate(new Date(displayDate)).setZone(post.timezone).toFormat('h:mm a')
              : new Date(displayDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
            : null
          return (
            <div key={post.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">
                {displayTime || '—'}
              </span>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${platform.color}18`, color: platform.color }}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium truncate flex-1">{post.content?.trim() || '(No text)'}</span>
              <StatusBadge status={post.status} />
            </div>
          )
        })
      )}
    </div>
  )
}
