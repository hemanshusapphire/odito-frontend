"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle } from 'lucide-react'

export default function DeletePostDialog({
  open,
  onOpenChange,
  post,
  onConfirm,
  isDeleting = false
}) {
  if (!post) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Delete Google Business Post</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete this post? This will permanently remove the post from your Google Business Profile listing on Google Search and Maps.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground border">
          <p className="line-clamp-2 italic">
            "{post.summary || post.event?.title || 'Selected post'}"
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onConfirm(post.google_post_id)}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isDeleting ? 'Deleting…' : 'Delete from Google'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
