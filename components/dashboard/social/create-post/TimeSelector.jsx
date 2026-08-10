"use client"

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const FORMATS = ['AM', 'PM']

/** Hour / Minute / AM-PM select trio for the schedule row. */
export default function TimeSelector({ hour, minute, format, onHourChange, onMinuteChange, onFormatChange }) {
  return (
    <>
      <div className="flex flex-col gap-1.5 w-20 shrink-0">
        <Label className="text-xs text-muted-foreground">Hour</Label>
        <Select value={hour} onValueChange={onHourChange}>
          <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{HOURS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5 w-20 shrink-0">
        <Label className="text-xs text-muted-foreground">Min</Label>
        <Select value={minute} onValueChange={onMinuteChange}>
          <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{MINUTES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5 w-20 shrink-0">
        <Label className="text-xs text-muted-foreground">Format</Label>
        <Select value={format} onValueChange={onFormatChange}>
          <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{FORMATS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </>
  )
}
