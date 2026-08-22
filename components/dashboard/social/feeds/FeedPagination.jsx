"use client"

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { FEED_PAGE_SIZE_OPTIONS } from '@/lib/socialFeedsDummyData'

// Same truncation pattern as components/dashboard/leads/LeadsPagination.jsx
// (this codebase's existing precedent for "numbered pagination + rows-per-
// page selector") — kept local rather than imported since that component
// carries its own Leads-specific page-size options and this feature needs
// its own (FEED_PAGE_SIZE_OPTIONS), but the layout/behavior intentionally
// matches so pagination looks and works the same everywhere in the app.
function pageList(page, totalPages) {
  const pages = []
  for (let p = 1; p <= totalPages; p++) {
    if (totalPages > 7 && p !== 1 && p !== totalPages && Math.abs(p - page) > 1) {
      if (p === 2 || p === totalPages - 1) pages.push('…')
      continue
    }
    pages.push(p)
  }
  return pages
}

/**
 * Previous / numbered / Next pagination + "Showing X–Y of Z posts" +
 * Posts-per-page selector. `total`/`hasNextPage`/`hasPreviousPage` come
 * straight from the backend's real pagination metadata (socialFeedService.js)
 * — never recomputed from a client-side post count, since the page never
 * holds more than one page's worth of posts at a time.
 */
export default function FeedPagination({ page, totalPages, total, pageSize, hasNextPage, hasPreviousPage, onPageChange, onPageSizeChange }) {
  if (!total) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 px-1">
      <span className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}–{to}</span> of <span className="font-medium text-foreground">{total}</span> posts
      </span>

      <div className="flex items-center gap-4 flex-wrap">
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="gap-1" disabled={!hasPreviousPage} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {pageList(page, totalPages).map((p, i) => (
              p === '…'
                ? <span key={`gap-${i}`} className="text-muted-foreground px-1 text-xs">…</span>
                : (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'ghost'}
                    size="icon"
                    className="h-9 w-9 text-sm"
                    onClick={() => onPageChange(p)}
                  >
                    {p}
                  </Button>
                )
            ))}

            <Button variant="outline" size="sm" className="gap-1" disabled={!hasNextPage} onClick={() => onPageChange(page + 1)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Posts per page</span>
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger className="h-8 w-18 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FEED_PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
