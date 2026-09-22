"use client"

import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CALENDAR_PLATFORM_META } from '@/lib/socialMediaAIDummyData'

function PlatformIcons({ id }) {
  if (id === 'all') {
    return (
      <span className="flex -space-x-1.5">
        {['facebook', 'instagram'].map((p) => {
          const meta = CALENDAR_PLATFORM_META[p]
          const Icon = meta.icon
          return (
            <span key={p} className={`flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white ${meta.badgeClass}`}>
              <Icon className="h-2.5 w-2.5" />
            </span>
          )
        })}
      </span>
    )
  }
  const meta = CALENDAR_PLATFORM_META[id]
  const Icon = meta.icon
  return (
    <span className={`flex h-5 w-5 items-center justify-center rounded-full ${meta.badgeClass}`}>
      <Icon className="h-2.5 w-2.5" />
    </span>
  )
}

/** Platform filter for the Analytics toolbar - single-select across Facebook + Instagram / Facebook / Instagram. */
export function AnalyticsPlatformFilter({ options, value, onChange }) {
  const selected = options.find((o) => o.id === value) || options[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 shadow-sm transition-colors hover:bg-slate-50"
        >
          <PlatformIcons id={selected.id} />
          <span className="text-sm font-medium text-slate-800">{selected.label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 border-slate-200 bg-white text-slate-700 shadow-lg">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-2 text-sm focus:bg-violet-50 focus:text-violet-700 ${
              opt.id === value ? 'bg-violet-50 text-violet-700' : ''
            }`}
          >
            <PlatformIcons id={opt.id} />
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AnalyticsPlatformFilter
