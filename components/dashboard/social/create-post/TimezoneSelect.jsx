"use client"

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { TIMEZONES } from '@/lib/timezones'

export { TIMEZONES }

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
