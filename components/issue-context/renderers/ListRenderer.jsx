"use client"

import React from 'react'

/**
 * ListRenderer
 *
 * Renders a list of URLs, page paths, or string items.
 * Used for: broken links, orphan pages, 4xx errors, sameAs links, etc.
 *
 * currentState.affectedItems: string[]
 */
export default function ListRenderer({ currentState }) {
  const { affectedItems, measurement, isAbsent } = currentState
  const items = affectedItems || []

  if (isAbsent || items.length === 0) {
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
        No items detected
      </div>
    )
  }

  const displayItems = items.slice(0, 30)
  const hasMore = items.length > 30

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Count */}
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: 'var(--re)',
        background: 'var(--color-status-error-surface)',
        border: '1px solid var(--color-status-error-border)',
        borderRadius: 20,
        padding: '2px 9px',
        display: 'inline-flex',
        alignSelf: 'flex-start',
      }}>
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </div>

      {/* List */}
      <div style={{
        border: '1px solid var(--b)',
        borderRadius: 10,
        overflow: 'hidden',
        maxHeight: 280,
        overflowY: 'auto',
      }}>
        {displayItems.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '8px 12px',
              borderBottom: i < displayItems.length - 1 ? '1px solid var(--b)' : 'none',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 9, color: 'var(--t3)', flexShrink: 0, width: 16, textAlign: 'right' }}>
              {i + 1}
            </span>
            <span style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 11.5,
              color: 'var(--cy)',
              wordBreak: 'break-all',
              lineHeight: 1.4,
            }}>
              {String(item)}
            </span>
          </div>
        ))}

        {hasMore && (
          <div style={{
            padding: '8px 12px',
            fontSize: 10.5,
            color: 'var(--t3)',
            textAlign: 'center',
            background: 'var(--s2)',
            borderTop: '1px solid var(--b)',
          }}>
            + {items.length - 30} more items
          </div>
        )}
      </div>
    </div>
  )
}
