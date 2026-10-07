"use client"

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const RATING_OPTIONS = [
  { value: 'all', label: 'All ratings' },
  { value: '5', label: '5 stars' },
  { value: '4', label: '4 stars' },
  { value: '3', label: '3 stars' },
  { value: '2', label: '2 stars' },
  { value: '1', label: '1 star' },
]

export const REPLIED_OPTIONS = [
  { value: 'all', label: 'All responses' },
  { value: 'true', label: 'Responded' },
  { value: 'false', label: 'Not responded' },
]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'highest', label: 'Highest rating' },
  { value: 'lowest', label: 'Lowest rating' },
]

function FilterSelect({ value, onChange, options, label }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="w-full sm:w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Controlled filter bar; wraps on tablet, stacks on mobile. */
export default function ReviewsToolbar({
  searchInput,
  onSearchChange,
  rating,
  onRatingChange,
  replied,
  onRepliedChange,
  sort,
  onSortChange,
  hasActiveFilters,
  onClear,
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:w-auto sm:min-w-[240px] sm:flex-1 sm:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search reviews..."
          aria-label="Search reviews"
          className="pl-8"
        />
      </div>
      <FilterSelect value={rating} onChange={onRatingChange} options={RATING_OPTIONS} label="Filter by rating" />
      <FilterSelect value={replied} onChange={onRepliedChange} options={REPLIED_OPTIONS} label="Filter by response status" />
      <FilterSelect value={sort} onChange={onSortChange} options={SORT_OPTIONS} label="Sort reviews" />
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="gap-1 self-start sm:self-auto">
          <X className="h-4 w-4" aria-hidden="true" />
          Clear
        </Button>
      )}
    </div>
  )
}
