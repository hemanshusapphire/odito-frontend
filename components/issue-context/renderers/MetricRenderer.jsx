"use client"

import React from 'react'

/**
 * MetricRenderer
 *
 * Renders a numeric metric with a gauge bar showing detected vs. threshold.
 *
 * currentState.measurement: { value, unit, threshold, label? }
 */
export default function MetricRenderer({ currentState }) {
  const { measurement, isAbsent } = currentState
  const { value, unit, threshold, label } = measurement || {}

  if (isAbsent || value == null) {
    return (
      <div style={{
        padding: '12px 14px',
        background: 'var(--color-status-warning-surface)',
        border: '1px solid var(--color-status-warning-border)',
        borderRadius: 10,
        color: 'var(--am)',
        fontSize: 12,
      }}>
        Metric not detected
      </div>
    )
  }

  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0
  const numThreshold = threshold != null ? parseFloat(threshold) : null

  // Determine pass/fail (contextual — some issues fail when below, some when above)
  const isFailing = numThreshold != null ? numValue < numThreshold : false
  const fillPercent = numThreshold
    ? Math.min(100, Math.round((numValue / (numThreshold * 1.5)) * 100))
    : 66

  const statusColor = isFailing ? 'var(--re)' : 'var(--gr)'
  const statusBg = isFailing ? 'var(--color-status-error-surface)' : 'var(--color-status-success-surface)'
  const statusBorder = isFailing ? 'var(--color-status-error-border)' : 'var(--color-status-success-border)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Big number */}
      <div style={{
        padding: '16px 18px',
        background: 'var(--s)',
        border: '1px solid var(--b)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
      }}>
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: 36,
          fontWeight: 800,
          lineHeight: 1,
          color: statusColor,
        }}>
          {numValue.toLocaleString()}
        </span>
        <span style={{ fontSize: 13, color: 'var(--t3)', paddingBottom: 4 }}>
          {unit}
        </span>

        {numThreshold != null && (
          <span style={{
            marginLeft: 'auto',
            fontSize: 10,
            fontWeight: 700,
            color: statusColor,
            background: statusBg,
            border: `1px solid ${statusBorder}`,
            borderRadius: 20,
            padding: '3px 10px',
            whiteSpace: 'nowrap',
          }}>
            {isFailing ? `Need ${numThreshold} ${unit}` : `Exceeds ${numThreshold} ${unit}`}
          </span>
        )}
      </div>

      {/* Optional label (e.g. the detected text for description_minimum_50_characters) */}
      {label && typeof label === 'string' && label.length > 0 && (
        <div style={{
          padding: '8px 12px',
          background: 'var(--s2)',
          borderRadius: 8,
          fontSize: 11.5,
          color: 'var(--t2)',
          fontStyle: 'italic',
          wordBreak: 'break-word',
        }}>
          &ldquo;{label}&rdquo;
        </div>
      )}

      {/* Gauge bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 10, color: 'var(--t3)' }}>
          <span>0</span>
          {numThreshold && <span>Target: {numThreshold} {unit}</span>}
        </div>
        <div style={{ height: 8, background: 'var(--s2)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
          {/* Threshold marker */}
          {numThreshold && (
            <div style={{
              position: 'absolute',
              left: `${Math.min(66, 100)}%`,
              top: 0,
              bottom: 0,
              width: 2,
              background: 'var(--t3)',
              opacity: 0.4,
            }} />
          )}
          <div style={{
            height: '100%',
            width: `${fillPercent}%`,
            background: statusColor,
            borderRadius: 99,
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>
    </div>
  )
}
