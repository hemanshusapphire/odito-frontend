"use client"

import React from 'react'

/**
 * TableRenderer
 *
 * Renders a table of items (images, NAP variants, OG tags, axe violations, etc.)
 *
 * currentState.formattedValue: { columns: string[], rows: object[] }
 */
export default function TableRenderer({ currentState }) {
  const { formattedValue, measurement, isAbsent } = currentState
  const columns = formattedValue?.columns || []
  const rows = formattedValue?.rows || []

  if (isAbsent || rows.length === 0) {
    return (
      <div style={{
        padding: '12px 14px',
        background: 'var(--s)',
        border: '1px dashed var(--b)',
        borderRadius: 10,
        color: 'var(--t3)',
        fontSize: 12,
        textAlign: 'center',
      }}>
        No items to display
      </div>
    )
  }

  // Derive keys from first row if columns not provided
  const keys = columns.length > 0 ? columns : Object.keys(rows[0] || {})

  return (
    <div>
      {/* Count badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--re)',
          background: 'var(--color-status-error-surface)',
          border: '1px solid var(--color-status-error-border)',
          borderRadius: 20,
          padding: '2px 9px',
        }}>
          {rows.length} {rows.length === 1 ? 'item' : 'items'} affected
        </span>
      </div>

      {/* Table */}
      <div style={{
        border: '1px solid var(--b)',
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${keys.length}, 1fr)`,
          background: 'var(--s2)',
          borderBottom: '1px solid var(--b)',
        }}>
          {keys.map(col => (
            <div key={col} style={{
              padding: '8px 12px',
              fontSize: 9.5,
              fontWeight: 700,
              color: 'var(--t3)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}>
              {col.replace(/_/g, ' ')}
            </div>
          ))}
        </div>

        {/* Rows — max 20 displayed */}
        {rows.slice(0, 20).map((row, i) => {
          const rowValues = keys.map(col => {
            if (row[col] !== undefined && row[col] !== null) return row[col]
            const lower = col.toLowerCase()
            if (row[lower] !== undefined && row[lower] !== null) return row[lower]
            // camelCase: "Page URL" → "pageUrl", "Match Status" → "matchStatus"
            const camel = lower.replace(/\s+(.)/g, (_, c) => c.toUpperCase())
            if (row[camel] !== undefined && row[camel] !== null) return row[camel]
            // snake_case: "Page URL" → "page_url"
            const snake = lower.replace(/\s+/g, '_')
            if (row[snake] !== undefined && row[snake] !== null) return row[snake]
            return '—'
          })
          return (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${keys.length}, 1fr)`,
                borderBottom: i < rows.length - 1 ? '1px solid var(--b)' : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              }}
            >
              {rowValues.map((val, j) => {
                const isStatus = typeof val === 'string' && (val === 'Missing' || val === 'No' || val === 'false')
                const isGood = typeof val === 'string' && (val === 'Present' || val === 'Yes' || val === 'true')
                return (
                  <div key={j} style={{
                    padding: '9px 12px',
                    fontSize: 11.5,
                    fontFamily: j === 0 ? 'DM Mono, monospace' : 'inherit',
                    color: isStatus ? 'var(--re)' : isGood ? 'var(--gr)' : 'var(--t2)',
                    wordBreak: 'break-all',
                    lineHeight: 1.4,
                  }}>
                    {String(val)}
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Overflow note */}
        {rows.length > 20 && (
          <div style={{
            padding: '8px 12px',
            fontSize: 10.5,
            color: 'var(--t3)',
            textAlign: 'center',
            borderTop: '1px solid var(--b)',
            background: 'var(--s2)',
          }}>
            Showing 20 of {rows.length} items
          </div>
        )}
      </div>
    </div>
  )
}
