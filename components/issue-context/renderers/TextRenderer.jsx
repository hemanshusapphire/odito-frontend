"use client"

import React from 'react'

/**
 * TextRenderer — Issue Inspection Panel
 *
 * Renders a text value (title, meta description, H1, opening paragraph, etc.)
 * as a full inspection panel showing:
 *
 *   • Section label          ("Current Meta Description")
 *   • Actual detected text   (quote block — real content, never a placeholder)
 *   • Character count        (from measurement.value — never re-derived from text length)
 *   • Target range           (measurement.threshold → measurement.maxThreshold)
 *   • Difference badge       (e.g. "8 characters short" or "15 characters over limit")
 *   • Calibrated progress bar
 *   • Why triggered          (from expectedState.description)
 *
 * currentState shape:
 *   {
 *     rawValue: string | null,
 *     label: string | null,        e.g. "Meta Description"
 *     measurement: {
 *       value: number | null,      actual char count
 *       unit: string | null,       e.g. "characters"
 *       threshold: number | null,  minimum (triggers "too short")
 *       maxThreshold: number|null, maximum (triggers "too long")
 *     }
 *   }
 */
export default function TextRenderer({ currentState, expectedState }) {
  const { rawValue, label, measurement, isAbsent, relatedContent } = currentState
  const { value: charCount, unit, threshold: minThreshold, maxThreshold } = measurement || {}
  const expectedDesc = expectedState?.description || ''

  // ── Case: no text and no measurement ────────────────────────────────────
  if (isAbsent && charCount == null) {
    return (
      <div style={{
        padding: '13px 15px',
        background: 'var(--color-status-error-surface)',
        border: '1px solid var(--color-status-error-border)',
        borderRadius: 10,
        color: 'var(--re)',
        fontSize: 12,
        fontStyle: 'italic',
      }}>
        No {label || 'value'} detected on this page
      </div>
    )
  }

  // ── Derive status ────────────────────────────────────────────────────────
  const hasMin = minThreshold != null
  const hasMax = maxThreshold != null
  const hasCount = charCount != null

  const isTooShort = hasMin && hasCount && charCount < minThreshold
  const isTooLong  = hasMax && hasCount && charCount > maxThreshold
  const isInRange  = hasCount && !isTooShort && !isTooLong

  const shortfall  = hasMin && hasCount ? minThreshold - charCount : 0
  const overage    = hasMax && hasCount ? charCount - maxThreshold : 0

  // ── Status colours ───────────────────────────────────────────────────────
  const statusColor  = isTooShort ? 'var(--am)'
    : isTooLong  ? 'var(--re)'
    : 'var(--gr)'
  const statusBg     = isTooShort ? 'var(--color-status-warning-surface)'
    : isTooLong  ? 'var(--color-status-error-surface)'
    : 'var(--color-status-success-surface)'
  const statusBorder = isTooShort ? 'var(--color-status-warning-border)'
    : isTooLong  ? 'var(--color-status-error-border)'
    : 'var(--color-status-success-border)'

  const badgeText = isTooShort  ? `${shortfall} ${unit || 'characters'} short`
    : isTooLong   ? `${overage} ${unit || 'characters'} over limit`
    : isInRange   ? 'Within target range'
    : null

  // ── Bar calculation ──────────────────────────────────────────────────────
  // Bar represents where charCount sits relative to the optimal range.
  // Full bar = maxThreshold * 1.25 (leaves room to show "over" visually).
  const barMax = hasMax ? maxThreshold * 1.25 : hasMin ? minThreshold * 2 : null
  const fillPct = (hasCount && barMax) ? Math.min(100, Math.round((charCount / barMax) * 100)) : null

  // Positions of the min/max threshold markers as % of barMax
  const minMarkerPct = (hasMin && barMax) ? Math.round((minThreshold / barMax) * 100) : null
  const maxMarkerPct = (hasMax && barMax) ? Math.round((maxThreshold / barMax) * 100) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Section label ────────────────────────────────────────────── */}
      {label && (
        <div style={{
          fontSize: 9,
          fontWeight: 700,
          color: 'var(--t3)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          {label}
        </div>
      )}

      {/* ── Actual detected text ─────────────────────────────────────── */}
      {rawValue ? (
        <div style={{
          padding: '13px 16px',
          background: 'var(--s)',
          border: '1px solid var(--b)',
          borderLeft: `3px solid ${statusColor}`,
          borderRadius: '0 10px 10px 0',
          fontFamily: 'DM Mono, monospace',
          fontSize: 12.5,
          color: 'var(--t)',
          lineHeight: 1.6,
          wordBreak: 'break-word',
        }}>
          &ldquo;{rawValue}&rdquo;
        </div>
      ) : (
        /* No text available — show length-only info card */
        <div style={{
          padding: '11px 14px',
          background: 'var(--s2)',
          border: '1px dashed var(--b)',
          borderRadius: 10,
          fontSize: 11.5,
          color: 'var(--t3)',
          fontStyle: 'italic',
        }}>
          Detected text not stored — length captured from audit scan
        </div>
      )}

      {/* ── Metrics row ──────────────────────────────────────────────── */}
      {hasCount && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
        }}>
          {/* Detected length */}
          <div style={{
            padding: '10px 12px',
            background: 'var(--s)',
            border: '1px solid var(--b)',
            borderRadius: 10,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
              Detected
            </div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 22, fontWeight: 800, lineHeight: 1, color: statusColor }}>
              {charCount}
            </div>
            <div style={{ fontSize: 9.5, color: 'var(--t3)', marginTop: 3 }}>{unit || 'characters'}</div>
          </div>

          {/* Target range */}
          <div style={{
            padding: '10px 12px',
            background: 'var(--s)',
            border: '1px solid var(--b)',
            borderRadius: 10,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
              Target
            </div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 15, fontWeight: 800, lineHeight: 1, color: 'var(--gr)' }}>
              {hasMin && hasMax
                ? `${minThreshold}–${maxThreshold}`
                : hasMin
                ? `≥ ${minThreshold}`
                : hasMax
                ? `≤ ${maxThreshold}`
                : '—'
              }
            </div>
            <div style={{ fontSize: 9.5, color: 'var(--t3)', marginTop: 3 }}>{unit || 'characters'}</div>
          </div>

          {/* Difference */}
          <div style={{
            padding: '10px 12px',
            background: statusBg,
            border: `1px solid ${statusBorder}`,
            borderRadius: 10,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
              {isTooShort ? 'Short By' : isTooLong ? 'Over By' : 'Status'}
            </div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 22, fontWeight: 800, lineHeight: 1, color: statusColor }}>
              {isTooShort ? shortfall : isTooLong ? overage : '✓'}
            </div>
            <div style={{ fontSize: 9.5, color: statusColor, marginTop: 3 }}>
              {isTooShort ? unit || 'characters' : isTooLong ? unit || 'characters' : 'In range'}
            </div>
          </div>
        </div>
      )}

      {/* ── Progress bar ─────────────────────────────────────────────── */}
      {fillPct != null && (
        <div>
          {/* Bar */}
          <div style={{
            position: 'relative',
            height: 8,
            background: 'var(--s2)',
            borderRadius: 99,
            overflow: 'visible',
          }}>
            {/* Min threshold marker */}
            {minMarkerPct != null && (
              <div style={{
                position: 'absolute',
                left: `${minMarkerPct}%`,
                top: -2,
                bottom: -2,
                width: 2,
                background: 'var(--gr)',
                borderRadius: 1,
                zIndex: 2,
              }} title={`Minimum: ${minThreshold}`} />
            )}

            {/* Max threshold marker */}
            {maxMarkerPct != null && (
              <div style={{
                position: 'absolute',
                left: `${maxMarkerPct}%`,
                top: -2,
                bottom: -2,
                width: 2,
                background: 'var(--am)',
                borderRadius: 1,
                zIndex: 2,
              }} title={`Maximum: ${maxThreshold}`} />
            )}

            {/* Fill */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${fillPct}%`,
              background: statusColor,
              borderRadius: 99,
              transition: 'width 0.5s ease',
              zIndex: 1,
            }} />
          </div>

          {/* Bar legend */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 5,
            fontSize: 9.5,
            color: 'var(--t3)',
          }}>
            <span>0</span>
            {hasMin && <span style={{ color: 'var(--gr)' }}>min {minThreshold}</span>}
            {hasMax && <span style={{ color: 'var(--am)' }}>max {maxThreshold}</span>}
          </div>
        </div>
      )}

      {/* ── Badge summary ────────────────────────────────────────────── */}
      {badgeText && (
        <div style={{
          display: 'inline-flex',
          alignSelf: 'flex-start',
          alignItems: 'center',
          gap: 6,
          padding: '5px 12px',
          background: statusBg,
          border: `1px solid ${statusBorder}`,
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 700,
          color: statusColor,
        }}>
          {isTooShort ? '↑' : isTooLong ? '↓' : '✓'} {badgeText}
        </div>
      )}

      {/* ── Why this was triggered ───────────────────────────────────── */}
      {expectedDesc && (
        <div style={{
          padding: '9px 12px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--b)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 7,
        }}>
          <span style={{ fontSize: 12, color: 'var(--gr)', flexShrink: 0, marginTop: 1 }}>✓</span>
          <span style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--t2)' }}>Target: </strong>{expectedDesc}
          </span>
        </div>
      )}

      {/* ── Related page context (for recommendation engine) ─────────── */}
      {relatedContent && (relatedContent.pageTitle || relatedContent.h1Text) && (
        <div style={{
          borderTop: '1px solid var(--b)',
          paddingTop: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{
            fontSize: 9,
            fontWeight: 700,
            color: 'var(--t3)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 2,
          }}>
            Page Context
          </div>

          {relatedContent.pageTitle && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{
                fontSize: 9.5,
                fontWeight: 700,
                color: 'var(--t3)',
                background: 'var(--s2)',
                border: '1px solid var(--b)',
                borderRadius: 4,
                padding: '1px 6px',
                flexShrink: 0,
                marginTop: 1,
              }}>
                TITLE
              </span>
              <span style={{
                fontSize: 11.5,
                color: 'var(--t2)',
                lineHeight: 1.45,
                fontFamily: 'DM Mono, monospace',
                wordBreak: 'break-word',
              }}>
                {relatedContent.pageTitle}
              </span>
            </div>
          )}

          {relatedContent.h1Text && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{
                fontSize: 9.5,
                fontWeight: 700,
                color: 'var(--cy)',
                background: 'var(--color-brand-cyan-surface)',
                border: '1px solid var(--color-brand-cyan-border)',
                borderRadius: 4,
                padding: '1px 6px',
                flexShrink: 0,
                marginTop: 1,
              }}>
                H1
              </span>
              <span style={{
                fontSize: 11.5,
                color: 'var(--t2)',
                lineHeight: 1.45,
                fontFamily: 'DM Mono, monospace',
                wordBreak: 'break-word',
              }}>
                {relatedContent.h1Text}
              </span>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
