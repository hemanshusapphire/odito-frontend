"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { useProject } from '@/contexts/ProjectContext'
import { useAuth } from '@/contexts/AuthContext'

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
import LeadsToaster from '@/components/dashboard/leads/LeadsToaster'

import { useLeadsToasts } from '@/hooks/useLeadsToasts'
import { useLeadRealtimeSync } from '@/hooks/useLeadRealtimeSync'
import { useLeads, useLeadStats, useCreateLead, useUpdateLead, useDeleteLead } from '@/hooks/useDashboardQueries'
import { normalizeLead, exportLeadsToCsv } from '@/lib/leadsConstants'

const DEFAULT_FILTERS = { status: '', priority: '' }

/**
 * Real Leads dashboard (Phase 3B) — replaces the previous frontend-only
 * mock (everything used to live in a single in-memory array; see git
 * history / the Phase 1 report for that version). Now backed entirely by
 * odito_backend/src/modules/lead/ via TanStack Query, project-scoped
 * through ProjectContext, with a live Socket.IO refresh when a WordPress
 * form submission creates a new lead (useLeadRealtimeSync).
 *
 * Some mock-only concepts had no real backend field and were intentionally
 * dropped rather than faked: tags, a multi-item follow-up task checklist,
 * and a synthetic activity-log feed. Multi-user named assignment was
 * simplified to "assign to me / unassign" — the actual multi-tenancy model
 * (see AuthUtil/SeoProject) has exactly one owning user per project, so a
 * team-member picker had nothing real to populate it with. See the Phase
 * 3B report for the full list.
 */
export default function LeadsPage() {
  const { activeProjectId } = useProject()
  const { user } = useAuth()
  useLeadRealtimeSync(activeProjectId)

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const [drawerLeadId, setDrawerLeadId] = useState(null)
  const [formDialog, setFormDialog] = useState({ open: false, lead: null })
  const [assignDialog, setAssignDialog] = useState({ open: false, mode: 'single', lead: null })
  const [noteDialog, setNoteDialog] = useState({ open: false, lead: null })
  const [followupDialog, setFollowupDialog] = useState({ open: false, lead: null })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, mode: 'single', lead: null })

  const { toasts, notify, dismiss } = useLeadsToasts()

  // Debounce free-text search so it doesn't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const listParams = useMemo(() => ({
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    search: debouncedSearch || undefined,
    page,
    limit: pageSize,
    sort: sortKey,
    sortOrder: sortDir,
  }), [filters, debouncedSearch, page, pageSize, sortKey, sortDir])

  const { data: listResponse, isLoading, isError, error } = useLeads(activeProjectId, listParams)
  const { data: statsResponse } = useLeadStats(activeProjectId)

  const leads = useMemo(() => (listResponse?.data || []).map(normalizeLead), [listResponse])
  const pagination = listResponse?.pagination || { page: 1, limit: pageSize, total: 0, totalPages: 1 }
  const stats = statsResponse?.data || null

  const createMutation = useCreateLead(activeProjectId)
  const updateMutation = useUpdateLead(activeProjectId)
  const deleteMutation = useDeleteLead(activeProjectId)

  function handleFilterChange(key, value) {
    if (key === 'search') { setSearchInput(value); return }
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }
  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS)
    setSearchInput('')
    setDebouncedSearch('')
    setPage(1)
  }

  function handleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
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

  async function submitLeadForm(form) {
    try {
      if (formDialog.lead) {
        await updateMutation.mutateAsync({ leadId: formDialog.lead.id, updates: form })
        notify(`${form.name || 'Lead'} updated`, 'success')
      } else {
        await createMutation.mutateAsync(form)
        notify(`${form.name || 'Lead'} added to pipeline`, 'success')
      }
      setFormDialog({ open: false, lead: null })
    } catch (err) {
      notify(err.message || 'Failed to save lead', 'danger')
    }
  }

  async function submitAssign(assignToSelf) {
    const assignedTo = assignToSelf ? (user?._id || user?.id || null) : null
    try {
      if (assignDialog.mode === 'bulk') {
        const ids = [...selectedIds]
        await Promise.all(ids.map((id) => updateMutation.mutateAsync({ leadId: id, updates: { assignedTo } })))
        notify(`${ids.length} lead${ids.length === 1 ? '' : 's'} ${assignToSelf ? 'assigned' : 'unassigned'}`, 'success')
        setSelectedIds(new Set())
      } else if (assignDialog.lead) {
        await updateMutation.mutateAsync({ leadId: assignDialog.lead.id, updates: { assignedTo } })
        notify(`${assignDialog.lead.name || 'Lead'} ${assignToSelf ? 'assigned to you' : 'unassigned'}`, 'success')
      }
    } catch (err) {
      notify(err.message || 'Failed to assign', 'danger')
    }
    setAssignDialog({ open: false, mode: 'single', lead: null })
  }

  async function submitNote(text) {
    const lead = noteDialog.lead
    if (!lead) return
    try {
      await updateMutation.mutateAsync({ leadId: lead.id, updates: { note: text } })
      notify('Note added', 'success')
    } catch (err) {
      notify(err.message || 'Failed to add note', 'danger')
    }
    setNoteDialog({ open: false, lead: null })
  }

  async function submitFollowup({ due }) {
    const lead = followupDialog.lead
    if (!lead) return
    try {
      await updateMutation.mutateAsync({
        leadId: lead.id,
        updates: { nextFollowUpAt: due ? new Date(due).toISOString() : null },
      })
      notify('Follow-up scheduled', 'success')
    } catch (err) {
      notify(err.message || 'Failed to schedule follow-up', 'danger')
    }
    setFollowupDialog({ open: false, lead: null })
  }

  async function markQualified(lead) {
    try {
      await updateMutation.mutateAsync({ leadId: lead.id, updates: { status: 'qualified' } })
      notify(`${lead.name || 'Lead'} marked as Qualified`, 'success')
    } catch (err) {
      notify(err.message || 'Failed to update status', 'danger')
    }
  }

  async function confirmDelete() {
    try {
      if (deleteDialog.mode === 'bulk') {
        const ids = [...selectedIds]
        await Promise.all(ids.map((id) => deleteMutation.mutateAsync(id)))
        notify(`${ids.length} lead${ids.length === 1 ? '' : 's'} deleted`, 'danger')
        setSelectedIds(new Set())
      } else if (deleteDialog.lead) {
        await deleteMutation.mutateAsync(deleteDialog.lead.id)
        notify(`${deleteDialog.lead.name || 'Lead'} deleted`, 'danger')
        if (drawerLeadId === deleteDialog.lead.id) setDrawerLeadId(null)
      }
    } catch (err) {
      notify(err.message || 'Failed to delete', 'danger')
    }
    setDeleteDialog({ open: false, mode: 'single', lead: null })
  }

  // Real CSV export from whatever's currently loaded — bulk import was not
  // implemented (would need a new bulk-create backend endpoint, out of
  // this phase's scope; see the Phase 3B report).
  function handleExportAll() {
    exportLeadsToCsv(leads, `leads-page-${pagination.page}.csv`)
    notify(`Exported ${leads.length} lead${leads.length === 1 ? '' : 's'} from this page`, 'success')
  }
  function handleExportSelected() {
    const selected = leads.filter((l) => selectedIds.has(l.id))
    exportLeadsToCsv(selected, 'selected-leads.csv')
    notify(`Exported ${selected.length} lead${selected.length === 1 ? '' : 's'}`, 'success')
  }
  function handleComingSoon(feature) {
    notify(`${feature} coming soon`)
  }

  const drawerLead = drawerLeadId ? leads.find((l) => l.id === drawerLeadId) || null : null

  if (!activeProjectId) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 text-sm text-muted-foreground">
        Select or create a project to view its leads.
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 pb-10">
      <LeadsHeader
        onImport={() => handleComingSoon('Bulk import')}
        onExport={handleExportAll}
        onAddLead={() => setFormDialog({ open: true, lead: null })}
        onComingSoon={handleComingSoon}
      />

      <LeadsStatsGrid stats={stats} />

      <LeadsFilterBar
        filters={{ ...filters, search: searchInput }}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearFilters}
      />

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
            <span className="text-xs font-mono text-muted-foreground bg-muted rounded-full px-2 py-0.5">{pagination.total}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Sorted by</span>
            <span className="text-foreground font-medium font-mono">
              {sortKey} {sortDir === 'asc' ? '↑' : '↓'}
            </span>
          </div>
        </div>

        {isError ? (
          <div className="p-8 text-center text-sm text-destructive" role="alert">
            {error?.message || 'Failed to load leads.'}
          </div>
        ) : (
          <LeadsTable
            leads={leads}
            isLoading={isLoading}
            allLeadsCount={pagination.total}
            selectedIds={selectedIds}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onOpenDrawer={(lead) => setDrawerLeadId(lead.id)}
            onEdit={(lead) => setFormDialog({ open: true, lead })}
            onAssign={(lead) => setAssignDialog({ open: true, mode: 'single', lead })}
            onAddNote={(lead) => setNoteDialog({ open: true, lead })}
            onScheduleFollowup={(lead) => setFollowupDialog({ open: true, lead })}
            onMarkQualified={markQualified}
            onDelete={(lead) => setDeleteDialog({ open: true, mode: 'single', lead })}
            onAddLead={() => setFormDialog({ open: true, lead: null })}
            onClearFilters={handleClearFilters}
          />
        )}

        <div className="border-t px-1">
          <LeadsPagination
            page={pagination.page}
            pageSize={pagination.limit}
            total={pagination.total}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          />
        </div>
      </Card>

      <LeadDetailDrawer
        lead={drawerLead}
        open={!!drawerLead}
        onOpenChange={(open) => !open && setDrawerLeadId(null)}
        onEdit={(lead) => setFormDialog({ open: true, lead })}
        onAssign={(lead) => setAssignDialog({ open: true, mode: 'single', lead })}
        onAddNote={(lead) => setNoteDialog({ open: true, lead })}
        onScheduleFollowup={(lead) => setFollowupDialog({ open: true, lead })}
      />

      <LeadFormDialog
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog((prev) => ({ ...prev, open }))}
        lead={formDialog.lead}
        onSubmit={submitLeadForm}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <AssignLeadDialog
        open={assignDialog.open}
        onOpenChange={(open) => setAssignDialog((prev) => ({ ...prev, open }))}
        count={assignDialog.mode === 'bulk' ? selectedIds.size : 1}
        currentUserName={[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'yourself'}
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

      <LeadsToaster toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
