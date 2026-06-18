"use client"

import React from 'react'

/**
 * TreeRenderer
 *
 * Renders a hierarchical heading tree (for heading_hierarchy_skipped).
 * Shows H1 → H2 → H3 with visual indentation.
 * Missing/skipped levels shown in amber.
 *
 * currentState.formattedValue: [{ level: 'H1'|'H2'|'H3', text: string }]
 */
export default function TreeRenderer({ currentState }) {
  const { formattedValue, rawValue, isAbsent } = currentState
  const nodes = formattedValue || rawValue || []

  if (isAbsent || !Array.isArray(nodes) || nodes.length === 0) {
    return (
      <div style={{
        padding: '12px 14px',
        background: 'var(--s)',
        border: '1px dashed var(--b)',
        borderRadius: 10,
        color: 'var(--t3)',
        fontSize: 12,
      }}>
        No headings detected on this page
      </div>
    )
  }

  // Detect hierarchy gaps
  const withGaps = _detectGaps(nodes)

  const INDENT = { H1: 0, H2: 18, H3: 36, H4: 54, H5: 72, H6: 90 }
  const COLOR = { H1: 'var(--cy)', H2: 'var(--vi)', H3: 'var(--t2)', H4: 'var(--t3)', H5: 'var(--t3)', H6: 'var(--t3)' }

  return (
    <div style={{
      border: '1px solid var(--b)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 14px',
        background: 'var(--s2)',
        borderBottom: '1px solid var(--b)',
        fontSize: 9.5,
        fontWeight: 700,
        color: 'var(--t3)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        Heading Structure
      </div>

      {/* Tree nodes */}
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {withGaps.map((node, i) => {
          if (node.isGap) {
            return (
              <div key={`gap-${i}`} style={{
                paddingLeft: INDENT[node.level] || 0,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: 0.7,
              }}>
                <span style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10,
                  color: 'var(--am)',
                  background: 'var(--color-status-warning-surface)',
                  border: '1px solid var(--color-status-warning-border)',
                  borderRadius: 5,
                  padding: '1px 6px',
                }}>
                  {node.level}
                </span>
                <span style={{ fontSize: 11, color: 'var(--am)', fontStyle: 'italic' }}>
                  Missing — hierarchy skipped
                </span>
              </div>
            )
          }
          return (
            <div key={i} style={{
              paddingLeft: INDENT[node.level] || 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}>
              <span style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 9.5,
                fontWeight: 700,
                color: COLOR[node.level] || 'var(--t3)',
                background: 'var(--s2)',
                border: '1px solid var(--b)',
                borderRadius: 5,
                padding: '1px 6px',
                flexShrink: 0,
                marginTop: 1,
              }}>
                {node.level}
              </span>
              <span style={{
                fontSize: 12,
                color: 'var(--t)',
                lineHeight: 1.45,
                wordBreak: 'break-word',
              }}>
                {node.text}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Detect skipped heading levels ───────────────────────────────────────────

function _detectGaps(nodes) {
  const order = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']
  const result = []
  let prevLevel = null

  for (const node of nodes) {
    const level = node.level?.toUpperCase()
    if (!level) continue

    if (prevLevel) {
      const prevIdx = order.indexOf(prevLevel)
      const currIdx = order.indexOf(level)
      // More than one step down = gap
      if (currIdx > prevIdx + 1) {
        for (let gi = prevIdx + 1; gi < currIdx; gi++) {
          result.push({ level: order[gi], text: '', isGap: true })
        }
      }
    }
    result.push({ ...node, level, isGap: false })
    prevLevel = level
  }
  return result
}
