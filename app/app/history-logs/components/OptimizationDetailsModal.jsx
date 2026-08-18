"use client"

import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useTaskDetail } from '@/hooks/useDashboardQueries'
import { TaskStatusBadge, SourceBadge } from '../statusMeta'
import { getIssueDetailsRoute } from '../taskRouting'
import AttemptSections from './AttemptSections'
import FixHistoryTimeline from './FixHistoryTimeline'

function Skeleton({ h = 14, w = '100%', style }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: 6,
      background: 'var(--s2)', opacity: 0.7,
      ...style,
    }} />
  )
}

function DetailsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '4px 2px' }}>
      <Skeleton h={20} w="65%" />
      <Skeleton h={13} w="45%" />
      <div style={{ display: 'flex', gap: 8 }}>
        <Skeleton h={22} w={90} />
        <Skeleton h={22} w={70} />
      </div>
      <Skeleton h={90} />
      <Skeleton h={90} />
      <Skeleton h={90} />
    </div>
  )
}

function ErrorState({ status, onRetry }) {
  if (status === 404) {
    return (
      <div style={{ padding: '32px 4px', textAlign: 'center' }}>
        <div style={{ fontSize: 26, marginBottom: 10 }}>🗑️</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t2)' }}>
          This optimization task is no longer available.
        </div>
      </div>
    )
  }
  if (status === 403) {
    return (
      <div style={{ padding: '32px 4px', textAlign: 'center' }}>
        <div style={{ fontSize: 26, marginBottom: 10 }}>🔒</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t2)' }}>
          You don&apos;t have access to this task.
        </div>
      </div>
    )
  }
  return (
    <div style={{ padding: '32px 4px', textAlign: 'center' }}>
      <div style={{ fontSize: 26, marginBottom: 10 }}>⚠️</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t2)', marginBottom: 4 }}>
        Unable to load issue details
      </div>
      <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 16 }}>Please try again.</div>
      <button
        type="button"
        onClick={onRetry}
        style={{
          padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: 'var(--s2)', border: '1px solid var(--b)', color: 'var(--t)',
          cursor: 'pointer',
        }}
      >
        Retry
      </button>
    </div>
  )
}

function NoHistoryState({ task }) {
  // task_created with empty fixHistory just means nothing's been implemented
  // yet — not a legacy-data gap. Every other status reaching here (a task
  // that IS implemented/verified/reopened but has no fixHistory) predates
  // this field being introduced.
  const notYetImplemented = task.status === 'task_created'
  return (
    <div>
      <div style={{
        background: 'var(--s2)', border: '1px solid var(--b)', borderRadius: 12,
        padding: '16px 18px', marginBottom: 4,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)', marginBottom: 6 }}>
          {notYetImplemented ? 'No fix implemented yet' : 'Historical fix details unavailable'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6 }}>
          {notYetImplemented
            ? 'This issue hasn’t been fixed yet, so there’s no before/after remediation history to show.'
            : 'This task was created before detailed remediation history was enabled. Current status is shown above; before/fix/after details aren’t available for it.'}
        </div>
      </div>
    </div>
  )
}

/**
 * Optimization Center — View Details modal (Phase 2).
 *
 * Read-only: fetches GET /tasks/:taskId only while open (`enabled: open`),
 * renders the latest fix attempt's real Before → Fix Applied → After →
 * Verification data, and lazily loads older attempts (FixHistoryTimeline)
 * only when the user asks for them. No mutation actions live here — closing
 * it never needs to invalidate or refetch the Optimization Center table.
 */
export default function OptimizationDetailsModal({ taskId, open, onOpenChange }) {
  const router = useRouter()
  const { data, isLoading, isError, error, refetch } = useTaskDetail(taskId, { enabled: open })
  const task = data?.data

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[92vw] border-0 bg-transparent p-0 shadow-none sm:rounded-none">
        <div
          style={{
            background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 18,
            boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
            maxHeight: '85vh', display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header — DialogTitle/Description always render (Radix requires
              them for a11y even while loading), visually swapped for a
              skeleton via sr-only when there's no task data yet. */}
          <div style={{ padding: '22px 26px 16px', borderBottom: '1px solid var(--b)', flexShrink: 0 }}>
            <DialogTitle
              className={task ? undefined : 'sr-only'}
              style={task ? { fontFamily: 'var(--font-metric)', fontSize: 18, fontWeight: 800, color: 'var(--t)', lineHeight: 1.25, paddingRight: 28 } : undefined}
            >
              {task ? (task.issueName || task.issueKey) : 'Issue Details'}
            </DialogTitle>
            <DialogDescription className={task ? undefined : 'sr-only'} asChild={!!task}>
              {task ? (
                <div style={{ fontSize: 12, color: 'var(--cy)', marginTop: 4, wordBreak: 'break-all' }}>
                  {task.pageUrl}
                </div>
              ) : (
                'Optimization task remediation details'
              )}
            </DialogDescription>

            {isLoading ? (
              <div style={{ marginTop: 12 }}><DetailsSkeleton /></div>
            ) : isError ? null : task ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <TaskStatusBadge status={task.status} />
                  {task.issueCategory && (
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>{task.issueCategory}</span>
                  )}
                  <span style={{ color: 'var(--t3)', fontSize: 11 }}>•</span>
                  <SourceBadge origin={task.origin} />

                  <button
                    type="button"
                    onClick={() => { onOpenChange(false); router.push(getIssueDetailsRoute(task)) }}
                    style={{
                      marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: 'var(--t3)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    Open full issue view ↗
                  </button>
                </div>

                {task.status === 'reopened' && (
                  <div style={{
                    marginTop: 14, background: 'var(--color-status-error-surface)',
                    border: '1px solid var(--color-status-error-border)', borderRadius: 10,
                    padding: '10px 14px', fontSize: 12, color: 'var(--t2)', lineHeight: 1.5,
                  }}>
                    <strong style={{ color: 'var(--color-status-error)' }}>⚠ Reopened.</strong>{' '}
                    This issue was previously verified as fixed, but was detected again during a later verification.
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Body */}
          <div style={{ padding: '20px 26px 26px', overflowY: 'auto' }}>
            {isLoading ? null : isError ? (
              <ErrorState status={error?.status} onRetry={refetch} />
            ) : !task ? (
              <ErrorState onRetry={refetch} />
            ) : !task.historyAvailable ? (
              <NoHistoryState task={task} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <AttemptSections attempt={task.latestAttempt} />
                <FixHistoryTimeline
                  taskId={task._id}
                  latestAttempt={task.latestAttempt}
                  attemptCount={task.attemptCount}
                  hasOlderAttempts={task.hasOlderAttempts}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
