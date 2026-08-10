"use client"

import { aiStatusLabel } from "./verificationFormat"

const STATUS_LABEL = {
  completed: 'Completed',
  failed: 'Failed',
  running: 'Running',
  pending: 'Pending',
}

const STATUS_COLOR = {
  completed: { color: 'var(--color-status-success)', border: 'rgba(16,255,160,0.35)', bg: 'rgba(16,255,160,0.10)' },
  failed: { color: 'var(--color-status-error)', border: 'rgba(255,56,96,0.35)', bg: 'rgba(255,56,96,0.10)' },
  running: { color: 'var(--color-text-secondary)', border: 'var(--b)', bg: 'transparent' },
  pending: { color: 'var(--color-text-tertiary)', border: 'var(--b)', bg: 'transparent' },
}

/**
 * Shared Overall-status + AI-Visibility-status pill pair (F4-006 polish).
 *
 * Previously this exact markup/color mapping was hand-copied four times
 * (VerificationResultPanel's header, VerificationHistoryPanel's HistoryRow,
 * VerificationRunDrawer's header, VerificationRunComparisonDrawer's
 * RunColumn) — two of the four spelled the AI pill "AI: X", the other two
 * "AI Visibility: X". Standardized on "AI Visibility: X" everywhere.
 *
 * Renders only the <span> pills, no wrapping container, so each consumer
 * keeps its own surrounding flex layout unchanged.
 */
export default function VerificationStatusPills({ status, aiVisibilityStatus }) {
  const statusColors = STATUS_COLOR[status] || STATUS_COLOR.pending
  const aiSuccess = aiVisibilityStatus === 'SUCCESS'

  return (
    <>
      <span
        className="pill"
        role="status"
        style={{ color: statusColors.color, borderColor: statusColors.border, background: statusColors.bg }}
      >
        {STATUS_LABEL[status] || status}
      </span>
      {aiVisibilityStatus && (
        <span
          className="pill"
          role="status"
          style={{
            color: aiSuccess ? 'var(--color-status-success)' : 'var(--color-text-tertiary)',
            borderColor: aiSuccess ? 'rgba(16,255,160,0.35)' : 'var(--b)',
            background: aiSuccess ? 'rgba(16,255,160,0.10)' : 'transparent',
          }}
        >
          AI Visibility: {aiStatusLabel(aiVisibilityStatus)}
        </span>
      )}
    </>
  )
}
