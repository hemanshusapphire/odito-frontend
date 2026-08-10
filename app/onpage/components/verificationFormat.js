/**
 * Shared formatting helpers for the Verification UI (F4-001–F4-005).
 *
 * Extracted during F4-006 (production polish) — these three functions were
 * previously copy-pasted, unchanged, across VerificationResultPanel,
 * VerificationRunDrawer, and VerificationRunComparisonDrawer. One copy now;
 * behavior is identical to all three prior copies.
 */

export function aiStatusLabel(status) {
  if (status === 'SUCCESS') return 'Updated'
  if (status === 'FAILED') return 'Failed'
  if (status === 'SKIPPED') return 'Skipped'
  return status
}

export function formatCompletedAt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

// Matches the wider codebase's own duplicated formatDuration() convention
// (components/system-admin/cards/JobDetailCard.jsx, app/app/comparison/page.jsx)
// — same rules, now a single copy for the Verification UI specifically.
export function formatDuration(ms) {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms}ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}
