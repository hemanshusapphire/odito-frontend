"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { USERS } from '@/lib/leadsDummyData'

/** Assign one lead, or bulk-assign `count` selected leads, to a team member. */
export default function AssignLeadDialog({ open, onOpenChange, count = 1, onAssign }) {
  const [assignee, setAssignee] = useState(USERS[0].name)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign {count > 1 ? `${count} Leads` : 'Lead'}</DialogTitle>
          <DialogDescription>Choose who should own {count > 1 ? 'these leads' : 'this lead'}.</DialogDescription>
        </DialogHeader>

        <Select value={assignee} onValueChange={setAssignee}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {USERS.map((u) => <SelectItem key={u.name} value={u.name}>{u.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onAssign(assignee)}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
