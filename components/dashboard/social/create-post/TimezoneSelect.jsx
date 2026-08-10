"use client"

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export const TIMEZONES = [
  { value: 'America/New_York', label: '(UTC -5:00) Eastern Standard Time' },
  { value: 'America/Chicago', label: '(UTC -6:00) Central Standard Time' },
  { value: 'America/Denver', label: '(UTC -7:00) Mountain Standard Time' },
  { value: 'America/Los_Angeles', label: '(UTC -8:00) Pacific Standard Time' },
  { value: 'Etc/UTC', label: '(UTC +0:00) Coordinated Universal Time' },
  { value: 'Europe/London', label: '(UTC +0:00) London' },
]

export default function TimezoneSelect({ value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <Label className="text-xs text-muted-foreground">Time Zone</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {TIMEZONES.map((tz) => <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}
