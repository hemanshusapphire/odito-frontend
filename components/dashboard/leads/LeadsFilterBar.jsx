"use client"

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { STATUSES, PRIORITIES, STATUS_LABELS, PRIORITY_LABELS } from '@/lib/leadsConstants'

const ALL = '__all__'

function FilterSelect({ label, value, options, labels, onChange }) {
  return (
    <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? '' : v)}>
      <SelectTrigger className="h-9 w-auto min-w-[128px] text-xs">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>{labels[opt] || opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const FILTER_LABELS = { status: 'Status', priority: 'Priority' }
const VALUE_LABELS = { status: STATUS_LABELS, priority: PRIORITY_LABELS }

/**
 * Search + filter row, plus an active-filter-chip summary underneath.
 * Only Status and Priority are real server-side filters (see
 * leadService.getLeads) — Source/Assigned/Tags/date-range filters from the
 * original mock had no backend query support and were dropped rather than
 * built against fields the API can't actually filter by (Phase 3B report,
 * Known Limitations).
 */
export default function LeadsFilterBar({ filters, onFilterChange, onClearAll }) {
  const activeChips = Object.entries(FILTER_LABELS)
    .filter(([key]) => filters[key])
    .map(([key, label]) => ({ key, label: `${label}: ${VALUE_LABELS[key][filters[key]] || filters[key]}` }))
  const hasAnyFilter = activeChips.length > 0 || !!filters.search

  return (
    <div className="rounded-xl border bg-card shadow-sm p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search leads by name, company, email, or phone…"
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect label="Status" value={filters.status} options={STATUSES} labels={STATUS_LABELS} onChange={(v) => onFilterChange('status', v)} />
          <FilterSelect label="Priority" value={filters.priority} options={PRIORITIES} labels={PRIORITY_LABELS} onChange={(v) => onFilterChange('priority', v)} />

          {hasAnyFilter && (
            <Button variant="ghost" size="sm" onClick={onClearAll} className="gap-1.5 text-muted-foreground">
              <X className="h-3.5 w-3.5" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3.5">
          {activeChips.map((chip) => (
            <span key={chip.key} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-medium">
              {chip.label}
              <button onClick={() => onFilterChange(chip.key, '')} className="hover:text-foreground rounded-full p-0.5">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
