"use client"

import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'
import { Table, TableHeader, TableBody, TableRow, TableHead } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import LeadRow from './LeadRow'
import LeadsEmptyState from './LeadsEmptyState'

// `sortable` only set on columns the backend actually supports sorting by
// (leadService.js SORTABLE_FIELDS) — company/email/source/assignedTo have
// no server-side sort implementation, so marking them sortable would
// silently no-op (the backend falls back to createdAt for an unknown sort
// key) rather than doing what the header implies.
const COLUMNS = [
  { key: 'name', label: 'Lead Name', sortable: true },
  { key: 'company', label: 'Company' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'source', label: 'Source' },
  { key: 'assignedTo', label: 'Assigned To' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'priority', label: 'Priority', sortable: true },
  { key: 'lastContactAt', label: 'Last Contact', sortable: true },
  { key: 'createdAt', label: 'Created Date', sortable: true },
]

/**
 * Table shell: sortable header + selectable rows + empty/loading state.
 * Sorting/selection/pagination/filtering state all live in the parent
 * page and drive a real server-side query — this component only renders
 * whichever page of results it's given (`leads` is already the current
 * page from the API, not a client-side slice of a larger in-memory array).
 */
export default function LeadsTable({
  leads, isLoading, allLeadsCount, selectedIds, sortKey, sortDir, onSort,
  onToggleSelect, onToggleSelectAll, onOpenDrawer, onEdit, onAssign, onAddNote,
  onScheduleFollowup, onMarkQualified, onDelete, onAddLead, onClearFilters,
}) {
  const pageIds = leads.map((l) => l.id)
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id)).length
  const allSelected = pageIds.length > 0 && selectedOnPage === pageIds.length
  const someSelected = selectedOnPage > 0 && selectedOnPage < pageIds.length

  if (isLoading) {
    return (
      <div className="p-6 space-y-3" aria-busy="true" aria-label="Loading leads">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-full rounded-md bg-muted/60 animate-pulse" />
        ))}
      </div>
    )
  }

  if (leads.length === 0) {
    return <LeadsEmptyState noLeadsAtAll={allLeadsCount === 0} onAddLead={onAddLead} onClearFilters={onClearFilters} />
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={someSelected ? 'indeterminate' : allSelected}
                onCheckedChange={(v) => onToggleSelectAll(v === true, pageIds)}
              />
            </TableHead>
            {COLUMNS.map((col) => (
              <TableHead
                key={col.key}
                className={col.sortable ? 'cursor-pointer select-none whitespace-nowrap' : 'whitespace-nowrap'}
                onClick={col.sortable ? () => onSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    sortKey === col.key
                      ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)
                      : <ChevronsUpDown className="h-3 w-3 opacity-40" />
                  )}
                </span>
              </TableHead>
            ))}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              selected={selectedIds.has(lead.id)}
              onToggleSelect={onToggleSelect}
              onOpenDrawer={onOpenDrawer}
              onEdit={onEdit}
              onAssign={onAssign}
              onAddNote={onAddNote}
              onScheduleFollowup={onScheduleFollowup}
              onMarkQualified={onMarkQualified}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
