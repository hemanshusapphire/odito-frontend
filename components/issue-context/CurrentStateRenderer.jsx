"use client"

import React, { memo } from 'react'
import dynamic from 'next/dynamic'

// Lazy-load renderers so unused display types don't bloat the initial bundle
const TextRenderer        = dynamic(() => import('./renderers/TextRenderer'),        { ssr: false })
const MetricRenderer      = dynamic(() => import('./renderers/MetricRenderer'),      { ssr: false })
const CodeRenderer        = dynamic(() => import('./renderers/CodeRenderer'),        { ssr: false })
const TableRenderer       = dynamic(() => import('./renderers/TableRenderer'),       { ssr: false })
const TreeRenderer        = dynamic(() => import('./renderers/TreeRenderer'),        { ssr: false })
const ChainRenderer       = dynamic(() => import('./renderers/ChainRenderer'),       { ssr: false })
const AbsentRenderer      = dynamic(() => import('./renderers/AbsentRenderer'),      { ssr: false })
const ListRenderer        = dynamic(() => import('./renderers/ListRenderer'),        { ssr: false })

const DISPLAY_TYPE_MAP = {
  text:   TextRenderer,
  metric: MetricRenderer,
  code:   CodeRenderer,
  table:  TableRenderer,
  tree:   TreeRenderer,
  chain:  ChainRenderer,
  absent: AbsentRenderer,
  list:   ListRenderer,
}

/**
 * CurrentStateRenderer
 *
 * The single entry point for rendering Issue Context current state.
 * Reads `currentState.displayType` and delegates to the correct renderer.
 *
 * Props:
 *   issueContext   IssueContext object from the backend
 *   isLoading      boolean — show skeleton
 *   error          Error | null
 *
 * This component renders ONLY the current state.
 * No recommendations, no AI, no before/after.
 */
const CurrentStateRenderer = memo(function CurrentStateRenderer({ issueContext, isLoading, error }) {

  // ── Loading state ───────────────────────────────────────────────────────
  if (isLoading) {
    return <CurrentStateSkeleton />
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{
        padding: '12px 14px',
        background: 'var(--color-status-warning-surface)',
        border: '1px solid var(--color-status-warning-border)',
        borderRadius: 10,
        fontSize: 11.5,
        color: 'var(--am)',
      }}>
        Could not load current state — {error.message || 'unknown error'}
      </div>
    )
  }

  // ── No context yet ───────────────────────────────────────────────────────
  if (!issueContext) {
    return (
      <div style={{
        padding: '14px 16px',
        background: 'var(--s)',
        border: '1px dashed var(--b)',
        borderRadius: 10,
        color: 'var(--t3)',
        fontSize: 12,
        textAlign: 'center',
      }}>
        Select a URL to view the current detected state
      </div>
    )
  }

  const { currentState, expectedState, identity, metadata } = issueContext
  const displayType = currentState?.displayType || 'absent'
  const Renderer = DISPLAY_TYPE_MAP[displayType] || AbsentRenderer

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          fontSize: 9.5,
          fontWeight: 700,
          color: 'var(--t3)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          Current State
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Readiness score */}
          {metadata?.readinessScore != null && (
            <span style={{
              fontSize: 9.5,
              fontWeight: 700,
              color: metadata.readinessScore >= 70 ? 'var(--gr)' : metadata.readinessScore >= 40 ? 'var(--am)' : 'var(--re)',
              background: metadata.readinessScore >= 70 ? 'var(--color-status-success-surface)'
                : metadata.readinessScore >= 40 ? 'var(--color-status-warning-surface)'
                : 'var(--color-status-error-surface)',
              border: `1px solid ${metadata.readinessScore >= 70 ? 'var(--color-status-success-border)'
                : metadata.readinessScore >= 40 ? 'var(--color-status-warning-border)'
                : 'var(--color-status-error-border)'}`,
              borderRadius: 20,
              padding: '2px 8px',
            }}>
              {metadata.readinessScore}% context
            </span>
          )}
          {/* Data source badge */}
          <span style={{
            fontSize: 9.5,
            fontWeight: 600,
            color: 'var(--t3)',
            background: 'var(--s2)',
            border: '1px solid var(--b)',
            borderRadius: 20,
            padding: '2px 8px',
          }}>
            {identity?.pipeline === 'ai_visibility' ? '✦ AI Visibility' : '🗂 On-Page'}
          </span>
        </div>
      </div>

      {/* Renderer */}
      <Renderer currentState={currentState} expectedState={expectedState} />

      {/* Missing signals warning */}
      {metadata?.missingSignals?.length > 0 && (
        <div style={{
          fontSize: 10.5,
          color: 'var(--am)',
          background: 'var(--color-status-warning-surface)',
          border: '1px solid var(--color-status-warning-border)',
          borderRadius: 8,
          padding: '7px 10px',
        }}>
          ⚠ Some context signals are missing: {metadata.missingSignals.join(', ')}
        </div>
      )}
    </div>
  )
})

export default CurrentStateRenderer

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function CurrentStateSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: 90, height: 12, background: 'var(--s2)', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }} />
        <div style={{ width: 60, height: 12, background: 'var(--s2)', borderRadius: 6, animation: 'pulse 1.5s ease infinite' }} />
      </div>
      <div style={{ height: 72, background: 'var(--s2)', borderRadius: 10, animation: 'pulse 1.5s ease infinite' }} />
      <div style={{ height: 8, background: 'var(--s2)', borderRadius: 99, animation: 'pulse 1.5s ease infinite' }} />
    </div>
  )
}
