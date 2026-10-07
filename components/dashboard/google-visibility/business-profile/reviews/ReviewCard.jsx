"use client"

import { memo, useState } from 'react'
import { Star, CornerDownRight, Reply } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatReviewDate, formatRelativeDate, hasReply } from '@/lib/businessProfileReviews'

const LONG_COMMENT = 280

export function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={`h-4 w-4 ${n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

function ReviewCard({ review, onReply }) {
  const [expanded, setExpanded] = useState(false)
  const responded = hasReply(review)
  const comment = review.comment || ''
  const isLong = comment.length > LONG_COMMENT
  const shown = isLong && !expanded ? `${comment.slice(0, LONG_COMMENT).trimEnd()}…` : comment
  const relative = formatRelativeDate(review.review_create_time)

  return (
    <Card className="p-4 sm:p-5 gap-0">
      <div className="flex items-start gap-3">
        {review.reviewer_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.reviewer_photo_url}
            alt=""
            className="h-10 w-10 rounded-full shrink-0 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-10 w-10 rounded-full bg-muted shrink-0 flex items-center justify-center text-sm font-medium text-muted-foreground"
          >
            {review.reviewer_name?.[0]?.toUpperCase() || '?'}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{review.reviewer_name || 'Anonymous'}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <StarRow rating={review.star_rating} />
                <span className="text-xs text-muted-foreground" title={formatReviewDate(review.review_create_time)}>
                  {relative || formatReviewDate(review.review_create_time)}
                </span>
              </div>
            </div>
            {responded ? (
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/30">
                Responded
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">Not responded</Badge>
            )}
          </div>

          {comment ? (
            <p className="mt-3 text-sm text-foreground/90 whitespace-pre-wrap break-words">
              {shown}
              {isLong && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="ml-1 text-primary hover:underline focus-visible:underline outline-none"
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </p>
          ) : (
            <p className="mt-3 text-sm italic text-muted-foreground">Rating only - no written review.</p>
          )}

          {responded && (
            <div className="mt-3 rounded-md border-l-2 border-primary/50 bg-muted/60 p-3">
              <p className="flex flex-wrap items-center gap-x-1.5 text-xs font-medium text-muted-foreground mb-1">
                <CornerDownRight className="h-3.5 w-3.5" aria-hidden="true" />
                Business response
                {review.reply?.update_time && <span>· {formatReviewDate(review.reply.update_time)}</span>}
                {review.reply?.state === 'PENDING' && <span className="text-amber-600">· Pending Google review</span>}
              </p>
              <p className="text-sm whitespace-pre-wrap break-words">{review.reply.comment}</p>
            </div>
          )}

          {!responded && onReply && (
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onReply(review)}
                aria-label={`Reply to ${review.reviewer_name || 'this review'}`}
                className="gap-1.5"
              >
                <Reply className="h-4 w-4" aria-hidden="true" />
                Reply
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default memo(ReviewCard)
