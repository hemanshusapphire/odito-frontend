"use client"

import { Calendar, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/** "Last 30 days / Sep 1 - Sep 30, 2026" date-range dropdown for the Analytics toolbar. */
export function DateRangeSelector({ options, value, onChange }) {
  const selected = options.find((o) => o.id === value) || options[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-left shadow-sm transition-colors hover:bg-slate-50"
        >
          <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-800">{selected.label}</span>
            <span className="block truncate text-xs text-slate-400">{selected.range}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-slate-200 bg-white text-slate-700 shadow-lg">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex flex-col items-start gap-0.5 text-sm focus:bg-violet-50 focus:text-violet-700 ${
              opt.id === value ? 'bg-violet-50 text-violet-700' : ''
            }`}
          >
            <span className="font-medium">{opt.label}</span>
            <span className="text-xs text-slate-400">{opt.range}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DateRangeSelector
