"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

/** Confirms deleting one lead or a bulk selection - `count` drives the copy. */
export default function DeleteConfirmDialog({ open, onOpenChange, count = 1, leadName, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete {count > 1 ? `${count} Leads` : 'Lead'}?</DialogTitle>
          <DialogDescription>
            {count > 1
              ? `This will permanently remove ${count} selected leads. This can't be undone.`
              : `This will permanently remove ${leadName || 'this lead'}. This can't be undone.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
