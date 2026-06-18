"use client"

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useProject } from '@/contexts/ProjectContext'
import { useTasks, useTaskSummary, useDeleteTask } from '@/hooks/useDashboardQueries'
import { CheckSquare, Search, ChevronLeft, ChevronRight, Trash2, AlertTriangle } from 'lucide-react'

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

function getCheckDIYRoute(task) {
  const cat = (task.issueCategory || '').toLowerCase()
  const qs = new URLSearchParams()
  if (task.pageUrl) qs.set('url', task.pageUrl)
  qs.set('mode', 'diy')

  if (cat.includes('accessibility')) {
    return `/accessibility?issue=${encodeURIComponent(task.issueKey)}&${qs}`
  }
  if (cat.includes('ai') || cat.includes('visibility') || cat.includes('search audit')) {
    return `/ai-search-audit/issues/${encodeURIComponent(task.issueKey)}?${qs}`
  }
  return `/onpage?issue=${encodeURIComponent(task.issueKey)}&${qs}`
}

const ORIGIN_LABELS = {
  ai_fix:    '✦ AI Fix',
  diy_guide: '🛠 DIY',
  auditiq:   '🤝 AuditIQ',
  manual:    '✎ Manual',
}

function SourceBadge({ origin }) {
  const label = ORIGIN_LABELS[origin] || origin || '—'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 20,
      fontSize: 10, fontWeight: 600,
      background: 'var(--s2)', color: 'var(--t2)',
      border: '1px solid var(--b)', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function StatusBadge({ status }) {
  let bg = 'rgba(255,255,255,0.05)', border = 'rgba(255,255,255,0.1)', color = 'var(--t3)', label = status

  switch (status) {
    case 'task_created':
      bg = 'rgba(0,223,255,0.08)'; border = 'rgba(0,223,255,0.2)'; color = '#00dfff'; label = '📋 Created'; break
    case 'implemented':
      bg = 'rgba(157,78,221,0.08)'; border = 'rgba(157,78,221,0.2)'; color = '#b580ff'; label = '⏳ Implemented'; break
    case 'verified_fixed':
      bg = 'rgba(0,245,160,0.08)'; border = 'rgba(0,245,160,0.2)'; color = '#00f5a0'; label = '✅ Verified'; break
    case 'reopened':
      bg = 'rgba(255,56,96,0.08)'; border = 'rgba(255,56,96,0.2)'; color = '#ff6080'; label = '⚠️ Reopened'; break
  }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: bg, color, border: `1px solid ${border}`,
    }}>
      {label}
    </span>
  )
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

  useEffect(() => { document.title = "Optimization Center | Odito" }, [])

  useEffect(() => {
    const id = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 350)
    return () => clearTimeout(id)
  }, [search])

  const queryParams = {
    projectId: activeProject?._id,
    page,
    limit: 20,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(filterStatus    && { status: filterStatus }),
  }

  const { data: tasksResponse, isLoading, error } = useTasks(queryParams)
  const { data: summaryResponse }                  = useTaskSummary(activeProject?._id)
  const deleteTask                                  = useDeleteTask(activeProject?._id)

  const tasks      = tasksResponse?.data?.tasks      || []
  const pagination = tasksResponse?.data?.pagination || {}
  const summary    = summaryResponse?.data           || { task_created: 0, implemented: 0, verified_fixed: 0, reopened: 0, total: 0 }

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
      </div>

      {/* Table */}
      <div style={{ background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '140px 1.4fr 1.4fr 90px 95px 95px 95px 95px 130px',
            minWidth: 1070, padding: '11px 18px',
            borderBottom: '1px solid var(--b)', background: 'var(--s2)', gap: 10,
          }}>
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
                    gridTemplateColumns: '140px 1.4fr 1.4fr 90px 95px 95px 95px 95px 130px',
                    minWidth: 1070, padding: '13px 18px',
                    borderBottom: i < tasks.length - 1 ? '1px solid var(--b)' : 'none',
                    alignItems: 'center', gap: 10,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--s2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div><StatusBadge status={task.status} /></div>

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

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {task.status === 'task_created' || task.status === 'reopened' ? (
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
                    ) : task.status === 'implemented' ? (
                      <span style={{ fontSize: 11, color: 'var(--vi)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                        ⏳ Pending Crawl
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--gr)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                        ✓ Verified Fixed
                      </span>
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
