"use client"

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export default function ApprovalCheckbox({ checked, onChange }) {
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id="no-approval-needed" checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      <Label htmlFor="no-approval-needed" className="text-sm font-normal cursor-pointer">No approval required</Label>
    </div>
  )
}
