"use client"

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { FEED_PLATFORMS, STATUSES, SORT_OPTIONS } from '@/lib/socialFeedsDummyData'

const ALL = '__all__'

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

/** Search + platform/status/date-range filters + sort, above the feed grid. */
export default function FeedFilters({ filters, onFilterChange }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-4">
      <div className="flex flex-col xl:flex-row xl:items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
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
          <FilterSelect label="Status" value={filters.status} options={STATUSES} onChange={(v) => onFilterChange('status', v)} />

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
