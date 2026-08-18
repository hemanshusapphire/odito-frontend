"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useProject } from '@/contexts/ProjectContext'
import { useTasks, useTaskSummary, useDeleteTask } from '@/hooks/useDashboardQueries'
import apiService from '@/lib/apiService'
import { useBulkVerificationController } from '@/hooks/useBulkVerificationController'
import { BatchState } from '@/lib/verification/bulkBatchState'
import VerifyUrlModal from '@/app/onpage/components/VerifyUrlModal'
import { CheckSquare, Search, ChevronLeft, ChevronRight, Trash2, AlertTriangle } from 'lucide-react'
import BulkVerifyConfirmDialog from './components/BulkVerifyConfirmDialog'
import { buildBulkModalProps } from './bulkModalProps'
import { getCheckDIYRoute, isOnPageCategory } from './taskRouting'
import { TaskStatusBadge, SourceBadge } from './statusMeta'
import OptimizationDetailsModal from './components/OptimizationDetailsModal'

// A row is selectable for Bulk URL Verification only when it's a Content/
// on-page issue (Phase 1 scope — see the architectural inspection) AND has
// already been implemented at least once (implemented/reopened) — there is
// nothing to verify for a task that was never implemented (task_created),
// and verified_fixed is terminal. Never selectable while its own batch is
// still verifying (see isTaskVerifying) — re-selecting a row mid-run would
// have no meaning until the current run resolves.
function isRowSelectable(task) {
  return isOnPageCategory(task) && (task.status === 'implemented' || task.status === 'reopened')
}

// A task's URL is "Verifying" for the whole lifetime of the batch it's part
// of (from STARTING through COMPLETING) — not just while its own per-url
// status is queued/running — so every row in a batch flips back to its
// fresh, correct status together, at exactly the moment useBulkVerification
// Controller's single terminal-state invalidation refetches the table.
// Ending it earlier (per-url) would show a stale pre-batch status/action for
// rows whose own url finished before slower siblings in the same batch.
function isTaskVerifying(task, progress) {
  if (!progress) return false
  if (progress.state === BatchState.COMPLETED || progress.state === BatchState.FAILED) return false
  return progress.urls.has(task.pageUrl)
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 3500)
    return () => clearTimeout(id)
  }, [onClose])

  const bg     = type === 'success' ? 'rgba(0,245,160,0.12)' : 'rgba(255,56,96,0.12)'
  const border = type === 'success' ? 'rgba(0,245,160,0.25)' : 'rgba(255,56,96,0.25)'
  const color  = type === 'success' ? '#00f5a0' : '#ff6080'
  const icon   = type === 'success' ? '✓' : '✕'

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 18px', borderRadius: 12,
      background: 'var(--s)', border: `1px solid ${border}`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      color: 'var(--t)', fontSize: 13, fontWeight: 500,
      animation: 'slideUp 0.2s ease',
    }}>
      <span style={{ color, fontWeight: 700, fontSize: 15 }}>{icon}</span>
      {message}
    </div>
  )
}

// ── Delete Confirmation Dialog ─────────────────────────────────────────────────

function DeleteTaskDialog({ task, isDeleting, onConfirm, onCancel }) {
  if (!task) return null

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 8000,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div style={{
        background: 'var(--s)', border: '1px solid rgba(255,56,96,0.2)',
        borderRadius: 18, padding: '28px 32px', maxWidth: 440, width: '100%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.18s ease',
      }}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(255,56,96,0.1)', border: '1px solid rgba(255,56,96,0.2)',
          display: 'grid', placeItems: 'center', marginBottom: 18,
        }}>
          <AlertTriangle size={22} style={{ color: '#ff6080' }} />
        </div>

        {/* Title */}
        <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--t)', marginBottom: 8, lineHeight: 1.2 }}>
          Delete Optimization Task?
        </h2>

        {/* Description */}
        <p style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 8 }}>
          This action cannot be undone.
        </p>
        <p style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 24 }}>
          The task, verification history, and associated optimization tracking data will be permanently removed.
        </p>

        {/* Task preview */}
        <div style={{
          background: 'var(--s2)', border: '1px solid var(--b)', borderRadius: 10,
          padding: '10px 14px', marginBottom: 24,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.issueName || task.issueKey}
          </div>
          <div style={{ fontSize: 11, color: 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.pageUrl}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            style={{
              padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600,
              background: 'var(--s2)', border: '1px solid var(--b)', color: 'var(--t2)',
              cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700,
              background: isDeleting ? 'rgba(255,56,96,0.25)' : 'rgba(255,56,96,0.15)',
              border: '1px solid rgba(255,56,96,0.4)', color: '#ff6080',
              cursor: isDeleting ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!isDeleting) e.currentTarget.style.background = 'rgba(255,56,96,0.25)' }}
            onMouseLeave={e => { if (!isDeleting) e.currentTarget.style.background = 'rgba(255,56,96,0.15)' }}
          >
            {isDeleting ? (
              <>
                <div style={{ width: 12, height: 12, border: '2px solid #ff6080', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Delete Task
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Delete Button ─────────────────────────────────────────────────────────────

function DeleteButton({ task, onDelete }) {
  const isVerified = task.status === 'verified_fixed'
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={() => !isVerified && onDelete(task)}
        disabled={isVerified}
        title={isVerified ? 'Verified tasks cannot be deleted' : 'Delete Task'}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: 7,
          background: hovered ? 'rgba(255,56,96,0.18)' : 'rgba(255,56,96,0.08)',
          border: 'none',
          color: '#ff6080',
          cursor: isVerified ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s', opacity: isVerified ? 0.35 : 1,
          flexShrink: 0,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function TruncatedUrl({ url }) {
  const [expanded, setExpanded] = useState(false)
  const short = url.length > 55 ? url.slice(0, 55) + '…' : url
  return (
    <span
      title={url}
      style={{ cursor: url.length > 55 ? 'pointer' : 'default', color: 'var(--cy)', fontSize: 12, wordBreak: 'break-all' }}
      onClick={() => setExpanded(e => !e)}
    >
      {expanded ? url : short}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OptimizationCenterPage() {
  const { activeProject } = useProject()
  const router = useRouter()

  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterStatus, setFilterStatus]       = useState('')
  const [confirmTask, setConfirmTask]         = useState(null)   // task object awaiting deletion
  const [toast, setToast]                     = useState(null)   // { message, type }
  const [detailsTaskId, setDetailsTaskId]     = useState(null)   // taskId shown in the View Details modal

  // Bulk URL Verification selection — belongs only to this table (no
  // Redux/global store). Keyed by task._id (not pageUrl) so two different
  // issues on the same URL are still tracked as distinct selections;
  // Map<id, {_id, pageUrl}> (not just a Set of ids) so a task's URL is
  // still available even after paging away from the row that showed it.
  const [selectedTasks, setSelectedTasks] = useState(() => new Map())
  const [resultCounts, setResultCounts] = useState(null)
  const computedBatchIdRef = useRef(null)

  const projectId = activeProject?._id
  const controller = useBulkVerificationController({ projectId })
  const progress = controller.progress

  useEffect(() => { document.title = "Optimization Center | Odito" }, [])

  useEffect(() => {
    const id = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 350)
    return () => clearTimeout(id)
  }, [search])

  // A fresh project means a fresh task list — any selection referencing the
  // previous project's task ids would be meaningless (and potentially
  // dangerous to submit for verification against the wrong project).
  useEffect(() => {
    setSelectedTasks(new Map())
    setResultCounts(null)
    computedBatchIdRef.current = null
    controller.reset()
    if (projectId) controller.prepare()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const queryParams = {
    projectId,
    page,
    limit: 20,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(filterStatus    && { status: filterStatus }),
  }

  const { data: tasksResponse, isLoading, error } = useTasks(queryParams)
  const { data: summaryResponse }                  = useTaskSummary(projectId)
  const deleteTask                                  = useDeleteTask(projectId)

  const tasks      = tasksResponse?.data?.tasks      || []
  const pagination = tasksResponse?.data?.pagination || {}
  const summary    = summaryResponse?.data           || { task_created: 0, implemented: 0, verified_fixed: 0, reopened: 0, total: 0 }

  const selectableTasks = useMemo(
    () => tasks.filter((t) => isRowSelectable(t) && !isTaskVerifying(t, progress)),
    [tasks, progress]
  )
  const allSelected = selectableTasks.length > 0 && selectableTasks.every((t) => selectedTasks.has(t._id))
  const someSelected = selectableTasks.some((t) => selectedTasks.has(t._id)) && !allSelected
  const selectAllRef = useRef(null)

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected
  }, [someSelected])

  const toggleRow = useCallback((task) => {
    setSelectedTasks((prev) => {
      const next = new Map(prev)
      if (next.has(task._id)) next.delete(task._id)
      else next.set(task._id, { _id: task._id, pageUrl: task.pageUrl })
      return next
    })
  }, [])

  // Select All operates on the currently visible/loaded page's selectable
  // rows only (matching GitHub/Linear's own per-view "select all" — not a
  // silent cross-page selection). Rows already selected from another page
  // (search/filter/page changes don't clear selection) are left untouched.
  const toggleAllVisible = useCallback((checked) => {
    setSelectedTasks((prev) => {
      const next = new Map(prev)
      if (checked) {
        selectableTasks.forEach((t) => next.set(t._id, { _id: t._id, pageUrl: t.pageUrl }))
      } else {
        selectableTasks.forEach((t) => next.delete(t._id))
      }
      return next
    })
  }, [selectableTasks])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  const handleDeleteConfirm = async () => {
    if (!confirmTask) return
    try {
      await deleteTask.mutateAsync(confirmTask._id)
      setConfirmTask(null)
      showToast('Task deleted successfully')
    } catch {
      setConfirmTask(null)
      showToast('Unable to delete task. Please try again.', 'error')
    }
  }

  const handleConfirmStart = useCallback(() => {
    const uniqueUrls = [...new Set(Array.from(selectedTasks.values()).map((t) => t.pageUrl))]
    controller.start(uniqueUrls)
  }, [controller, selectedTasks])

  const handleConfirmDialogOpenChange = useCallback((nextOpen) => {
    if (!nextOpen) controller.cancelConfirm()
  }, [controller])

  // Once the batch reaches a terminal state, look up each verified URL's
  // task(s) by exact _id (apiService.getTaskById — already exists, no new
  // endpoint) rather than re-reading the current filtered/paginated `tasks`
  // page: the task list here is often filtered/paginated, so a fixed task
  // that no longer matches the active filter would be invisible to a
  // simple re-read, silently miscounting it. A URL counts as "fixed" only
  // once every task selected for it has left task_created/reopened;
  // otherwise it's "still failing". useBulkVerificationController's own
  // invalidation already refreshes the visible table separately.
  useEffect(() => {
    const progress = controller.progress
    const isTerminal = progress?.state === BatchState.COMPLETED || progress?.state === BatchState.FAILED
    if (!isTerminal || computedBatchIdRef.current === progress.batchId) return
    computedBatchIdRef.current = progress.batchId

    const selectedEntries = Array.from(selectedTasks.values())

    // Selection clears once a batch completes successfully — not on a fully
    // failed batch, so the user can retry the same selection immediately.
    if (progress.state === BatchState.COMPLETED) {
      setSelectedTasks(new Map())
    }

    const taskIdsByUrl = new Map()
    for (const entry of selectedEntries) {
      if (!taskIdsByUrl.has(entry.pageUrl)) taskIdsByUrl.set(entry.pageUrl, [])
      taskIdsByUrl.get(entry.pageUrl).push(entry._id)
    }

    let cancelled = false
    ;(async () => {
      let fixedCount = 0
      let stillFailingCount = 0

      for (const [url, urlState] of progress.urls) {
        if (urlState.status !== 'completed') continue
        const taskIds = taskIdsByUrl.get(url) || []
        if (taskIds.length === 0) continue

        const results = await Promise.all(
          taskIds.map((id) => apiService.getTaskById(id).catch(() => null))
        )
        const stillOpen = results.some((r) => {
          const status = r?.data?.status
          return status === 'task_created' || status === 'reopened'
        })
        if (stillOpen) stillFailingCount++
        else fixedCount++
      }

      if (!cancelled) setResultCounts({ fixedCount, stillFailingCount })
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller.progress])

  const handleViewDetails = useCallback(() => {
    controller.reset()
    if (projectId) controller.prepare()
  }, [controller, projectId])

  const bulkModalProps = buildBulkModalProps(controller.progress, resultCounts, handleViewDetails, handleViewDetails)
  const isBatchActive = Boolean(bulkModalProps)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 8px' }}>

      <style>{`
        @keyframes fadeIn  { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin    { to { transform: rotate(360deg) } }
      `}</style>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(119,48,237,0.15), rgba(0,223,255,0.15))',
          border: '1px solid var(--color-brand-violet-border)',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <CheckSquare size={20} style={{ color: 'var(--vi)' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-metric)', fontSize: 24, fontWeight: 800, color: 'var(--t)', lineHeight: 1.1 }}>
            Optimization Center
          </h1>
          <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>
            Manage issue remediation, track implementation progress, and monitor automatic fix verification.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        {[
          { label: 'Active Tasks',         count: summary.task_created,   color: '#00dfff', bg: 'rgba(0,223,255,0.06)',   border: 'rgba(0,223,255,0.12)' },
          { label: 'Pending Verification', count: summary.implemented,    color: '#b580ff', bg: 'rgba(157,78,221,0.06)',  border: 'rgba(157,78,221,0.12)' },
          { label: 'Verified Fixed',       count: summary.verified_fixed, color: '#00f5a0', bg: 'rgba(0,245,160,0.06)',   border: 'rgba(0,245,160,0.12)' },
          { label: 'Reopened Issues',      count: summary.reopened,       color: '#ff6080', bg: 'rgba(255,56,96,0.06)',   border: 'rgba(255,56,96,0.12)' },
        ].map((card, idx) => (
          <div key={idx} style={{
            background: 'var(--s)',
            border: `1px solid ${card.border}`,
            borderRadius: 14,
            padding: '16px 20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: card.color }} />
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--t)' }}>
              {card.count}
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search tasks by URL or issue…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: 30, paddingRight: 10, paddingTop: 7, paddingBottom: 7,
              background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 8,
              color: 'var(--t)', fontSize: 12, outline: 'none',
            }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          style={{
            padding: '7px 10px', background: 'var(--s)', border: '1px solid var(--b)',
            borderRadius: 8, color: filterStatus ? 'var(--t)' : 'var(--t3)', fontSize: 12, outline: 'none',
            minWidth: 160,
          }}
        >
          <option value="">All Statuses</option>
          <option value="task_created">Task Created</option>
          <option value="implemented">Implemented</option>
          <option value="verified_fixed">Verified Fixed</option>
          <option value="reopened">Reopened</option>
        </select>

        {(search || filterStatus) && (
          <button
            onClick={() => { setSearch(''); setFilterStatus(''); setPage(1) }}
            style={{
              padding: '7px 12px', background: 'var(--s2)', border: '1px solid var(--b)',
              borderRadius: 8, color: 'var(--t3)', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}
          >
            ✕ Clear Filters
          </button>
        )}

        {!isLoading && pagination.total != null && (
          <span style={{ fontSize: 11, color: 'var(--t3)', marginLeft: 'auto' }}>
            {pagination.total} tasks
          </span>
        )}

        {/* Bulk URL Verification toolbar — one action for every selected
            row, no per-row Verify button and no drawer. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--t3)', whiteSpace: 'nowrap' }}>
            {selectedTasks.size} selected
          </span>
          <button
            onClick={() => controller.confirm()}
            disabled={selectedTasks.size === 0}
            aria-label={selectedTasks.size === 0 ? 'Verify Selected' : `Verify Selected (${selectedTasks.size})`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
              whiteSpace: 'nowrap',
              cursor: selectedTasks.size === 0 ? 'not-allowed' : 'pointer',
              opacity: selectedTasks.size === 0 ? 0.4 : 1,
              background: 'linear-gradient(135deg, #7730ed, #00e5ff)',
              border: 'none', color: '#fff',
            }}
          >
            {selectedTasks.size === 0 ? 'Verify Selected' : `Verify Selected (${selectedTasks.size})`}
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '36px 140px 1.4fr 1.4fr 90px 95px 95px 95px 95px 190px',
            minWidth: 1166, padding: '11px 18px',
            borderBottom: '1px solid var(--b)', background: 'var(--s2)', gap: 10,
            alignItems: 'center',
          }}>
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allSelected}
              disabled={selectableTasks.length === 0}
              onChange={(e) => toggleAllVisible(e.target.checked)}
              aria-label={allSelected ? 'Deselect all URLs on this page' : 'Select all URLs on this page'}
            />
            {['Status', 'Issue', 'URL', 'Source', 'Created', 'Implemented', 'Verified', 'Updated', 'Actions'].map(h => (
              <div key={h} style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {h}
              </div>
            ))}
          </div>

          {isLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--t3)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <div style={{ width: 14, height: 14, border: '2px solid var(--cy)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Loading tasks…
              </div>
            </div>
          ) : error ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--re)', fontSize: 13 }}>
              Failed to load tasks.
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ padding: '52px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t2)', marginBottom: 5 }}>No tasks found</div>
              <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                {search || filterStatus
                  ? 'No results match your filters.'
                  : 'Tasks will appear here once issues are selected and remediation is initialized.'}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {tasks.map((task, i) => (
                <motion.div
                  key={task._id}
                  layout
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 140px 1.4fr 1.4fr 90px 95px 95px 95px 95px 190px',
                    minWidth: 1166, padding: '13px 18px',
                    borderBottom: i < tasks.length - 1 ? '1px solid var(--b)' : 'none',
                    alignItems: 'center', gap: 10,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--s2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <input
                    type="checkbox"
                    checked={selectedTasks.has(task._id)}
                    disabled={!isRowSelectable(task) || isTaskVerifying(task, progress)}
                    onChange={() => toggleRow(task)}
                    aria-label={`Select ${task.pageUrl} for verification`}
                  />

                  <div><TaskStatusBadge status={task.status} /></div>

                  <div style={{ paddingRight: 8, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.issueName || task.issueKey}
                    </div>
                    {task.issueCategory && (
                      <div style={{ fontSize: 10, color: 'var(--t3)' }}>{task.issueCategory}</div>
                    )}
                  </div>

                  <div style={{ paddingRight: 8, minWidth: 0 }}>
                    <TruncatedUrl url={task.pageUrl} />
                  </div>

                  <div><SourceBadge origin={task.origin} /></div>

                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>{formatDate(task.createdAt)}</div>
                  <div style={{ fontSize: 11, color: task.implementedAt ? 'var(--t2)' : 'var(--t3)' }}>{formatDate(task.implementedAt)}</div>
                  <div style={{ fontSize: 11, color: task.verifiedAt ? '#00f5a0' : 'var(--t3)' }}>{formatDate(task.verifiedAt)}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>{formatDate(task.updatedAt)}</div>

                  {/* Actions — always the next available USER OPERATION, never
                      a restatement of the STATUS badge already shown in the
                      first column, PLUS an always-available View Details for
                      any task that has at least one fix attempt (opens the
                      Before/Fix Applied/After modal — read-only, no
                      navigation). task_created -> Check DIY only (nothing
                      implemented yet, nothing to view); implemented/reopened
                      on Content/on-page rows -> View Details + "Verify
                      Selected" in the toolbar for the actual re-verify
                      action. A row currently part of an in-flight batch
                      always shows "Verifying…" regardless of persisted
                      status. Accessibility/AI-visibility reopened rows are
                      outside Bulk URL Verification's Phase 1 scope
                      (isOnPageCategory) and have no other way to re-verify,
                      so they keep the existing Check DIY fallback alongside
                      View Details. */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {isTaskVerifying(task, progress) ? (
                      <span style={{ fontSize: 11, color: 'var(--vi)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                        <span style={{ width: 10, height: 10, border: '2px solid var(--vi)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
                        Verifying…
                      </span>
                    ) : (
                      <>
                        {(task.status === 'task_created' || (task.status === 'reopened' && !isOnPageCategory(task))) && (
                          <button
                            onClick={() => router.push(getCheckDIYRoute(task))}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                              cursor: 'pointer', border: '1px solid rgba(119,48,237,0.3)',
                              background: 'rgba(119,48,237,0.08)', color: '#b580ff',
                              transition: 'all 0.15s', whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(119,48,237,0.16)'; e.currentTarget.style.borderColor = 'rgba(119,48,237,0.5)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(119,48,237,0.08)'; e.currentTarget.style.borderColor = 'rgba(119,48,237,0.3)' }}
                          >
                            🛠 Check DIY
                          </button>
                        )}

                        {task.status !== 'task_created' && (
                          <button
                            onClick={() => setDetailsTaskId(task._id)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                              cursor: 'pointer', border: '1px solid var(--b)',
                              background: 'transparent', color: 'var(--t3)',
                              transition: 'all 0.15s', whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--t2)'; e.currentTarget.style.borderColor = 'var(--t3)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.borderColor = 'var(--b)' }}
                          >
                            View Details
                          </button>
                        )}
                      </>
                    )}

                    {task.status === 'task_created' && (
                      <DeleteButton task={task} onDelete={setConfirmTask} />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 18 }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '7px 13px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'var(--s)', border: '1px solid var(--b)', color: 'var(--t2)',
              cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span style={{ fontSize: 12, color: 'var(--t3)' }}>Page {page} of {pagination.pages}</span>
          <button
            disabled={page >= pagination.pages}
            onClick={() => setPage(p => p + 1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '7px 13px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'var(--s)', border: '1px solid var(--b)', color: 'var(--t2)',
              cursor: page >= pagination.pages ? 'not-allowed' : 'pointer', opacity: page >= pagination.pages ? 0.4 : 1,
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Bulk URL Verification — table-driven, no drawer */}
      <BulkVerifyConfirmDialog
        open={controller.state === BatchState.CONFIRMING}
        onOpenChange={handleConfirmDialogOpenChange}
        selectedCount={selectedTasks.size}
        onConfirm={handleConfirmStart}
      />

      <VerifyUrlModal
        open={isBatchActive}
        onOpenChange={(nextOpen) => { if (!nextOpen) handleViewDetails() }}
        bulk={bulkModalProps}
      />

      {/* View Details — read-only, no navigation; preserves table filters/
          search/scroll/pagination since it's just local modal state. */}
      <OptimizationDetailsModal
        taskId={detailsTaskId}
        open={!!detailsTaskId}
        onOpenChange={(nextOpen) => { if (!nextOpen) setDetailsTaskId(null) }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteTaskDialog
        task={confirmTask}
        isDeleting={deleteTask.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmTask(null)}
      />

      {/* Toast */}
      {toast && createPortal(
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />,
        document.body
      )}
    </div>
  )
}
