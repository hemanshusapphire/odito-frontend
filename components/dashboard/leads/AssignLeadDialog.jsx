"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

/**
 * Assign one lead, or bulk-assign `count` selected leads. Simplified from
 * the original mock's team-member picker: Odito's actual multi-tenancy
 * model is one owning user per project (see AuthUtil/SeoProject — no
 * shared/multi-user projects exist), so there is no real list of
 * teammates to populate a picker with. The only two genuine states are
 * "assigned to the project's owner" and "unassigned" — `onAssign` receives
 * a boolean (true = assign to me, false = unassign).
 */
export default function AssignLeadDialog({ open, onOpenChange, count = 1, currentUserName, onAssign }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign {count > 1 ? `${count} Leads` : 'Lead'}</DialogTitle>
          <DialogDescription>
            Odito projects don&apos;t support multiple team members yet — {count > 1 ? 'these leads' : 'this lead'} can be
            assigned to you ({currentUserName}) or left unassigned.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onAssign(false)}>Unassign</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => onAssign(true)}>Assign to Me</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
