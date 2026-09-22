"use client"

import { Instagram } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/** "Format" dropdown in Brand settings (Instagram (1:1), Story, etc.). */
export function FormatSelect({ options, value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-auto w-full justify-between rounded-lg border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm hover:border-slate-300">
        <span className="flex items-center gap-2">
          <Instagram className="h-4 w-4 text-slate-400" />
          <SelectValue />
        </span>
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

export default FormatSelect
