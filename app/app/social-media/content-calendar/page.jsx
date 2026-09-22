"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, RefreshCcw, Loader2 } from 'lucide-react'
import { CalendarToolbar } from '@/components/social-media/CalendarToolbar'
import { WeekCalendar } from '@/components/social-media/WeekCalendar'
import { MonthCalendar } from '@/components/social-media/MonthCalendar'
import { PostDetailPanel } from '@/components/social-media/PostDetailPanel'
import { StatusLegend } from '@/components/social-media/StatusLegend'
import SocialMediaToastStack from '@/components/social-media/SocialMediaToastStack'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useToastQueue } from '@/hooks/useToastQueue'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  CALENDAR_WEEK_ANCHOR,
  CALENDAR_PLATFORM_FILTERS,
  CALENDAR_POSTS,
  CALENDAR_DEFAULT_SELECTED_POST_ID,
} from '@/lib/socialMediaAIDummyData'

function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const DAY_MS = 24 * 60 * 60 * 1000
const ANCHOR_DATE = parseISODate(CALENDAR_WEEK_ANCHOR)
const MONTH_ANCHOR = new Date(ANCHOR_DATE.getFullYear(), ANCHOR_DATE.getMonth(), 1)
const ALL_PLATFORM_IDS = new Set(CALENDAR_PLATFORM_FILTERS.map((p) => p.id))

/**
 * Social Media AI - Content Calendar. Entirely frontend-only, same as the
 * rest of the module: every post comes from lib/socialMediaAIDummyData.js,
 * no API calls, no real scheduling. The calendar always opens on the week
 * the mock posts were written for (CALENDAR_WEEK_ANCHOR) rather than the
 * real device date - "Today" resets back to it, Prev/Next move into
 * genuinely empty weeks, same as a real calendar with one week planned.
 */
export default function ContentCalendarPage() {
  const [weekStart, setWeekStart] = useState(ANCHOR_DATE)
  const [monthStart, setMonthStart] = useState(MONTH_ANCHOR)
  const [activePlatforms, setActivePlatforms] = useState(() => new Set(ALL_PLATFORM_IDS))
  const [statusFilter, setStatusFilter] = useState('all')
  const [view, setView] = useState('week')
  const [selectedPostId, setSelectedPostId] = useState(CALENDAR_DEFAULT_SELECTED_POST_ID)
  const [regenerating, setRegenerating] = useState(false)
  const { toasts, notify, dismiss } = useToastQueue()
  const isMobile = useIsMobile()

  const filteredPosts = useMemo(() => {
    return CALENDAR_POSTS.filter((post) => {
      const platformVisible = ALL_PLATFORM_IDS.has(post.platform) ? activePlatforms.has(post.platform) : true
      const statusVisible = statusFilter === 'all' || post.status === statusFilter
      return platformVisible && statusVisible
    })
  }, [activePlatforms, statusFilter])

  const selectedPost = useMemo(
    () => CALENDAR_POSTS.find((post) => post.id === selectedPostId) || null,
    [selectedPostId]
  )

  function handleTogglePlatform(id) {
    setActivePlatforms((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleRegenerate() {
    if (regenerating) return
    setRegenerating(true)
    setTimeout(() => {
      setRegenerating(false)
      notify('Calendar regenerated (preview only).', 'success')
    }, 1000)
  }

  function handleReview(post) {
    notify(`Opening "${post.title}" for review is on the roadmap.`, 'default')
  }

  function handlePrevMonth() {
    setMonthStart((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  function handleNextMonth() {
    setMonthStart((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  return (
    <div className="flex-1 space-y-6 pb-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Content Calendar</h1>
          <p className="mt-1 text-sm text-slate-500">Your AI-generated plan, ready for review.</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            {regenerating ? 'Regenerating…' : 'Regenerate calendar'}
          </button>
          <Link
            href="/app/social-media/creative-studio"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800"
          >
            <Plus className="h-4 w-4" />
            Add content
          </Link>
        </div>
      </div>

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
          {view === 'week' ? (
            <WeekCalendar
              weekStart={weekStart}
              posts={filteredPosts}
              selectedPostId={selectedPostId}
              onSelectPost={setSelectedPostId}
              onPrevWeek={() => setWeekStart((prev) => new Date(prev.getTime() - 7 * DAY_MS))}
              onToday={() => setWeekStart(ANCHOR_DATE)}
            />
          ) : (
            <MonthCalendar
              monthStart={monthStart}
              posts={filteredPosts}
              selectedPostId={selectedPostId}
              onSelectPost={setSelectedPostId}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToday={() => setMonthStart(MONTH_ANCHOR)}
            />
          )}

          <StatusLegend timezone="Asia/Kolkata" note="Only fully approved posts can be scheduled." />
        </div>

        {!isMobile && selectedPost && (
          <aside className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-5 lg:w-[300px]">
            <PostDetailPanel post={selectedPost} onClose={() => setSelectedPostId(null)} onReview={handleReview} />
          </aside>
        )}
      </div>

      <Sheet open={isMobile && !!selectedPost} onOpenChange={(open) => !open && setSelectedPostId(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5 [&>button]:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Post details</SheetTitle>
            <SheetDescription>Details for the selected calendar post</SheetDescription>
          </SheetHeader>
          <PostDetailPanel post={selectedPost} onClose={() => setSelectedPostId(null)} onReview={handleReview} />
        </SheetContent>
      </Sheet>

      <SocialMediaToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
