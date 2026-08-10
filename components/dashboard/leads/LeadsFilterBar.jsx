"use client"

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { SOURCES, STATUSES, PRIORITIES, TAGS, USERS } from '@/lib/leadsDummyData'

const ALL = '__all__'

function FilterSelect({ label, value, options, onChange }) {
  return (
    <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? '' : v)}>
      <SelectTrigger className="h-9 w-auto min-w-[128px] text-xs">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const FILTER_LABELS = { status: 'Status', source: 'Source', assignedTo: 'Assigned', priority: 'Priority', tag: 'Tag' }

/** Search + filter row, plus an active-filter-chip summary underneath. */
export default function LeadsFilterBar({ filters, onFilterChange, onClearAll }) {
  const activeChips = Object.entries(FILTER_LABELS)
    .filter(([key]) => filters[key])
    .map(([key, label]) => ({ key, label: `${label}: ${filters[key]}` }))
  if (filters.dateFrom || filters.dateTo) {
    activeChips.push({ key: 'date', label: `Date: ${filters.dateFrom || '…'} → ${filters.dateTo || '…'}` })
  }
  const hasAnyFilter = activeChips.length > 0 || !!filters.search

  function removeChip(key) {
    if (key === 'date') { onFilterChange('dateFrom', ''); onFilterChange('dateTo', ''); return }
    onFilterChange(key, '')
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-4">
      <div className="flex flex-col xl:flex-row xl:items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search leads by name, company, or email…"
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect label="Status" value={filters.status} options={STATUSES} onChange={(v) => onFilterChange('status', v)} />
          <FilterSelect label="Source" value={filters.source} options={SOURCES} onChange={(v) => onFilterChange('source', v)} />
          <FilterSelect label="Assigned To" value={filters.assignedTo} options={USERS.map((u) => u.name)} onChange={(v) => onFilterChange('assignedTo', v)} />
          <FilterSelect label="Priority" value={filters.priority} options={PRIORITIES} onChange={(v) => onFilterChange('priority', v)} />
          <FilterSelect label="Tags" value={filters.tag} options={TAGS} onChange={(v) => onFilterChange('tag', v)} />

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
              <button onClick={() => removeChip(chip.key)} className="hover:text-foreground rounded-full p-0.5">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
