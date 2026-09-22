"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/** "All statuses" dropdown filter for the calendar toolbar. */
export function StatusFilter({ options, value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-auto w-[160px] rounded-lg border-slate-200 bg-white py-2 text-sm text-slate-700 shadow-sm hover:border-slate-300">
        <SelectValue placeholder="All statuses" />
      </SelectTrigger>
      <SelectContent className="border-slate-200 bg-white text-slate-700 shadow-lg">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-sm focus:bg-violet-50 focus:text-violet-700">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default StatusFilter
