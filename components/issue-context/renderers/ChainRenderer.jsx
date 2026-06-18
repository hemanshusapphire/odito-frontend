"use client"

import React from 'react'

/**
 * ChainRenderer
 *
 * Renders a redirect chain or click depth path as a sequential flow.
 *
 * currentState.formattedValue: string[] (each hop URL)
 */
export default function ChainRenderer({ currentState }) {
  const { formattedValue, rawValue, measurement, isAbsent } = currentState
  const hops = (formattedValue || rawValue || []).map(String)

  if (isAbsent || hops.length === 0) {
    return (
      <div style={{
        padding: '12px 14px',
        background: 'var(--s)',
        border: '1px dashed var(--b)',
        borderRadius: 10,
        color: 'var(--t3)',
        fontSize: 12,
      }}>
        No chain data detected
      </div>
    )
  }

  const isLoop = hops[hops.length - 1] === '(loops back)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Count badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--re)',
          background: 'var(--color-status-error-surface)',
          border: '1px solid var(--color-status-error-border)',
          borderRadius: 20,
          padding: '2px 9px',
        }}>
          {measurement?.value || hops.length} {measurement?.unit || 'hops'}
        </span>
        {isLoop && (
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--am)',
            background: 'var(--color-status-warning-surface)',
            border: '1px solid var(--color-status-warning-border)',
            borderRadius: 20,
            padding: '2px 9px',
          }}>
            ⚠ Redirect Loop
          </span>
        )}
      </div>

      {/* Chain */}
      <div style={{
        border: '1px solid var(--b)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {hops.map((hop, i) => (
          <React.Fragment key={i}>
            {/* Hop node */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              background: i === 0 ? 'var(--color-status-error-surface)'
                : i === hops.length - 1 ? (isLoop ? 'var(--color-status-warning-surface)' : 'var(--color-status-success-surface)')
                : 'var(--s)',
            }}>
              {/* Step badge */}
              <div style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: i === 0 ? 'var(--re)'
                  : i === hops.length - 1 ? (isLoop ? 'var(--am)' : 'var(--gr)')
                  : 'var(--t3)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 9,
                fontWeight: 800,
                color: '#fff',
                flexShrink: 0,
              }}>
                {i + 1}
              </div>
              {/* URL */}
              <span style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 11.5,
                color: i === 0 ? 'var(--re)' : i === hops.length - 1 ? (isLoop ? 'var(--am)' : 'var(--gr)') : 'var(--t)',
                wordBreak: 'break-all',
                lineHeight: 1.4,
              }}>
                {hop}
              </span>
              {/* Labels */}
              {i === 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 9.5, fontWeight: 600, color: 'var(--re)', flexShrink: 0 }}>START</span>
              )}
              {i === hops.length - 1 && !isLoop && (
                <span style={{ marginLeft: 'auto', fontSize: 9.5, fontWeight: 600, color: 'var(--gr)', flexShrink: 0 }}>FINAL</span>
              )}
            </div>

            {/* Arrow connector */}
            {i < hops.length - 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                padding: '0 24px',
                color: 'var(--t3)',
                fontSize: 14,
                lineHeight: 1,
                borderLeft: '1px solid var(--b)',
                borderRight: '1px solid var(--b)',
                background: 'var(--s2)',
              }}>
                ↓
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
