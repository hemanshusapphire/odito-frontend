"use client"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"

/**
 * Confirmation for cancelling a scheduled (or draft) post — same
 * AlertDialog pattern as deleted-projects/RestoreConfirmDialog.jsx, no new
 * design system. Cancelling only ever changes status to 'cancelled' in
 * MongoDB (see useCancelSocialPost/socialPublishingService.cancelPublication)
 * — it never calls Facebook/Instagram, since a cancelled post was never
 * actually published in the first place.
 */
export default function CancelPostConfirmDialog({ post, open, onOpenChange, onConfirm, loading }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-120">
        <div className="px-7 pt-7 pb-6">
          <AlertDialogHeader className="space-y-3 text-left sm:text-left">
            <AlertDialogTitle className="text-xl font-bold text-foreground">
              Cancel this post?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
              {post && (
                <>
                  This post will be marked <strong>cancelled</strong> and will never be
                  automatically published{post.scheduledAt ? ' at its scheduled time' : ''}.
                  It is not published to Facebook/Instagram now or later. This cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className="border-t border-border" />

        <div className="flex items-center justify-end gap-3 px-7 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-lg border border-border bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Keep Post
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-destructive px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Cancelling…' : 'Cancel Post'}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
