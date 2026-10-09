"use client"

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, SlidersHorizontal } from 'lucide-react'

export default function PostsToolbar({
  search,
  onSearchChange,
  topicType,
  onTopicTypeChange,
  state,
  onStateChange,
  sort,
  onSortChange
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1">
      {/* Search box */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-8 h-9 text-sm"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter and Sort controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Topic filter */}
        <Select value={topicType} onValueChange={onTopicTypeChange}>
          <SelectTrigger className="h-9 w-[130px] text-xs">
            <SelectValue placeholder="Topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Topics</SelectItem>
            <SelectItem value="STANDARD">What's New</SelectItem>
            <SelectItem value="EVENT">Events</SelectItem>
            <SelectItem value="OFFER">Offers</SelectItem>
            <SelectItem value="ALERT">Alerts</SelectItem>
          </SelectContent>
        </Select>

        {/* State filter */}
        <Select value={state} onValueChange={onStateChange}>
          <SelectTrigger className="h-9 w-[120px] text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="LIVE">Live</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 w-[140px] text-xs">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="most_viewed">Most viewed</SelectItem>
            <SelectItem value="most_clicked">Most clicked</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
