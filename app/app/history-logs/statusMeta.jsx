"use client"

/**
 * Shared status styling for the Optimization Center — extracted out of
 * page.jsx (not just for reuse in the View Details modal, but because
 * Next.js's App Router build fails if a page.jsx file exports anything
 * besides the handful of names it recognizes; see taskRouting.js for the
 * same pattern). Single source of truth so the table's badges and the
 * details modal's badges can never drift into inconsistent designs.
 */

export const ORIGIN_LABELS = {
  ai_fix:    '✦ AI Fix',
  diy_guide: '🛠 DIY',
  auditiq:   '🤝 AuditIQ',
  manual:    '✎ Manual',
}

export function originLabel(origin) {
  return ORIGIN_LABELS[origin] || origin || 'Manual Fix'
}

const TASK_STATUS_META = {
  task_created:   { bg: 'rgba(0,223,255,0.08)',   border: 'rgba(0,223,255,0.2)',   color: '#00dfff', label: '📋 Pending' },
  implemented:    { bg: 'rgba(157,78,221,0.08)',  border: 'rgba(157,78,221,0.2)',  color: '#b580ff', label: '⏳ Implemented' },
  verified_fixed: { bg: 'rgba(0,245,160,0.08)',   border: 'rgba(0,245,160,0.2)',   color: '#00f5a0', label: '✅ Verified' },
  reopened:       { bg: 'rgba(255,56,96,0.08)',   border: 'rgba(255,56,96,0.2)',   color: '#ff6080', label: '⚠️ Reopened' },
}

const DEFAULT_STATUS_META = { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: 'var(--t3)', label: null }

export function taskStatusMeta(status) {
  return TASK_STATUS_META[status] || { ...DEFAULT_STATUS_META, label: status }
}

// Per-attempt / verification-result status meta — a strict subset of the
// same visual language, covering only the states the backend actually
// produces (attempt.status, attempt.verification.result): never invents a
// "failed" state the API doesn't emit.
const ATTEMPT_STATUS_META = {
  pending_verification: { bg: 'rgba(255,183,3,0.08)',  border: 'rgba(255,183,3,0.2)',  color: '#ffb703', label: '○ Verification Pending' },
  verified_fixed:        { bg: 'rgba(0,245,160,0.08)',  border: 'rgba(0,245,160,0.2)',  color: '#00f5a0', label: '✓ Verified Fixed' },
  reopened:               { bg: 'rgba(255,56,96,0.08)',  border: 'rgba(255,56,96,0.2)',  color: '#ff6080', label: '⚠ Reopened' },
}

export function attemptStatusMeta(status) {
  return ATTEMPT_STATUS_META[status] || { ...DEFAULT_STATUS_META, label: 'Unknown' }
}

export function TaskStatusBadge({ status }) {
  const meta = taskStatusMeta(status)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
    }}>
      {meta.label}
    </span>
  )
}

export function AttemptStatusBadge({ status, size = 'md' }) {
  const meta = attemptStatusMeta(status)
  const isSm = size === 'sm'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: isSm ? '2px 8px' : '3px 10px', borderRadius: 20,
      fontSize: isSm ? 10 : 11, fontWeight: 700,
      background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
      whiteSpace: 'nowrap',
    }}>
      {meta.label}
    </span>
  )
}

export function SourceBadge({ origin }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 20,
      fontSize: 10, fontWeight: 600,
      background: 'var(--s2)', color: 'var(--t2)',
      border: '1px solid var(--b)', whiteSpace: 'nowrap',
    }}>
      {originLabel(origin)}
    </span>
  )
}
