"use client"

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { FEED_PLATFORMS, SORT_OPTIONS } from '@/lib/socialFeedsDummyData'

const ALL = '__all__'
const SEARCH_DEBOUNCE_MS = 400

function FilterSelect({ label, value, options, onChange, className }) {
  return (
    <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? '' : v)}>
      <SelectTrigger className={`h-9 text-xs ${className || 'w-auto min-w-[132px]'}`}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * Search + platform/date-range filters + sort, above the feed grid. Each
 * filter change becomes a real GET /api/social/feeds request (server-side
 * filtering now, not a client-side array filter over mock data) — search
 * is debounced locally so typing doesn't fire a request per keystroke;
 * every other filter commits immediately, matching a Select/date input's
 * natural one-change-per-interaction behavior.
 */
export default function FeedFilters({ filters, onFilterChange }) {
  const [searchInput, setSearchInput] = useState(filters.search)

  // Keep the local input in sync if the parent's filter is reset
  // elsewhere (e.g. a future "Clear filters" action) without fighting the
  // debounce for normal typing.
  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  useEffect(() => {
    if (searchInput === filters.search) return
    const timer = setTimeout(() => onFilterChange('search', searchInput), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  return (
    <div className="rounded-xl border bg-card shadow-sm p-4">
      <div className="flex flex-col xl:flex-row xl:items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts..."
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Platform"
            value={filters.platform}
            options={FEED_PLATFORMS.map((p) => ({ value: p.id, label: p.name }))}
            onChange={(v) => onFilterChange('platform', v)}
          />

          <div className="flex items-center gap-1.5 bg-muted/40 border rounded-lg px-2.5 py-1.5">
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange('dateFrom', e.target.value)}
              className="h-6 w-[128px] border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
            />
            <span className="text-muted-foreground text-xs">–</span>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onFilterChange('dateTo', e.target.value)}
              className="h-6 w-[128px] border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
            />
          </div>

          <Select value={filters.sort} onValueChange={(v) => onFilterChange('sort', v)}>
            <SelectTrigger className="h-9 w-auto min-w-[132px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
