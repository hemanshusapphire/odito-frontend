"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function AddNoteDialog({ open, onOpenChange, leadName, onSubmit }) {
  const [text, setText] = useState('')

  function handleOpenChange(next) {
    if (!next) setText('')
    onOpenChange(next)
  }

  function handleSubmit() {
    if (!text.trim()) return
    onSubmit(text.trim())
    setText('')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>{leadName ? `Add a note for ${leadName}.` : 'Add a note.'}</DialogDescription>
        </DialogHeader>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note…"
          className="min-h-[100px]"
          autoFocus
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!text.trim()}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
