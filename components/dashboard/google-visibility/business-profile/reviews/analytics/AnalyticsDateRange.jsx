"use client"

import { createContext, useContext } from 'react'
import { CalendarDays } from 'lucide-react'
import { RANGE_OPTIONS, DEFAULT_RANGE } from './analyticsFormat'

/**
 * ONE shared range state for the whole dashboard. Every card shows the compact
 * chips below (as in the reference), but they all read/write this single value,
 * so changing any of them updates every module together through one query.
 */
const RangeContext = createContext({ range: DEFAULT_RANGE, onChange: () => {}, span: '' })
export const AnalyticsRangeProvider = RangeContext.Provider

/** Compact range chips: calendar icon, quiet chips, navy active pill with a dot + the actual date span. */
export default function AnalyticsDateRange() {
  const { range, onChange, span } = useContext(RangeContext)
  return (
    <div className="flex max-w-full items-center gap-1 overflow-x-auto sm:gap-1.5" role="radiogroup" aria-label="Date range">
      <CalendarDays className="mr-1 h-[18px] w-[18px] shrink-0 text-[#1b2540] dark:text-foreground" aria-hidden="true" />
      {RANGE_OPTIONS.map((o) => {
        const active = o.value === range
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.long}
            onClick={() => !active && onChange(o.value)}
            className={`flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] px-2.5 text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
              active
                ? 'bg-[#1f2a7a] font-medium text-white dark:bg-indigo-500'
                : 'text-[#44546a] hover:bg-muted dark:text-muted-foreground'
            }`}
          >
            {active && <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" />}
            {o.label}
            {active && span && <span className="hidden font-normal opacity-80 @min-[700px]/main:inline">{span}</span>}
          </button>
        )
      })}
    </div>
  )
}
