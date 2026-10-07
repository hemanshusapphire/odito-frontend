"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useProject } from '@/contexts/ProjectContext'
import {
  useBusinessProfileStatus,
  useBusinessProfileRating,
  useBusinessProfileReviews,
  useReplyToBusinessProfileReview,
} from '@/hooks/useDashboardQueries'
import { Button } from '@/components/ui/button'
import BusinessProfileLoadingState from '@/components/dashboard/google-visibility/business-profile/BusinessProfileLoadingState'
import BusinessProfileEmptyState from '@/components/dashboard/google-visibility/business-profile/BusinessProfileEmptyState'
import ReviewCard from '@/components/dashboard/google-visibility/business-profile/reviews/ReviewCard'
import ReplyComposerDialog from '@/components/dashboard/google-visibility/business-profile/reviews/ReplyComposerDialog'
import { PageTitle, ViewTabs, RangeFilterMenu } from '@/components/dashboard/google-visibility/business-profile/reviews/ReviewsHeader'
import ReviewAnalyticsView from '@/components/dashboard/google-visibility/business-profile/reviews/analytics/ReviewAnalyticsView'
import { DEFAULT_RANGE, isRangeKey } from '@/components/dashboard/google-visibility/business-profile/reviews/analytics/analyticsFormat'
import ReviewsSummary from '@/components/dashboard/google-visibility/business-profile/reviews/ReviewsSummary'
import ReviewsToolbar from '@/components/dashboard/google-visibility/business-profile/reviews/ReviewsToolbar'
import {
  ReviewsListSkeleton,
  ReviewsEmptyState,
  ReviewsNoMatchState,
  ReviewsErrorState,
  ReviewsUnavailableState,
} from '@/components/dashboard/google-visibility/business-profile/reviews/ReviewsStates'

const PAGE_SIZE = 10

function PageHeader() {
  return <PageTitle />
}

/**
 * Business Profile -> Reviews. Reuses the existing review pipeline end to
 * end (useBusinessProfileReviews / useBusinessProfileRating -> authenticated
 * backend endpoints serving the synced MongoDB reviews); this page only adds
 * UI. Search / rating / response / sort are applied server-side and results
 * are paginated, so the DOM never holds more than one page of reviews.
 */
function ReviewsPageContent() {
  const { activeProjectId: projectId } = useProject()

  // View + analytics range live in the URL (refresh/back/share keep them).
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const view = searchParams.get('view') === 'list' ? 'list' : 'insights'
  const analyticsRange = isRangeKey(searchParams.get('range')) ? searchParams.get('range') : DEFAULT_RANGE
  const updateUrl = useCallback((patch) => {
    const next = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(patch)) next.set(k, v)
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])
  const listActive = view === 'list'

  const statusQuery = useBusinessProfileStatus(projectId)
  const status = statusQuery.data?.data
  const connected = !!status?.connected
  const selected = connected && !!status?.serviceEnabled
  const isReconnect = status?.connectionStatus === 'expired' || status?.connectionStatus === 'revoked'

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [rating, setRating] = useState('all')
  const [replied, setReplied] = useState('all')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)

  // Debounce the search box so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Queries only run once a location is actually selected, so a not-yet-set-up
  // project never hits the reviews endpoints.
  const ratingQuery = useBusinessProfileRating(selected && listActive ? projectId : null)
  const reviewsQuery = useBusinessProfileReviews(selected && listActive ? projectId : null, {
    page,
    limit: PAGE_SIZE,
    search,
    rating: rating === 'all' ? '' : rating,
    replied: replied === 'all' ? '' : replied,
    sort: sort === 'newest' ? '' : sort, // server default is newest
  })

  // Reply flow: the page owns the mutation; the dialog is presentational.
  // A reply is only ever sent from an explicit "Post reply" click.
  const replyMutation = useReplyToBusinessProfileReview(projectId)
  const [replyTarget, setReplyTarget] = useState(null)
  const openReply = useCallback((review) => {
    replyMutation.reset()
    setReplyTarget(review)
  }, [replyMutation.reset]) // eslint-disable-line react-hooks/exhaustive-deps
  function closeReply(open) {
    if (!open) {
      setReplyTarget(null)
      replyMutation.reset()
    }
  }
  function submitReply(text) {
    if (!replyTarget || replyMutation.isPending) return
    replyMutation.mutate(
      { reviewId: replyTarget.google_review_id, reply: text },
      { onSuccess: () => setReplyTarget(null) }
    )
  }

  const listTopRef = useRef(null)
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [page])

  const hasActiveFilters = !!search || rating !== 'all' || replied !== 'all' || sort !== 'newest'

  function resetTo(setter) {
    return (value) => {
      setter(value)
      setPage(1)
    }
  }

  function clearFilters() {
    setSearchInput('')
    setSearch('')
    setRating('all')
    setReplied('all')
    setSort('newest')
    setPage(1)
  }

  if (statusQuery.isLoading) {
    return <div className="flex-1"><BusinessProfileLoadingState /></div>
  }

  if (statusQuery.isError) {
    return (
      <div className="flex-1 space-y-6">
        <PageHeader />
        <ReviewsErrorState onRetry={() => statusQuery.refetch()} retrying={statusQuery.isFetching} />
      </div>
    )
  }

  if (!selected) {
    return (
      <div className="flex-1 space-y-6">
        <PageHeader />
        <BusinessProfileEmptyState variant={!connected ? (isReconnect ? 'reconnect' : 'connect') : 'select'} />
      </div>
    )
  }

  const data = reviewsQuery.data?.data
  const reviews = data?.reviews || []
  const pagination = data?.pagination || { page: 1, pages: 0, total: 0, limit: PAGE_SIZE }
  const available = data?.available !== false

  let body
  if (reviewsQuery.isError && !data) {
    body = <ReviewsErrorState onRetry={() => reviewsQuery.refetch()} retrying={reviewsQuery.isFetching} />
  } else if (reviewsQuery.isLoading) {
    body = <ReviewsListSkeleton />
  } else if (!available) {
    body = <ReviewsUnavailableState reason={data?.reason} />
  } else if (reviews.length === 0) {
    body = hasActiveFilters ? <ReviewsNoMatchState onClear={clearFilters} /> : <ReviewsEmptyState />
  } else {
    const from = (pagination.page - 1) * pagination.limit + 1
    const to = from + reviews.length - 1
    body = (
      <>
        <div className={`space-y-3 transition-opacity ${reviewsQuery.isPlaceholderData ? 'opacity-60' : ''}`}>
          {reviews.map((r) => <ReviewCard key={r.google_review_id} review={r} onReply={openReply} />)}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            {reviewsQuery.isFetching && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
            Showing {from.toLocaleString()}–{to.toLocaleString()} of {pagination.total.toLocaleString()}
          </span>
          {pagination.pages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || reviewsQuery.isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.pages || reviewsQuery.isFetching}
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <div className="flex-1 space-y-6 pb-10 min-w-0">
      <PageHeader />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ViewTabs view={view} onChange={(v) => updateUrl({ view: v })} />
        {view === 'insights' && <RangeFilterMenu range={analyticsRange} onChange={(r) => updateUrl({ range: r })} />}
      </div>

      {view === 'insights' ? (
        <ReviewAnalyticsView
          projectId={projectId}
          locationId={status?.businessLocationId || ''}
          range={analyticsRange}
          onRangeChange={(r) => updateUrl({ range: r })}
        />
      ) : (
        <>
          <ReviewsSummary rating={ratingQuery.data?.data} loading={ratingQuery.isLoading} />

          <div ref={listTopRef} className="scroll-mt-4 space-y-4">
            {available && (
              <ReviewsToolbar
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                rating={rating}
                onRatingChange={resetTo(setRating)}
                replied={replied}
                onRepliedChange={resetTo(setReplied)}
                sort={sort}
                onSortChange={resetTo(setSort)}
                hasActiveFilters={hasActiveFilters || !!searchInput}
                onClear={clearFilters}
              />
            )}
            {body}
          </div>
        </>
      )}

      <ReplyComposerDialog
        review={replyTarget}
        open={!!replyTarget}
        onOpenChange={closeReply}
        onSubmit={submitReply}
        isPending={replyMutation.isPending}
        error={replyMutation.error}
      />
    </div>
  )
}

export default function BusinessProfileReviewsPage() {
  // useSearchParams needs a Suspense boundary under the App Router.
  return (
    <Suspense fallback={<div className="flex-1"><BusinessProfileLoadingState /></div>}>
      <ReviewsPageContent />
    </Suspense>
  )
}
