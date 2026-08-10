"use client"

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Previous / numbered / Next pagination - no rows-per-page control, per spec. */
export default function FeedPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-1">
      <Button variant="outline" size="sm" className="gap-1" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Button
          key={p}
          variant={p === page ? 'default' : 'ghost'}
          size="icon"
          className="h-9 w-9 text-sm"
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}

      <Button variant="outline" size="sm" className="gap-1" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
