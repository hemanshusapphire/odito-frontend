"use client"

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import ThemeFilters from './ThemeFilters'
import { SORT_OPTIONS } from '@/lib/wordpressThemesDummyData'

/** Search + filter chips + sort dropdown, above the theme list. */
export default function ThemesToolbar({ search, onSearchChange, filter, onFilterChange, sort, onSortChange, counts }) {
  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search themes..." className="pl-9 h-9 text-sm" />
        </div>
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 w-auto min-w-[170px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <ThemeFilters active={filter} onChange={onFilterChange} counts={counts} />
    </div>
  )
}
