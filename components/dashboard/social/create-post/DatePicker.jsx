"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Native date input, styled to match the rest of the modal. No shadcn
 * Calendar component exists in this project yet, so this stays consistent
 * with the plain <input type="date"> pattern already used across Leads/
 * Feeds/Publishing rather than introducing a new dependency.
 */
export default function DatePicker({ value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <Label className="text-xs text-muted-foreground">Date</Label>
      <Input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="text-xs" />
    </div>
  )
}
