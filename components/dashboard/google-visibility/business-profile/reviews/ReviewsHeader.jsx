"use client"

import { List, LineChart, Filter } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { RANGE_OPTIONS } from './analytics/analyticsFormat'

/** The Google "G" mark used in the source pill (same multi-colour mark as the insight card). */
function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#fff" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5zM46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5zM10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1zM24 48c6.5 0 11.900-2.100 15.900-5.800l-7.500-5.800c-2.100 1.400-4.800 2.300-8.400 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z" />
    </svg>
  )
}

/** Title row: "Reviews" + the data-source pill. (Odito reads Google only, so there is a single source.) */
export function PageTitle() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <h1 className="text-[26px] font-medium leading-tight tracking-tight text-[#1b2540] dark:text-foreground">Reviews</h1>
      <span
        className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#1f2a7a] px-4 text-[15px] font-medium text-white dark:bg-indigo-500"
        aria-label="Data source: Google"
      >
        <GoogleG /> Google
      </span>
    </div>
  )
}

/** "List | Insights" segmented control (navy active segment). */
export function ViewTabs({ view, onChange }) {
  const trigger = 'h-full flex-none gap-2 rounded-none px-4 text-[15px] data-[state=active]:bg-[#1f2a7a] data-[state=active]:text-white data-[state=active]:shadow-none dark:data-[state=active]:bg-indigo-500 dark:data-[state=active]:text-white'
  return (
    <Tabs value={view} onValueChange={onChange}>
      <TabsList aria-label="Reviews view" className="h-11 gap-0 overflow-hidden rounded-xl border border-[#dbe5f4] bg-card p-0 dark:border-border">
        <TabsTrigger value="list" className={trigger}><List className="h-[18px] w-[18px]" aria-hidden="true" />List</TabsTrigger>
        <TabsTrigger value="insights" className={trigger}><LineChart className="h-[18px] w-[18px]" aria-hidden="true" />Insights</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

/** "Filter" menu: the same shared date range as the chips in every card (also the easiest way to change it on a phone). */
export function RangeFilterMenu({ range, onChange }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#dbe5f4] bg-card px-4 text-[15px] text-[#1b2540] outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring dark:border-border dark:text-foreground"
        >
          <Filter className="h-[18px] w-[18px]" aria-hidden="true" />
          Filter
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>Date range</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={range} onValueChange={onChange}>
          {RANGE_OPTIONS.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>{o.long}</DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
