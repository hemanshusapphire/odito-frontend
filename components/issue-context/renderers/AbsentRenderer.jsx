"use client"

import React from 'react'

/**
 * AbsentRenderer
 *
 * Renders a clear "not detected" state for missing elements:
 *   missing title, H1, canonical, schema, Open Graph tags, etc.
 *
 * currentState.checkedFor: string — what was looked for
 */
export default function AbsentRenderer({ currentState, expectedState }) {
  const { checkedFor } = currentState
  const expectedDesc = expectedState?.description || ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Absent indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 18px',
        background: 'var(--color-status-error-surface)',
        border: '1px solid var(--color-status-error-border)',
        borderRadius: 12,
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'rgba(255,68,68,0.15)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 20,
          flexShrink: 0,
        }}>
          ✕
        </div>
        <div>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--re)',
            marginBottom: 3,
          }}>
            Not detected
          </div>
          <div style={{
            fontSize: 11.5,
            color: 'rgba(255,68,68,0.7)',
          }}>
            No {checkedFor || 'element'} was found on this page
          </div>
        </div>
      </div>

      {/* Expected state hint */}
      {expectedDesc && (
        <div style={{
          padding: '10px 14px',
          background: 'var(--color-status-success-surface)',
          border: '1px solid var(--color-status-success-border)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
        }}>
          <span style={{ fontSize: 13, color: 'var(--gr)', flexShrink: 0, marginTop: 1 }}>✓</span>
          <span style={{ fontSize: 11.5, color: 'var(--gr)', lineHeight: 1.5 }}>
            <strong>Expected:</strong> {expectedDesc}
          </span>
        </div>
      )}
    </div>
  )
}
