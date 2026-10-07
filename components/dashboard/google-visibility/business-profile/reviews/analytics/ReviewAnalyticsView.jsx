"use client"

import { useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useBusinessProfileReviewAnalytics } from '@/hooks/useDashboardQueries'
import { ReviewsErrorState, ReviewsEmptyState, ReviewsUnavailableState } from '../ReviewsStates'
import { SkeletonCard } from './AnalyticsCard'
import { AnalyticsRangeProvider } from './AnalyticsDateRange'
import { formatRangeSpan } from './analyticsFormat'
import ReviewInsightCards from './ReviewInsightCards'
import RatingAnalytics from './RatingAnalytics'
import ReviewGlance from './ReviewGlance'
import ReviewDistribution from './ReviewDistribution'
import SentimentSection from './SentimentSection'
import PeriodComparison from './PeriodComparison'
import KeywordCloud from './KeywordCloud'
import ReviewThemes from './ReviewThemes'

/** Skeleton mirroring the real card heights so loading never shifts the layout. */
function AnalyticsSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading review analytics">
      <SkeletonCard height="h-20" />
      <SkeletonCard height="h-80" />
      <SkeletonCard height="h-28" />
      <SkeletonCard height="h-80" />
      <div className="rounded-[14px] border border-[#dbe5f4] bg-card p-5 dark:border-border"><Skeleton className="h-96 w-full" /></div>
      <SkeletonCard height="h-[34rem]" />
      <SkeletonCard height="h-72" />
      <SkeletonCard height="h-48" />
    </div>
  )
}

/**
 * Reviews -> Insights. ONE request (range + timezone) feeds every card; the range
 * lives in a single provider so the compact chips in each card header are views of
 * the same state. Layout follows the reference: a tinted canvas with stacked,
 * dense white cards. All numbers are the backend's aggregates.
 */
export default function ReviewAnalyticsView({ projectId, locationId, range, onRangeChange }) {
  const tz = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' } catch { return 'UTC' }
  }, [])
  const query = useBusinessProfileReviewAnalytics(projectId, { locationId, range, tz })
  const data = query.data?.data

  const rangeValue = useMemo(
    () => ({ range, onChange: onRangeChange, span: data?.range ? formatRangeSpan(data.range.startDate, data.range.endDate) : '' }),
    [range, onRangeChange, data?.range]
  )

  let body
  if (query.isError && !data) {
    body = <ReviewsErrorState onRetry={() => query.refetch()} retrying={query.isFetching} />
  } else if (query.isLoading || (!data && query.isFetching)) {
    body = <AnalyticsSkeleton />
  } else if (data && data.available === false) {
    body = <ReviewsUnavailableState reason={data.reason} />
  } else if (data && data.overview.lifetime.totalReviews === 0) {
    body = <ReviewsEmptyState />
  } else if (data) {
    const { overview, ratings, trends, glance, response, distribution, sentiment } = data
    const unit = data.range.bucket
    const periodTotal = overview.period.totalReviews
    const refetch = () => query.refetch()
    body = (
      // The previous range stays on screen (dimmed) while the next one loads - no flash, no layout shift.
      <div className={`space-y-3 transition-opacity duration-200 ${query.isPlaceholderData ? 'opacity-60' : ''}`}>
        <ReviewInsightCards overview={overview} rangeKey={data.range.key} />
        <RatingAnalytics ratings={ratings} trends={trends} total={periodTotal} unit={unit} />
        <ReviewGlance glance={glance} response={response} rangeKey={data.range.key} />
        <ReviewDistribution distribution={distribution} unit={unit} />
        <SentimentSection sentiment={sentiment} unit={unit} />
        <PeriodComparison comparison={data.comparison} onRetry={refetch} />
        <KeywordCloud keywords={data.keywords} periodTotal={periodTotal} onRetry={refetch} />
        <ReviewThemes themes={data.themes} periodTotal={periodTotal} onRetry={refetch} />
      </div>
    )
  }

  return (
    <AnalyticsRangeProvider value={rangeValue}>
      <div className="min-w-0 rounded-2xl bg-[#f4f6fb] p-2.5 sm:p-3.5 dark:bg-muted/20">{body}</div>
    </AnalyticsRangeProvider>
  )
}
