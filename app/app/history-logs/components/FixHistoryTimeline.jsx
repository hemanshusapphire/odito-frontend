"use client"

import { useState } from 'react'
import { useTaskHistory } from '@/hooks/useDashboardQueries'
import AttemptSections from './AttemptSections'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function outcomeLabel(attempt) {
  const v = attempt.verification || {}
  if (attempt.attemptKind === 'reverify_only') {
    if (!v.result) return 'Re-verification pending'
    return v.result === 'verified_fixed' ? 'Re-verified · Fixed' : 'Re-verified · Reopened'
  }
  if (!v.result) return 'Pending verification'
  return v.result === 'verified_fixed' ? 'Fixed' : 'Reopened'
}

function dotColorFor(attempt) {
  const result = attempt.verification?.result
  if (!result) return 'var(--color-status-warning)'
  return result === 'verified_fixed' ? 'var(--color-status-success)' : 'var(--color-status-error)'
}

function TimelineRow({ attempt, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const color = dotColorFor(attempt)

  return (
    <div style={{ position: 'relative', paddingLeft: 22 }}>
      <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 6, width: 9, height: 9, borderRadius: '50%', background: color }} />
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t)', whiteSpace: 'nowrap' }}>
          Attempt #{attempt.attemptNumber}
        </span>
        <span style={{ fontSize: 11, color: 'var(--t3)', whiteSpace: 'nowrap' }}>
          {formatDate(attempt.implementedAt || attempt.verification?.verifiedAt)}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          {outcomeLabel(attempt)}
        </span>
        <span style={{ fontSize: 10, color: 'var(--t3)' }}>{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div style={{ marginTop: 10, marginBottom: 4 }}>
          <AttemptSections attempt={attempt} />
        </div>
      )}
    </div>
  )
}

/**
 * FIX HISTORY — every attempt for this issue instance, newest first.
 * Preserves earlier attempts even after a reopen: attempt #1's successful
 * verification is never overwritten by attempt #2's later result (that
 * immutability is a Phase 1 backend guarantee — this component just
 * displays it plainly).
 *
 * The latest attempt is already loaded (part of useTaskDetail's response);
 * older attempts are fetched lazily via GET /tasks/:taskId/history only
 * once the user explicitly asks for them, so a task with a long history
 * never pays for it until requested.
 */
export default function FixHistoryTimeline({ taskId, latestAttempt, attemptCount, hasOlderAttempts }) {
  const [showOlder, setShowOlder] = useState(false)
  const olderQuery = useTaskHistory(taskId, { enabled: showOlder })

  if (!latestAttempt) return null

  const olderAttempts = olderQuery.data?.data?.attempts || []
  const olderCount = Math.max(attemptCount - 1, 0)

  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        Fix History
        {attemptCount > 1 && (
          <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 'normal' }}> · {attemptCount} attempts</span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TimelineRow attempt={latestAttempt} />

        {showOlder && olderQuery.isLoading && (
          <div style={{ fontSize: 12, color: 'var(--t3)', paddingLeft: 22 }}>Loading earlier attempts…</div>
        )}
        {showOlder && olderQuery.isError && (
          <div style={{ fontSize: 12, color: 'var(--re)', paddingLeft: 22 }}>Couldn&apos;t load earlier attempts.</div>
        )}
        {olderAttempts.map(attempt => (
          <TimelineRow key={attempt.attemptNumber} attempt={attempt} />
        ))}
      </div>

      {hasOlderAttempts && !showOlder && (
        <button
          type="button"
          onClick={() => setShowOlder(true)}
          style={{
            marginTop: 14, fontSize: 11, fontWeight: 600, color: 'var(--cy)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          Show {olderCount} earlier attempt{olderCount === 1 ? '' : 's'}
        </button>
      )}
    </div>
  )
}
