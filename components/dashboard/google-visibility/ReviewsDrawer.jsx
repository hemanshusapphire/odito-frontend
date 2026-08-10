"use client"

import { useState, useEffect, useMemo } from 'react'
import { Star, Search, MessageSquare, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useBusinessProfileReviews } from '@/hooks/useDashboardQueries'

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function ReviewCard({ review }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {review.reviewer_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.reviewer_photo_url}
              alt={review.reviewer_name}
              className="h-8 w-8 rounded-full shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted shrink-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
              {review.reviewer_name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{review.reviewer_name}</p>
            <StarRow rating={review.star_rating} />
          </div>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{formatDate(review.review_create_time)}</span>
      </div>

      {review.comment && (
        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{review.comment}</p>
      )}

      {review.reply?.comment && (
        <div className="mt-2 rounded-md bg-muted/60 border-l-2 border-primary/40 p-2.5">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Business reply · {formatDate(review.reply.update_time)}
          </p>
          <p className="text-sm whitespace-pre-wrap">{review.reply.comment}</p>
        </div>
      )}
    </div>
  )
}

/**
 * Reviews Drawer — scrollable, paginated, searchable list of synced
 * Business Profile reviews. Renders an "Unavailable" state (never a
 * misleading empty list) when Google restricts review access for this app.
 */
export default function ReviewsDrawer({ open, onOpenChange, projectId }) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  // Debounce search input -> committed search term, and reset to page 1
  // whenever the search term actually changes.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (!open) {
      setSearchInput('')
      setSearch('')
      setPage(1)
    }
  }, [open])

  const { data, isLoading, isFetching } = useBusinessProfileReviews(
    open ? projectId : null,
    { page, limit, search }
  )

  const reviews = data?.data?.reviews || []
  const pagination = data?.data?.pagination || { page: 1, pages: 1, total: 0 }
  const available = data?.data?.available !== false

  const emptyMessage = useMemo(() => {
    if (search) return `No reviews match "${search}".`
    return 'No reviews yet.'
  }, [search])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>Reviews</SheetTitle>
          <SheetDescription>
            {available && pagination.total > 0
              ? `${pagination.total.toLocaleString()} review${pagination.total === 1 ? '' : 's'}`
              : 'Google Business Profile reviews'}
          </SheetDescription>
        </SheetHeader>

        {!available ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">Reviews unavailable</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {data?.data?.reason || 'Google does not provide review access for this application.'}
            </p>
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search reviews..."
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)
              ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                </div>
              ) : (
                reviews.map((r) => <ReviewCard key={r.google_review_id} review={r} />)
              )}
            </div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  {isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.pages || isFetching}
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
