"use client"

import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'
import { Table, TableHeader, TableBody, TableRow, TableHead } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import LeadRow from './LeadRow'
import LeadsEmptyState from './LeadsEmptyState'

const COLUMNS = [
  { key: 'name', label: 'Lead Name', sortable: true },
  { key: 'company', label: 'Company', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone', label: 'Phone' },
  { key: 'source', label: 'Source', sortable: true },
  { key: 'assignedTo', label: 'Assigned To', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'priority', label: 'Priority', sortable: true },
  { key: 'lastContact', label: 'Last Contact', sortable: true },
  { key: 'created', label: 'Created Date', sortable: true },
]

/**
 * Table shell: sortable header + selectable rows + empty state. Sorting/
 * selection/pagination state all live in the parent page - this component
 * only renders whatever `leads` (the already filtered+sorted+paginated
 * page slice) it's given.
 */
export default function LeadsTable({
  leads, allLeadsCount, selectedIds, sortKey, sortDir, onSort,
  onToggleSelect, onToggleSelectAll, onOpenDrawer, onEdit, onAssign, onAddNote,
  onScheduleFollowup, onMarkQualified, onDelete, onAddLead, onClearFilters,
}) {
  const pageIds = leads.map((l) => l.id)
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id)).length
  const allSelected = pageIds.length > 0 && selectedOnPage === pageIds.length
  const someSelected = selectedOnPage > 0 && selectedOnPage < pageIds.length

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
