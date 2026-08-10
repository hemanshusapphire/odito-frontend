"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TODAY_ISO } from '@/lib/leadsDummyData'

export default function ScheduleFollowupDialog({ open, onOpenChange, leadName, onSubmit }) {
  const [due, setDue] = useState(TODAY_ISO)
  const [text, setText] = useState('Follow up')

  function handleOpenChange(next) {
    if (!next) { setDue(TODAY_ISO); setText('Follow up') }
    onOpenChange(next)
  }

  function handleSubmit() {
    if (!due) return
    onSubmit({ text: text.trim() || 'Follow up', due })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Schedule Follow-up</DialogTitle>
          <DialogDescription>{leadName ? `Set a follow-up task for ${leadName}.` : 'Set a follow-up task.'}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="followup-text">Task</Label>
            <Input id="followup-text" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="followup-date">Due date</Label>
            <Input id="followup-date" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!due}>Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
