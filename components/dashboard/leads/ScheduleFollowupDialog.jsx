"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Sets Lead.nextFollowUpAt — a single date, not a multi-item task
 * checklist. The original mock's free-text "task description" field had
 * no backing schema field (Lead has one nextFollowUpAt Date, not a list of
 * checklist items) and was dropped rather than collected and silently
 * discarded — see the Phase 3B report.
 */
export default function ScheduleFollowupDialog({ open, onOpenChange, leadName, onSubmit }) {
  const [due, setDue] = useState('')

  function handleOpenChange(next) {
    if (!next) setDue('')
    onOpenChange(next)
  }

  function handleSubmit() {
    if (!due) return
    onSubmit({ due })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Schedule Follow-up</DialogTitle>
          <DialogDescription>{leadName ? `Set a follow-up date for ${leadName}.` : 'Set a follow-up date.'}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="followup-date">Follow-up date</Label>
          <Input id="followup-date" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!due}>Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
