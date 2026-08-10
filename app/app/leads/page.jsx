"use client"

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'

import LeadsHeader from '@/components/dashboard/leads/LeadsHeader'
import LeadsStatsGrid from '@/components/dashboard/leads/LeadsStatsGrid'
import LeadsFilterBar from '@/components/dashboard/leads/LeadsFilterBar'
import LeadsBulkActionBar from '@/components/dashboard/leads/LeadsBulkActionBar'
import LeadsTable from '@/components/dashboard/leads/LeadsTable'
import LeadsPagination from '@/components/dashboard/leads/LeadsPagination'
import LeadDetailDrawer from '@/components/dashboard/leads/LeadDetailDrawer'
import LeadFormDialog from '@/components/dashboard/leads/LeadFormDialog'
import AssignLeadDialog from '@/components/dashboard/leads/AssignLeadDialog'
import AddNoteDialog from '@/components/dashboard/leads/AddNoteDialog'
import ScheduleFollowupDialog from '@/components/dashboard/leads/ScheduleFollowupDialog'
import DeleteConfirmDialog from '@/components/dashboard/leads/DeleteConfirmDialog'
import ImportLeadsDialog from '@/components/dashboard/leads/ImportLeadsDialog'
import LeadsToaster from '@/components/dashboard/leads/LeadsToaster'

import { useLeadsToasts } from '@/hooks/useLeadsToasts'
import { buildInitialLeads, TODAY_ISO } from '@/lib/leadsDummyData'

const DEFAULT_FILTERS = { search: '', status: '', source: '', assignedTo: '', priority: '', tag: '', dateFrom: '', dateTo: '' }

let nextLeadSeq = 1066

/**
 * Lead Management - frontend-only CRM-style page. Everything (add/edit/
 * delete/assign/notes/follow-ups) mutates a single in-memory `leads` array
 * held in this component's state, exactly like the source mockup's own
 * client-side script did - nothing is sent to a server, nothing survives a
 * page refresh. No React Query, no API calls, no persistence, per the
 * frontend-only scope agreed for this module.
 */
export default function LeadsPage() {
  const [leads, setLeads] = useState(buildInitialLeads)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sortKey, setSortKey] = useState('created')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const [drawerLead, setDrawerLead] = useState(null)
  const [formDialog, setFormDialog] = useState({ open: false, lead: null })
  const [assignDialog, setAssignDialog] = useState({ open: false, mode: 'single', lead: null })
  const [noteDialog, setNoteDialog] = useState({ open: false, lead: null })
  const [followupDialog, setFollowupDialog] = useState({ open: false, lead: null })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, mode: 'single', lead: null })
  const [importOpen, setImportOpen] = useState(false)

  const { toasts, notify, dismiss } = useLeadsToasts()

  function updateLead(id, updater) {
    setLeads((prev) => prev.map((l) => (l.id === id ? updater(l) : l)))
  }

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  const filteredSorted = useMemo(() => {
    let out = leads.filter((l) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!(l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q))) return false
      }
      if (filters.status && l.status !== filters.status) return false
      if (filters.source && l.source !== filters.source) return false
      if (filters.assignedTo && l.assignedTo !== filters.assignedTo) return false
      if (filters.priority && l.priority !== filters.priority) return false
      if (filters.tag && !l.tags.includes(filters.tag)) return false
      if (filters.dateFrom && l.created < filters.dateFrom) return false
      if (filters.dateTo && l.created > filters.dateTo) return false
      return true
    })
    out = [...out].sort((a, b) => {
      let av = a[sortKey]
      let bv = b[sortKey]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return out
  }, [leads, filters, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filteredSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function handleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  function handleToggleSelect(id, checked) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function handleToggleSelectAll(checked, pageIds) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      pageIds.forEach((id) => (checked ? next.add(id) : next.delete(id)))
      return next
    })
  }

  // ── Add / Edit ──────────────────────────────────────────────────────
  function submitLeadForm(form) {
    if (formDialog.lead) {
      updateLead(formDialog.lead.id, (l) => ({ ...l, ...form }))
      notify(`${form.name} updated`, 'success')
    } else {
      const newLead = {
        id: 'LD-' + String(nextLeadSeq++),
        ...form,
        lastContact: TODAY_ISO,
        created: TODAY_ISO,
        notes: [],
        activities: [{ type: 'created', text: 'Lead created and added to pipeline', date: TODAY_ISO }],
        tasks: [],
      }
      setLeads((prev) => [newLead, ...prev])
      notify(`${form.name} added to pipeline`, 'success')
    }
    setFormDialog({ open: false, lead: null })
  }

  // ── Assign ──────────────────────────────────────────────────────────
  function submitAssign(assignee) {
    if (assignDialog.mode === 'bulk') {
      setLeads((prev) => prev.map((l) => (selectedIds.has(l.id) ? { ...l, assignedTo: assignee } : l)))
      notify(`${selectedIds.size} lead${selectedIds.size === 1 ? '' : 's'} assigned to ${assignee}`, 'success')
      setSelectedIds(new Set())
    } else if (assignDialog.lead) {
      updateLead(assignDialog.lead.id, (l) => ({ ...l, assignedTo: assignee }))
      notify(`${assignDialog.lead.name} assigned to ${assignee}`, 'success')
    }
    setAssignDialog({ open: false, mode: 'single', lead: null })
  }

  // ── Notes ───────────────────────────────────────────────────────────
  function submitNote(text) {
    const lead = noteDialog.lead
    if (!lead) return
    updateLead(lead.id, (l) => ({
      ...l,
      notes: [{ text, date: TODAY_ISO }, ...l.notes],
      activities: [{ type: 'note', text: 'Note added', date: TODAY_ISO }, ...l.activities],
    }))
    notify('Note added', 'success')
    setNoteDialog({ open: false, lead: null })
  }

  // ── Follow-up ───────────────────────────────────────────────────────
  function submitFollowup({ text, due }) {
    const lead = followupDialog.lead
    if (!lead) return
    updateLead(lead.id, (l) => ({ ...l, tasks: [...l.tasks, { id: `t-${Date.now()}`, text, due, done: false }] }))
    notify('Follow-up scheduled', 'success')
    setFollowupDialog({ open: false, lead: null })
  }

  function toggleTask(lead, taskId) {
    updateLead(lead.id, (l) => ({
      ...l,
      tasks: l.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
    }))
  }

  function deleteTag(lead, tag) {
    updateLead(lead.id, (l) => ({ ...l, tags: l.tags.filter((t) => t !== tag) }))
  }

  // ── Mark Qualified ──────────────────────────────────────────────────
  function markQualified(lead) {
    updateLead(lead.id, (l) => ({
      ...l,
      status: 'Qualified',
      activities: [{ type: 'status', text: 'Marked as Qualified', date: TODAY_ISO }, ...l.activities],
    }))
    notify(`${lead.name} marked as Qualified`, 'success')
  }

  // ── Delete ──────────────────────────────────────────────────────────
  function confirmDelete() {
    if (deleteDialog.mode === 'bulk') {
      setLeads((prev) => prev.filter((l) => !selectedIds.has(l.id)))
      notify(`${selectedIds.size} lead${selectedIds.size === 1 ? '' : 's'} deleted`, 'danger')
      setSelectedIds(new Set())
    } else if (deleteDialog.lead) {
      setLeads((prev) => prev.filter((l) => l.id !== deleteDialog.lead.id))
      notify(`${deleteDialog.lead.name} deleted`, 'danger')
      if (drawerLead?.id === deleteDialog.lead.id) setDrawerLead(null)
    }
    setDeleteDialog({ open: false, mode: 'single', lead: null })
  }

  // ── Import / Export (dummy - no file parsing, no download generation) ─
  function handleImport(fileName) {
    notify(fileName ? `Imported leads from ${fileName}` : 'Import complete', 'success')
    setImportOpen(false)
  }
  function handleExportAll() {
    notify(`Exporting all ${filteredSorted.length} leads…`, 'success')
  }
  function handleExportSelected() {
    notify(`Exporting ${selectedIds.size} lead${selectedIds.size === 1 ? '' : 's'}…`, 'success')
  }
  function handleComingSoon(feature) {
    notify(`${feature} coming soon`)
  }

  // Keep the drawer's lead reference fresh after in-place mutations.
  const drawerLeadLive = drawerLead ? leads.find((l) => l.id === drawerLead.id) || null : null

  return (
    <div className="flex-1 space-y-6 pb-10">
      <LeadsHeader
        onImport={() => setImportOpen(true)}
        onExport={handleExportAll}
        onAddLead={() => setFormDialog({ open: true, lead: null })}
        onComingSoon={handleComingSoon}
      />

      <LeadsStatsGrid leads={leads} />

      <LeadsFilterBar filters={filters} onFilterChange={handleFilterChange} onClearAll={handleClearFilters} />

      <LeadsBulkActionBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onBulkAssign={() => setAssignDialog({ open: true, mode: 'bulk', lead: null })}
        onExportSelected={handleExportSelected}
        onBulkDelete={() => setDeleteDialog({ open: true, mode: 'bulk', lead: null })}
      />

      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">All Leads</h2>
            <span className="text-xs font-mono text-muted-foreground bg-muted rounded-full px-2 py-0.5">{filteredSorted.length}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Sorted by</span>
            <span className="text-foreground font-medium font-mono">
              {sortKey} {sortDir === 'asc' ? '↑' : '↓'}
            </span>
          </div>
        </div>

        <LeadsTable
          leads={pageItems}
          allLeadsCount={leads.length}
          selectedIds={selectedIds}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onOpenDrawer={setDrawerLead}
          onEdit={(lead) => setFormDialog({ open: true, lead })}
          onAssign={(lead) => setAssignDialog({ open: true, mode: 'single', lead })}
          onAddNote={(lead) => setNoteDialog({ open: true, lead })}
          onScheduleFollowup={(lead) => setFollowupDialog({ open: true, lead })}
          onMarkQualified={markQualified}
          onDelete={(lead) => setDeleteDialog({ open: true, mode: 'single', lead })}
          onAddLead={() => setFormDialog({ open: true, lead: null })}
          onClearFilters={handleClearFilters}
        />

        <div className="border-t px-1">
          <LeadsPagination
            page={currentPage}
            pageSize={pageSize}
            total={filteredSorted.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          />
        </div>
      </Card>

      <LeadDetailDrawer
        lead={drawerLeadLive}
        open={!!drawerLeadLive}
        onOpenChange={(open) => !open && setDrawerLead(null)}
        onEdit={(lead) => setFormDialog({ open: true, lead })}
        onAssign={(lead) => setAssignDialog({ open: true, mode: 'single', lead })}
        onAddNote={(lead) => setNoteDialog({ open: true, lead })}
        onScheduleFollowup={(lead) => setFollowupDialog({ open: true, lead })}
        onToggleTask={toggleTask}
        onDeleteTag={deleteTag}
      />

      <LeadFormDialog
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog((prev) => ({ ...prev, open }))}
        lead={formDialog.lead}
        onSubmit={submitLeadForm}
      />

      <AssignLeadDialog
        open={assignDialog.open}
        onOpenChange={(open) => setAssignDialog((prev) => ({ ...prev, open }))}
        count={assignDialog.mode === 'bulk' ? selectedIds.size : 1}
        onAssign={submitAssign}
      />

      <AddNoteDialog
        open={noteDialog.open}
        onOpenChange={(open) => setNoteDialog((prev) => ({ ...prev, open }))}
        leadName={noteDialog.lead?.name}
        onSubmit={submitNote}
      />

      <ScheduleFollowupDialog
        open={followupDialog.open}
        onOpenChange={(open) => setFollowupDialog((prev) => ({ ...prev, open }))}
        leadName={followupDialog.lead?.name}
        onSubmit={submitFollowup}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        count={deleteDialog.mode === 'bulk' ? selectedIds.size : 1}
        leadName={deleteDialog.lead?.name}
        onConfirm={confirmDelete}
      />

      <ImportLeadsDialog open={importOpen} onOpenChange={setImportOpen} onImport={handleImport} />

      <LeadsToaster toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
