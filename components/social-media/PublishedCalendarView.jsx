"use client"

import { useMemo, useState } from 'react'
import { DateTime } from 'luxon'
import { Loader2 } from 'lucide-react'
import { CalendarToolbar } from '@/components/social-media/CalendarToolbar'
import { WeekCalendar } from '@/components/social-media/WeekCalendar'
import { MonthCalendar } from '@/components/social-media/MonthCalendar'
import { PostDetailPanel } from '@/components/social-media/PostDetailPanel'
import { StatusLegend } from '@/components/social-media/StatusLegend'
import { PostListError } from '@/components/social-media/ScheduledPostList'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { useCalendarPosts } from '@/hooks/useSocialMediaAI'
import { describeApiError } from '@/lib/socialMedia/failureMessages'
import { CALENDAR_PLATFORM_FILTERS } from '@/lib/socialMediaAIDummyData'

const ALL_PLATFORM_IDS = new Set(CALENDAR_PLATFORM_FILTERS.map((p) => p.id))
const toDate = (dt) => new Date(dt.year, dt.month - 1, dt.day)

/** Monday of the current week / first of the current month, in the viewer's local calendar. */
const startOfThisWeek = () => toDate(DateTime.local().startOf('week'))
const startOfThisMonth = () => toDate(DateTime.local().startOf('month'))

/**
 * The publishing API filters scheduledAt on UTC day boundaries, while each
 * post is placed by its OWN timezone — so the fetched window is padded by a
 * few days on each side to never miss a post near an edge.
 */
function fetchWindow(view, weekStart, monthStart) {
  const base = view === 'week' ? DateTime.fromJSDate(weekStart) : DateTime.fromJSDate(monthStart)
  const from = view === 'week' ? base.minus({ days: 2 }) : base.minus({ days: 9 })
  const to = view === 'week' ? base.plus({ days: 8 }) : base.plus({ months: 1, days: 9 })
  return { from: from.toFormat('yyyy-LL-dd'), to: to.toFormat('yyyy-LL-dd') }
}

/**
 * The REAL posts of the scheduler backend (scheduled / publishing / published / failed) for the visible week or month.
 * Drafts (no date) and cancelled posts never appear. This is the EXECUTION side of the Content Calendar page; the plan
 * of what to post lives in ContentPlanSection.
 */
export function PublishedCalendarView({ projectId }) {
  const [weekStart, setWeekStart] = useState(startOfThisWeek)
  const [monthStart, setMonthStart] = useState(startOfThisMonth)
  const [activePlatforms, setActivePlatforms] = useState(() => new Set(ALL_PLATFORM_IDS))
  const [statusFilter, setStatusFilter] = useState('all')
  const [view, setView] = useState('week')
  const [selectedPostId, setSelectedPostId] = useState(null)
  const isMobile = useIsMobile()

  const range = useMemo(() => fetchWindow(view, weekStart, monthStart), [view, weekStart, monthStart])
  const calendar = useCalendarPosts(projectId, range)

  const filteredPosts = useMemo(() => calendar.posts.filter((post) => {
    const platformVisible = ALL_PLATFORM_IDS.has(post.platform) ? activePlatforms.has(post.platform) : true
    const statusVisible = statusFilter === 'all' || post.status === statusFilter
    return platformVisible && statusVisible
  }), [calendar.posts, activePlatforms, statusFilter])

  const selectedPost = useMemo(() => calendar.posts.find((post) => post.id === selectedPostId) || null, [calendar.posts, selectedPostId])

  function handleTogglePlatform(id) {
    setActivePlatforms((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const shiftWeek = (days) => setWeekStart((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + days))
  const shiftMonth = (months) => setMonthStart((prev) => new Date(prev.getFullYear(), prev.getMonth() + months, 1))

  return (
    <div className="space-y-6" data-testid="published-calendar">
      <CalendarToolbar
        activePlatforms={activePlatforms}
        onTogglePlatform={handleTogglePlatform}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        view={view}
        onViewChange={setView}
      />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-5">
          {calendar.isLoading ? (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4" aria-busy="true" aria-label="Loading calendar" data-testid="calendar-loading">
              <Skeleton className="h-8 w-1/3 bg-slate-200" />
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-40 bg-slate-100" />)}
              </div>
            </div>
          ) : calendar.isError ? (
            <PostListError message={describeApiError(calendar.error).message} onRetry={() => calendar.refetch()} retrying={calendar.isFetching} />
          ) : (
            <>
              {calendar.isFetching && (
                <p className="flex items-center gap-1.5 text-xs text-slate-400" data-testid="refreshing"><Loader2 className="h-3 w-3 animate-spin" />Updating…</p>
              )}
              {view === 'week' ? (
                <WeekCalendar
                  weekStart={weekStart}
                  posts={filteredPosts}
                  selectedPostId={selectedPostId}
                  onSelectPost={setSelectedPostId}
                  onPrevWeek={() => shiftWeek(-7)}
                  onNextWeek={() => shiftWeek(7)}
                  onToday={() => setWeekStart(startOfThisWeek())}
                />
              ) : (
                <MonthCalendar
                  monthStart={monthStart}
                  posts={filteredPosts}
                  selectedPostId={selectedPostId}
                  onSelectPost={setSelectedPostId}
                  onPrevMonth={() => shiftMonth(-1)}
                  onNextMonth={() => shiftMonth(1)}
                  onToday={() => setMonthStart(startOfThisMonth())}
                />
              )}
              {filteredPosts.length === 0 && (
                <p className="text-center text-sm text-slate-400" data-testid="calendar-empty">
                  {calendar.posts.length === 0 ? 'No scheduled or published posts in this period.' : 'No posts match these filters.'}
                </p>
              )}
              {calendar.truncated && <p className="text-xs text-slate-400">Showing the first 500 posts in this period.</p>}
            </>
          )}

          <StatusLegend note="Times are shown in the timezone each post was scheduled in." />
        </div>

        {!isMobile && selectedPost && (
          <aside className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-5 lg:w-[300px]">
            <PostDetailPanel post={selectedPost} onClose={() => setSelectedPostId(null)} />
          </aside>
        )}
      </div>

      <Sheet open={isMobile && !!selectedPost} onOpenChange={(open) => !open && setSelectedPostId(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5 [&>button]:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Post details</SheetTitle>
            <SheetDescription>Details for the selected calendar post</SheetDescription>
          </SheetHeader>
          <PostDetailPanel post={selectedPost} onClose={() => setSelectedPostId(null)} />
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default PublishedCalendarView
