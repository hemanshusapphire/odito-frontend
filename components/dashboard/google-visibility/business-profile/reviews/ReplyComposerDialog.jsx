"use client"

import { useEffect, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { StarRow } from './ReviewCard'
import {
  MAX_REPLY_BYTES,
  replyByteLength,
  replyErrorMessage,
  isRetryableReplyError,
} from '@/lib/businessProfileReviews'

/**
 * Reply composer for ONE review. Purely presentational: the parent owns the
 * mutation (so the request, cache update and error state live in one place)
 * and passes `onSubmit(text)`, `isPending` and `error`. Every send is an
 * explicit click on "Post reply" - nothing is ever sent automatically.
 *
 * While a request is in flight the dialog can't be dismissed and the submit
 * button is disabled, so a double click can't send twice (the backend also
 * rejects a concurrent duplicate).
 */
export default function ReplyComposerDialog({ review, open, onOpenChange, onSubmit, isPending, error }) {
  const [text, setText] = useState('')

  // Fresh composer every time it opens for a review.
  useEffect(() => {
    if (open) setText('')
  }, [open, review?.google_review_id])

  const trimmed = text.trim()
  const bytes = replyByteLength(text)
  const tooLong = bytes > MAX_REPLY_BYTES
  const canSubmit = !!trimmed && !tooLong && !isPending
  const retry = !!error && isRetryableReplyError(error)
  const alreadyDone = error?.code === 'ALREADY_REPLIED' || error?.code === 'REVIEW_NOT_FOUND'

  function handleOpenChange(next) {
    if (isPending) return // can't dismiss mid-send
    onOpenChange(next)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (canSubmit) onSubmit(trimmed)
  }

  if (!review) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Reply to {review.reviewer_name || 'this reviewer'}</DialogTitle>
            <DialogDescription>
              Your reply is posted publicly on Google as your business.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border bg-muted/40 p-3 space-y-1.5">
            <StarRow rating={review.star_rating} />
            {review.comment ? (
              <p className="text-sm text-foreground/90 line-clamp-4 whitespace-pre-wrap break-words">{review.comment}</p>
            ) : (
              <p className="text-sm italic text-muted-foreground">Rating only - no written review.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Thank you for your feedback..."
              aria-label={`Your reply to ${review.reviewer_name || 'this review'}`}
              aria-invalid={tooLong || undefined}
              rows={5}
              disabled={isPending || alreadyDone}
              autoFocus
            />
            <div className="flex justify-end text-xs">
              <span className={tooLong ? 'text-red-500' : 'text-muted-foreground'}>
                {bytes.toLocaleString()} / {MAX_REPLY_BYTES.toLocaleString()}
              </span>
            </div>
            {tooLong && (
              <p className="text-xs text-red-500">Reply is too long. Please shorten it.</p>
            )}
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{replyErrorMessage(error)}</span>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
              {alreadyDone ? 'Close' : 'Cancel'}
            </Button>
            {!alreadyDone && (
              <Button type="submit" disabled={!canSubmit} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {isPending ? 'Posting…' : retry ? 'Try again' : 'Post reply'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
