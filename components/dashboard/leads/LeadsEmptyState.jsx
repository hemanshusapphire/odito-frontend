"use client"

import { Search, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Empty state: "no leads at all" vs. "no leads match the current filters". */
export default function LeadsEmptyState({ noLeadsAtAll, onAddLead, onClearFilters }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-20 h-20 rounded-2xl bg-muted/40 border flex items-center justify-center mb-5 text-muted-foreground">
        <Search className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold mb-1.5">{noLeadsAtAll ? 'No leads found.' : 'No leads match your filters.'}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">
        {noLeadsAtAll
          ? 'Get started by adding your first lead or importing a list to begin tracking your pipeline.'
          : 'Try adjusting or clearing your filters to see more results.'}
      </p>
      {noLeadsAtAll ? (
        <Button onClick={onAddLead} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Your First Lead
        </Button>
      ) : (
        <Button variant="outline" onClick={onClearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
