"use client"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"

/**
 * Confirmation for deleting a post — same AlertDialog pattern as
 * CancelPostConfirmDialog.jsx, no new design system.
 *
 * The message and the action it actually performs depend on what deleting
 * this SPECIFIC post really does (see socialPublishingService.js's
 * deletePublication):
 *
 * - draft/scheduled/failed/cancelled: no external post exists yet — a
 *   plain Odito-only deletion, worded simply.
 * - published Facebook: a real Meta DELETE is attempted first; the Odito
 *   record is only removed once that succeeds. The copy says so
 *   explicitly, so the user understands BOTH the real Facebook post and
 *   the Odito record are about to go away — never just "removed from a
 *   list".
 * - published Instagram: the Graph API has no DELETE for IG Media at all
 *   (verified against Meta's current documented capabilities) — nothing
 *   in this app can ever touch the real Instagram post. Rather than a
 *   misleading "Delete" that would silently only remove the Odito record,
 *   this becomes an explicitly different, honestly-labeled action:
 *   "Remove from Odito history".
 */
export default function DeletePostConfirmDialog({ post, open, onOpenChange, onConfirm, loading }) {
  const isPublished = post?.status === 'published'
  const isInstagram = post?.platform === 'instagram'
  const isFacebook = post?.platform === 'facebook'
  const isInstagramHistoryOnly = isPublished && isInstagram

  const title = isInstagramHistoryOnly ? 'Remove from Odito history?' : 'Delete this post?'
  const confirmLabel = isInstagramHistoryOnly
    ? (loading ? 'Removing…' : 'Remove from Odito History')
    : (loading ? 'Deleting…' : 'Delete Post')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-120">
        <div className="px-7 pt-7 pb-6">
          <AlertDialogHeader className="space-y-3 text-left sm:text-left">
            <AlertDialogTitle className="text-xl font-bold text-foreground">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
              {post && (
                isInstagramHistoryOnly ? (
                  <>
                    Instagram does not support deleting a published post through the API.
                    This will remove the record from Odito&apos;s history only —{' '}
                    <strong>the real Instagram post will remain untouched</strong>. Delete it
                    directly in the Instagram app if you want it gone from Instagram too.
                  </>
                ) : isPublished && isFacebook ? (
                  <>
                    This will <strong>permanently delete the published post from Facebook</strong> and
                    remove it from Odito. This cannot be undone.
                  </>
                ) : (
                  <>This post will be permanently removed from Odito. This cannot be undone.</>
                )
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
            {confirmLabel}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
