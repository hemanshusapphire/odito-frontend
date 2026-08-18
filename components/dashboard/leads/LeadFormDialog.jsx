"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { STATUSES, PRIORITIES, STATUS_LABELS, PRIORITY_LABELS } from '@/lib/leadsConstants'

const EMPTY_FORM = { name: '', company: '', email: '', phone: '', message: '', status: 'new', priority: 'medium' }

function toFormState(lead) {
  if (!lead) return EMPTY_FORM
  return {
    name: lead.name || '',
    company: lead.company || '',
    email: lead.email || '',
    phone: lead.phone || '',
    message: lead.message || '',
    status: lead.status || 'new',
    priority: lead.priority || 'medium',
  }
}

/**
 * Add/Edit lead form — `lead` null means "Add", otherwise "Edit". Tags and
 * a source/assignee picker from the original mock were dropped: the real
 * Lead schema has no tags field, and assignment is handled by the
 * dedicated Assign action (AssignLeadDialog), not folded into this form —
 * see the Phase 3B report for why.
 */
export default function LeadFormDialog({ open, onOpenChange, lead, onSubmit, isSubmitting }) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (open) setForm(toFormState(lead))
  }, [open, lead])

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
  }

  const isEdit = !!lead

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
          <DialogDescription>{isEdit ? `Update details for ${lead.name || 'this lead'}.` : 'Add a new lead to your pipeline.'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-name">Name</Label>
              <Input id="lead-name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-company">Company</Label>
              <Input id="lead-company" value={form.company} onChange={(e) => set('company', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-email">Email</Label>
              <Input id="lead-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-phone">Phone</Label>
              <Input id="lead-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-message">Message</Label>
            <Textarea id="lead-message" value={form.message} onChange={(e) => set('message', e.target.value)} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="gap-1.5">
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Add Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
