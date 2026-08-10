"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function RestoreConfirmDialog({ open, onOpenChange, restorePoint, loading, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4.5 w-4.5" />
            Restore Website?
          </DialogTitle>
          <DialogDescription>
            This will overwrite the current live site with the {restorePoint} backup. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? 'Restoring…' : 'Yes, Restore Website'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
