"use client"

import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { Cpu, ChevronDown, ArrowLeftRight, Loader2 } from 'lucide-react'
import { useProject } from '@/contexts/ProjectContext'
import { useAllAuditHistory, useAuditComparison } from '@/hooks/useDashboardQueries'
import DeltaBadge from '@/components/dashboard/overview/DeltaBadge'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function roundVal(n) {
  if (n == null) return null
  return Math.round(Number(n) * 10) / 10
}

function formatVal(n, decimals = 1) {
  if (n == null) return '—'
  const r = Math.round(Number(n) * Math.pow(10, decimals)) / Math.pow(10, decimals)
  return Number.isInteger(r) ? String(r) : r.toFixed(decimals)
}

function formatDuration(ms) {
  if (ms == null) return '—'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`
}

function dirColor(direction, isLowerBetter = false) {
  if (!direction || direction === 'unchanged') return 'var(--t2)'
  const good = isLowerBetter ? 'declined' : 'improved'
  return direction === good ? '#00f5a0' : '#ff6080'
}

function dirBg(direction, isLowerBetter = false) {
  if (!direction || direction === 'unchanged') return 'transparent'
  const good = isLowerBetter ? 'declined' : 'improved'
  return direction === good
    ? 'rgba(0,245,160,0.05)'
    : 'rgba(255,96,128,0.05)'
}

function dirBorder(direction, isLowerBetter = false) {
  if (!direction || direction === 'unchanged') return 'transparent'
  const good = isLowerBetter ? 'declined' : 'improved'
  return direction === good
    ? 'rgba(0,245,160,0.35)'
    : 'rgba(255,96,128,0.35)'
}

// ── Dropdown ──────────────────────────────────────────────────────────────────

function AuditSelect({ label, value, onChange, runs, excludeNum }) {
  return (
    <div style={{ flex: 1, minWidth: 200 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: 'var(--t3)',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%',
            appearance: 'none',
            WebkitAppearance: 'none',
            background: 'var(--s2)',
            border: `1px solid ${value ? 'rgba(168,85,247,0.35)' : 'var(--b)'}`,
            borderRadius: 10,
            padding: '11px 40px 11px 14px',
            fontSize: 13, fontWeight: 600, color: 'var(--t)',
            cursor: 'pointer', outline: 'none',
            transition: 'border-color 0.15s',
          }}
        >
          <option value="">Select audit…</option>
          {runs.map(run => (
            <option
              key={run._id}
              value={run.auditNumber}
              disabled={String(run.auditNumber) === String(excludeNum)}
            >
              Audit #{run.auditNumber} — {formatDate(run.completedAt)}
              {run.websiteScore != null ? `  ·  Score ${formatVal(run.websiteScore)}` : ''}
            </option>
          ))}
        </select>
        <ChevronDown size={14} style={{
          position: 'absolute', right: 13, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none',
        }} />
      </div>
    </div>
  )
}

// ── Comparison metric row ─────────────────────────────────────────────────────

function MetricRow({ label, delta, isLowerBetter = false, fromDisplay, toDisplay, unit = '', extra }) {
  const hasData = delta?.change != null
  const isGood = hasData
    ? (isLowerBetter ? delta.direction === 'declined' : delta.direction === 'improved')
    : null
  const isUnchanged = !hasData || delta.direction === 'unchanged'

  const absChange = hasData ? Math.abs(roundVal(delta.change)) : null
  const sign      = hasData && delta.change > 0 ? '+' : hasData && delta.change < 0 ? '−' : ''
  const pct       = delta?.percentage != null ? Math.abs(roundVal(delta.percentage)) : null
  const pctSign   = delta?.percentage != null && delta.percentage > 0 ? '+' : delta?.percentage < 0 ? '−' : ''

  const rowColor   = isUnchanged ? 'transparent' : dirBg(delta.direction, isLowerBetter)
  const leftBorder = isUnchanged ? '3px solid transparent' : `3px solid ${dirBorder(delta.direction, isLowerBetter)}`
  const valColor   = isUnchanged ? 'var(--t)' : dirColor(delta.direction, isLowerBetter)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '180px 1fr 28px 1fr 160px 80px',
      alignItems: 'center', gap: 12,
      padding: '13px 20px 13px 17px',
      borderLeft: leftBorder,
      background: rowColor,
      borderBottom: '1px solid var(--b)',
      transition: 'background 0.12s',
    }}>
      {/* Metric name */}
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>{label}</div>

      {/* From value */}
      <div style={{
        fontFamily: 'var(--font-metric)', fontSize: 16, fontWeight: 700, color: 'var(--t3)',
        textAlign: 'right',
      }}>
        {fromDisplay}
        {unit && <span style={{ fontSize: 10, marginLeft: 3, color: 'var(--t3)' }}>{unit}</span>}
      </div>

      {/* Arrow */}
      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--t3)' }}>→</div>

      {/* To value */}
      <div style={{
        fontFamily: 'var(--font-metric)', fontSize: 18, fontWeight: 800,
        color: valColor,
      }}>
        {toDisplay}
        {unit && <span style={{ fontSize: 10, marginLeft: 3, color: valColor, opacity: 0.7 }}>{unit}</span>}
        {extra && <div style={{ fontSize: 9.5, color: 'var(--t3)', fontFamily: 'inherit', fontWeight: 500, marginTop: 1 }}>{extra}</div>}
      </div>

      {/* Change */}
      <div>
        {isUnchanged ? (
          <span style={{
            fontSize: 10.5, fontWeight: 600, color: 'var(--t3)',
            background: 'rgba(132,148,176,0.10)', borderRadius: 20, padding: '3px 9px',
          }}>
            → No change
          </span>
        ) : (
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: dirColor(delta.direction, isLowerBetter),
            background: dirBg(delta.direction, isLowerBetter),
            border: `1px solid ${dirBorder(delta.direction, isLowerBetter)}`,
            borderRadius: 20, padding: '3px 9px',
            display: 'inline-block',
          }}>
            {isLowerBetter
              ? (delta.direction === 'declined' ? '↓' : '↑')
              : (delta.direction === 'improved' ? '↑' : '↓')
            } {sign}{absChange}{unit ? ` ${unit}` : ''}
          </span>
        )}
      </div>

      {/* Percentage */}
      <div style={{
        fontSize: 11, fontWeight: 600,
        color: isUnchanged ? 'var(--t3)' : dirColor(delta.direction, isLowerBetter),
        textAlign: 'right',
      }}>
        {pct != null && !isUnchanged ? `${pctSign}${pct}%` : '—'}
      </div>
    </div>
  )
}

// ── Highlight cards ───────────────────────────────────────────────────────────

function HighlightCard({ title, value, sub, color, bg, border }) {
  return (
    <div style={{
      flex: 1, minWidth: 160,
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 14, padding: '18px 20px',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{
        fontFamily: 'var(--font-metric)', fontSize: 28, fontWeight: 900,
        color, lineHeight: 1, marginBottom: 4, letterSpacing: '-0.02em',
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--t3)' }}>{sub}</div>
    </div>
  )
}

// ── Comparison result ─────────────────────────────────────────────────────────

function ComparisonResult({ comparison, fromRun, toRun }) {
  const { delta, current, previous } = comparison

  // Duration delta (not in delta object — compute manually)
  const durationDelta = useMemo(() => {
    if (current?.auditDurationMs == null || previous?.auditDurationMs == null) return null
    const change = current.auditDurationMs - previous.auditDurationMs
    return {
      change,
      direction: change < 0 ? 'improved' : change > 0 ? 'declined' : 'unchanged',
      percentage: previous.auditDurationMs > 0
        ? Math.round((change / previous.auditDurationMs) * 10000) / 100
        : null,
    }
  }, [current, previous])

  // Highlight cards: find top meaningful changes
  const highlights = useMemo(() => {
    const cards = []

    if (delta.websiteScore?.change != null && delta.websiteScore.direction !== 'unchanged') {
      const improved = delta.websiteScore.direction === 'improved'
      cards.push({
        title: 'Website Score',
        value: `${delta.websiteScore.change > 0 ? '+' : ''}${formatVal(delta.websiteScore.change)} pts`,
        sub: delta.websiteScore.percentage != null
          ? `${delta.websiteScore.percentage > 0 ? '+' : ''}${formatVal(delta.websiteScore.percentage)}% change`
          : 'pts change',
        color: improved ? '#00f5a0' : '#ff6080',
        bg:    improved ? 'rgba(0,245,160,0.06)' : 'rgba(255,96,128,0.06)',
        border: improved ? 'rgba(0,245,160,0.25)' : 'rgba(255,96,128,0.25)',
      })
    }

    if (delta.totalIssues?.change != null && delta.totalIssues.direction !== 'unchanged') {
      const improved = delta.totalIssues.direction === 'improved'
      const abs = Math.abs(delta.totalIssues.change)
      cards.push({
        title: 'Total Issues',
        value: improved ? `−${abs}` : `+${abs}`,
        sub: improved ? `${abs} issues eliminated` : `${abs} new issues`,
        color: improved ? '#00f5a0' : '#ff6080',
        bg:    improved ? 'rgba(0,245,160,0.06)' : 'rgba(255,96,128,0.06)',
        border: improved ? 'rgba(0,245,160,0.25)' : 'rgba(255,96,128,0.25)',
      })
    }

    if (delta.criticalIssues?.change != null && delta.criticalIssues.direction !== 'unchanged') {
      const improved = delta.criticalIssues.direction === 'improved'
      const abs = Math.abs(delta.criticalIssues.change)
      cards.push({
        title: 'Critical Issues',
        value: improved ? `−${abs}` : `+${abs}`,
        sub: improved ? `${abs} critical removed` : `${abs} new critical`,
        color: improved ? '#00f5a0' : '#ff6080',
        bg:    improved ? 'rgba(0,245,160,0.06)' : 'rgba(255,96,128,0.06)',
        border: improved ? 'rgba(0,245,160,0.25)' : 'rgba(255,96,128,0.25)',
      })
    }

    if (delta.aiVisibilityScore?.change != null && delta.aiVisibilityScore.direction !== 'unchanged' && delta.aiVisibilityScore.change !== 0) {
      const improved = delta.aiVisibilityScore.direction === 'improved'
      cards.push({
        title: 'AI Visibility',
        value: `${delta.aiVisibilityScore.change > 0 ? '+' : ''}${formatVal(delta.aiVisibilityScore.change)} pts`,
        sub: 'visibility score change',
        color: improved ? '#00e5ff' : '#ff6080',
        bg:    improved ? 'rgba(0,229,255,0.06)' : 'rgba(255,96,128,0.06)',
        border: improved ? 'rgba(0,229,255,0.25)' : 'rgba(255,96,128,0.25)',
      })
    }

    if (delta.performanceScore?.change != null && delta.performanceScore.direction !== 'unchanged') {
      const improved = delta.performanceScore.direction === 'improved'
      cards.push({
        title: 'Performance',
        value: `${delta.performanceScore.change > 0 ? '+' : ''}${formatVal(delta.performanceScore.change)} pts`,
        sub: 'performance score change',
        color: improved ? '#00f5a0' : '#ff6080',
        bg:    improved ? 'rgba(0,245,160,0.06)' : 'rgba(255,96,128,0.06)',
        border: improved ? 'rgba(0,245,160,0.25)' : 'rgba(255,96,128,0.25)',
      })
    }

    if (delta.technicalHealthScore?.change != null && delta.technicalHealthScore.direction !== 'unchanged') {
      const improved = delta.technicalHealthScore.direction === 'improved'
      cards.push({
        title: 'Tech Health',
        value: `${delta.technicalHealthScore.change > 0 ? '+' : ''}${formatVal(delta.technicalHealthScore.change)} pts`,
        sub: 'technical health change',
        color: improved ? '#ff9640' : '#ff6080',
        bg:    improved ? 'rgba(255,150,64,0.06)' : 'rgba(255,96,128,0.06)',
        border: improved ? 'rgba(255,150,64,0.25)' : 'rgba(255,96,128,0.25)',
      })
    }

    if (delta.aiVisibilityIssueCount?.change != null && delta.aiVisibilityIssueCount.direction !== 'unchanged') {
      const improved = delta.aiVisibilityIssueCount.direction === 'improved'
      const abs = Math.abs(delta.aiVisibilityIssueCount.change)
      cards.push({
        title: 'AI Issues',
        value: improved ? `−${abs}` : `+${abs}`,
        sub: improved ? `${abs} AI issues resolved` : `${abs} new AI issues`,
        color: improved ? '#00f5a0' : '#ff6080',
        bg:    improved ? 'rgba(0,245,160,0.06)' : 'rgba(255,96,128,0.06)',
        border: improved ? 'rgba(0,245,160,0.25)' : 'rgba(255,96,128,0.25)',
      })
    }

    return cards.slice(0, 6)
  }, [delta])

  const fromLabel = `Audit #${previous?.auditNumber ?? '?'}`
  const toLabel   = `Audit #${current?.auditNumber ?? '?'}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Comparison header */}
      <div style={{
        background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 16,
        overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
      }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, #7730ed, #00e5ff)' }} />
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 60px 1fr',
          padding: '22px 28px', alignItems: 'center', gap: 12,
        }}>
          {/* From audit */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Baseline
            </div>
            <div style={{ fontFamily: 'var(--font-metric)', fontSize: 22, fontWeight: 900, color: '#b580ff', marginBottom: 4 }}>
              {fromLabel}
            </div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 8 }}>{formatDate(previous?.completedAt)}</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {previous?.websiteScore != null && (
                <span style={{ fontSize: 11, color: 'var(--t2)' }}>
                  Score <strong style={{ fontFamily: 'var(--font-metric)' }}>{formatVal(previous.websiteScore)}</strong>
                </span>
              )}
              {previous?.performanceScore != null && (
                <span style={{ fontSize: 11, color: '#00f5a0' }}>
                  Perf <strong style={{ fontFamily: 'var(--font-metric)' }}>{formatVal(previous.performanceScore)}</strong>
                </span>
              )}
              {previous?.technicalHealthScore != null && (
                <span style={{ fontSize: 11, color: '#ff9640' }}>
                  Tech <strong style={{ fontFamily: 'var(--font-metric)' }}>{formatVal(previous.technicalHealthScore)}</strong>
                </span>
              )}
              {previous?.totalIssues != null && (
                <span style={{ fontSize: 11, color: 'var(--t2)' }}>
                  Issues <strong style={{ fontFamily: 'var(--font-metric)' }}>{previous.totalIssues}</strong>
                </span>
              )}
              {previous?.aiVisibilityCriticalIssueCount != null && (
                <span style={{ fontSize: 11, color: '#ff6090' }}>
                  AI High <strong style={{ fontFamily: 'var(--font-metric)' }}>{previous.aiVisibilityCriticalIssueCount}</strong>
                </span>
              )}
            </div>
          </div>

          {/* VS divider */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--s2)', border: '1px solid var(--b)',
              fontSize: 10, fontWeight: 800, color: 'var(--t3)', letterSpacing: '0.05em',
            }}>
              VS
            </div>
          </div>

          {/* To audit */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Compared To
            </div>
            <div style={{ fontFamily: 'var(--font-metric)', fontSize: 22, fontWeight: 900, color: '#00e5ff', marginBottom: 4 }}>
              {toLabel}
            </div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 8 }}>{formatDate(current?.completedAt)}</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {current?.websiteScore != null && (
                <span style={{ fontSize: 11, color: 'var(--t2)' }}>
                  Score <strong style={{ fontFamily: 'var(--font-metric)' }}>{formatVal(current.websiteScore)}</strong>
                </span>
              )}
              {current?.performanceScore != null && (
                <span style={{ fontSize: 11, color: '#00f5a0' }}>
                  Perf <strong style={{ fontFamily: 'var(--font-metric)' }}>{formatVal(current.performanceScore)}</strong>
                </span>
              )}
              {current?.technicalHealthScore != null && (
                <span style={{ fontSize: 11, color: '#ff9640' }}>
                  Tech <strong style={{ fontFamily: 'var(--font-metric)' }}>{formatVal(current.technicalHealthScore)}</strong>
                </span>
              )}
              {current?.totalIssues != null && (
                <span style={{ fontSize: 11, color: 'var(--t2)' }}>
                  Issues <strong style={{ fontFamily: 'var(--font-metric)' }}>{current.totalIssues}</strong>
                </span>
              )}
              {current?.aiVisibilityCriticalIssueCount != null && (
                <span style={{ fontSize: 11, color: '#ff6090' }}>
                  AI High <strong style={{ fontFamily: 'var(--font-metric)' }}>{current.aiVisibilityCriticalIssueCount}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Highlight cards */}
      {highlights.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {highlights.map((h, i) => (
            <HighlightCard key={i} {...h} />
          ))}
        </div>
      )}

      {/* Detailed metric table */}
      <div style={{
        background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 16,
        overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '180px 1fr 28px 1fr 160px 80px',
          gap: 12, padding: '10px 20px 10px 20px',
          background: 'var(--s2)', borderBottom: '1px solid var(--b)',
        }}>
          {['Metric', fromLabel, '', toLabel, 'Change', '%'].map((h, i) => (
            <div key={i} style={{
              fontSize: 9.5, fontWeight: 700, color: i === 1 ? '#b580ff' : i === 3 ? '#00e5ff' : 'var(--t3)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              textAlign: i >= 4 ? 'left' : i === 1 ? 'right' : 'left',
            }}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        <MetricRow
          label="Website Score"
          delta={delta.websiteScore}
          fromDisplay={formatVal(delta.websiteScore?.previous)}
          toDisplay={formatVal(delta.websiteScore?.current)}
          unit="pts"
          isLowerBetter={false}
        />
        <MetricRow
          label="AI Visibility"
          delta={delta.aiVisibilityScore}
          fromDisplay={delta.aiVisibilityScore?.previous != null ? formatVal(delta.aiVisibilityScore.previous) : 'N/A'}
          toDisplay={delta.aiVisibilityScore?.current != null ? formatVal(delta.aiVisibilityScore.current) : 'N/A'}
          unit="pts"
          isLowerBetter={false}
        />
        <MetricRow
          label="Performance Score"
          delta={delta.performanceScore}
          fromDisplay={delta.performanceScore?.previous != null ? formatVal(delta.performanceScore.previous) : 'N/A'}
          toDisplay={delta.performanceScore?.current != null ? formatVal(delta.performanceScore.current) : 'N/A'}
          unit="pts"
          isLowerBetter={false}
        />
        <MetricRow
          label="Technical Health"
          delta={delta.technicalHealthScore}
          fromDisplay={delta.technicalHealthScore?.previous != null ? formatVal(delta.technicalHealthScore.previous) : 'N/A'}
          toDisplay={delta.technicalHealthScore?.current != null ? formatVal(delta.technicalHealthScore.current) : 'N/A'}
          unit="pts"
          isLowerBetter={false}
        />
        <MetricRow
          label="Total Issues"
          delta={delta.totalIssues}
          fromDisplay={formatVal(delta.totalIssues?.previous, 0)}
          toDisplay={formatVal(delta.totalIssues?.current, 0)}
          isLowerBetter
        />
        <MetricRow
          label="Critical Issues"
          delta={delta.criticalIssues}
          fromDisplay={formatVal(delta.criticalIssues?.previous, 0)}
          toDisplay={formatVal(delta.criticalIssues?.current, 0)}
          isLowerBetter
        />
        <MetricRow
          label="AI Visibility Issues"
          delta={delta.aiVisibilityIssueCount}
          fromDisplay={formatVal(delta.aiVisibilityIssueCount?.previous, 0)}
          toDisplay={formatVal(delta.aiVisibilityIssueCount?.current, 0)}
          isLowerBetter
        />
        <MetricRow
          label="AI High Issues"
          delta={delta.aiVisibilityCriticalIssueCount}
          fromDisplay={formatVal(delta.aiVisibilityCriticalIssueCount?.previous, 0)}
          toDisplay={formatVal(delta.aiVisibilityCriticalIssueCount?.current, 0)}
          isLowerBetter
        />
        <MetricRow
          label="Pages Analyzed"
          delta={delta.pagesAnalyzed}
          fromDisplay={formatVal(delta.pagesAnalyzed?.previous, 0)}
          toDisplay={formatVal(delta.pagesAnalyzed?.current, 0)}
          isLowerBetter={false}
        />
        {/* Audit Duration — computed manually */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '180px 1fr 28px 1fr 160px 80px',
          alignItems: 'center', gap: 12,
          padding: '13px 20px 13px 17px',
          borderLeft: durationDelta
            ? `3px solid ${dirBorder(durationDelta.direction, true)}`
            : '3px solid transparent',
          background: durationDelta ? dirBg(durationDelta.direction, true) : 'transparent',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>Audit Duration</div>
          <div style={{ fontFamily: 'var(--font-metric)', fontSize: 16, fontWeight: 700, color: 'var(--t3)', textAlign: 'right' }}>
            {formatDuration(previous?.auditDurationMs)}
          </div>
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--t3)' }}>→</div>
          <div style={{
            fontFamily: 'var(--font-metric)', fontSize: 18, fontWeight: 800,
            color: durationDelta ? dirColor(durationDelta.direction, true) : 'var(--t)',
          }}>
            {formatDuration(current?.auditDurationMs)}
          </div>
          <div>
            {durationDelta && durationDelta.direction !== 'unchanged' ? (
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: dirColor(durationDelta.direction, true),
                background: dirBg(durationDelta.direction, true),
                border: `1px solid ${dirBorder(durationDelta.direction, true)}`,
                borderRadius: 20, padding: '3px 9px',
              }}>
                {durationDelta.direction === 'improved' ? '↓' : '↑'} {formatDuration(Math.abs(durationDelta.change))} {durationDelta.direction === 'improved' ? 'faster' : 'slower'}
              </span>
            ) : (
              <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--t3)', background: 'rgba(132,148,176,0.10)', borderRadius: 20, padding: '3px 9px' }}>
                → No change
              </span>
            )}
          </div>
          <div style={{
            fontSize: 11, fontWeight: 600, textAlign: 'right',
            color: durationDelta && durationDelta.direction !== 'unchanged'
              ? dirColor(durationDelta.direction, true) : 'var(--t3)',
          }}>
            {durationDelta?.percentage != null && durationDelta.direction !== 'unchanged'
              ? `${durationDelta.percentage > 0 ? '+' : ''}${formatVal(durationDelta.percentage)}%`
              : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ totalRuns }) {
  if (totalRuns === 0) {
    return (
      <div style={{
        background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 20,
        padding: '64px 28px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t2)', marginBottom: 8 }}>No audits yet</div>
        <div style={{ fontSize: 13, color: 'var(--t3)' }}>Complete your first audit to start comparing results.</div>
      </div>
    )
  }
  return (
    <div style={{
      background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 20,
      padding: '64px 28px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔄</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t2)', marginBottom: 8 }}>Only one audit found</div>
      <div style={{ fontSize: 13, color: 'var(--t3)' }}>Run a second audit to unlock comparison.</div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AuditComparisonPage() {
  const { activeProject } = useProject()
  const projectId = activeProject?._id

  const { data: historyRes, isLoading: historyLoading } = useAllAuditHistory(projectId)

  const runs        = historyRes?.data ?? []
  const orderedRuns = useMemo(() => [...runs].reverse(), [runs])  // oldest → newest

  // Default from = oldest, to = latest
  const defaultFrom = orderedRuns[0]?.auditNumber ?? ''
  const defaultTo   = orderedRuns[orderedRuns.length - 1]?.auditNumber ?? ''

  const [fromAudit, setFromAudit] = useState('')
  const [toAudit,   setToAudit]   = useState('')
  const [triggered, setTriggered] = useState(false)

  // Set defaults once runs load
  useEffect(() => {
    if (orderedRuns.length >= 2 && !fromAudit && !toAudit) {
      setFromAudit(String(orderedRuns[0].auditNumber))
      setToAudit(String(orderedRuns[orderedRuns.length - 1].auditNumber))
    }
  }, [orderedRuns.length])  // eslint-disable-line

  const handleFromChange = useCallback((val) => {
    setFromAudit(val)
    setTriggered(false)
  }, [])

  const handleToChange = useCallback((val) => {
    setToAudit(val)
    setTriggered(false)
  }, [])

  const handleSwap = useCallback(() => {
    setFromAudit(toAudit)
    setToAudit(fromAudit)
    setTriggered(false)
  }, [fromAudit, toAudit])

  const fromNum = Number(fromAudit)
  const toNum   = Number(toAudit)
  const isSame     = fromAudit && toAudit && fromNum === toNum
  const isBackward = fromAudit && toAudit && fromNum > toNum
  const canCompare = fromAudit && toAudit && !isSame && !isBackward

  const { data: compareRes, isLoading: compareLoading } = useAuditComparison(
    projectId, fromAudit, toAudit, { enabled: triggered && !!canCompare }
  )

  const comparison  = compareRes?.data
  const fromRun     = orderedRuns.find(r => String(r.auditNumber) === String(fromAudit))
  const toRun       = orderedRuns.find(r => String(r.auditNumber) === String(toAudit))

  useEffect(() => { document.title = 'Audit Comparison | Odito' }, [])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 8px 48px' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(119,48,237,0.12), rgba(0,229,255,0.12))',
          border: '1px solid rgba(119,48,237,0.2)',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <Cpu size={20} style={{ color: '#b580ff' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-metric)', fontSize: 24, fontWeight: 800, color: 'var(--t)', lineHeight: 1.1 }}>
            Audit Comparison
          </h1>
          <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>
            Select any two audits to see exactly what changed between them.
          </p>
        </div>
      </div>

      {/* Guard: not enough audits */}
      {!historyLoading && orderedRuns.length < 2 && (
        <EmptyState totalRuns={orderedRuns.length} />
      )}

      {/* Loading */}
      {historyLoading && (
        <div style={{
          background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 16,
          padding: '48px', textAlign: 'center',
        }}>
          <Loader2 size={28} style={{ color: 'var(--t3)', animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* Comparison Studio */}
      {!historyLoading && orderedRuns.length >= 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Selector card */}
          <div style={{
            background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 16,
            padding: '24px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.11em', marginBottom: 20 }}>
              Select Audits to Compare
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
              <AuditSelect
                label="Compare From (Baseline)"
                value={fromAudit}
                onChange={handleFromChange}
                runs={orderedRuns}
                excludeNum={toAudit}
              />

              {/* Swap button */}
              <button
                onClick={handleSwap}
                disabled={!fromAudit || !toAudit}
                title="Swap audits"
                style={{
                  flexShrink: 0, width: 40, height: 42, borderRadius: 10,
                  background: 'var(--s2)', border: '1px solid var(--b)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: fromAudit && toAudit ? 'pointer' : 'not-allowed',
                  opacity: fromAudit && toAudit ? 1 : 0.4,
                  marginBottom: 1,
                }}
              >
                <ArrowLeftRight size={14} style={{ color: 'var(--t2)' }} />
              </button>

              <AuditSelect
                label="Compare To (Target)"
                value={toAudit}
                onChange={handleToChange}
                runs={orderedRuns}
                excludeNum={fromAudit}
              />

              {/* Compare button */}
              <button
                onClick={() => setTriggered(true)}
                disabled={!canCompare || compareLoading}
                style={{
                  flexShrink: 0, height: 42, padding: '0 24px',
                  borderRadius: 10, border: 'none',
                  background: canCompare && !compareLoading
                    ? 'linear-gradient(135deg, #7730ed, #00e5ff)'
                    : 'var(--s2)',
                  color: canCompare && !compareLoading ? '#fff' : 'var(--t3)',
                  fontSize: 13, fontWeight: 700, cursor: canCompare ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                  marginBottom: 1,
                  transition: 'opacity 0.15s',
                  opacity: canCompare ? 1 : 0.5,
                }}
              >
                {compareLoading
                  ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Comparing…</>
                  : <>Compare Audits →</>
                }
              </button>
            </div>

            {/* Inline validation */}
            {isSame && (
              <div style={{ marginTop: 10, fontSize: 11, color: '#f5c518' }}>
                ⚠ Select two different audits to compare.
              </div>
            )}
            {isBackward && (
              <div style={{ marginTop: 10, fontSize: 11, color: '#f5c518' }}>
                ⚠ "Compare From" should be the earlier audit. Use ⇄ to swap.
              </div>
            )}
          </div>

          {/* Comparison results */}
          {triggered && compareLoading && (
            <div style={{
              background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 16,
              padding: '48px', textAlign: 'center',
            }}>
              <Loader2 size={28} style={{ color: '#b580ff', animation: 'spin 1s linear infinite' }} />
              <div style={{ marginTop: 14, fontSize: 13, color: 'var(--t3)' }}>
                Comparing Audit #{fromAudit} → Audit #{toAudit}…
              </div>
            </div>
          )}

          {triggered && !compareLoading && comparison?.available && (
            <ComparisonResult
              comparison={comparison}
              fromRun={fromRun}
              toRun={toRun}
            />
          )}

          {triggered && !compareLoading && comparison && !comparison.available && (
            <div style={{
              background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 16,
              padding: '40px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, color: 'var(--t3)' }}>
                Comparison data unavailable for this audit pair.
              </div>
            </div>
          )}

          {/* Audit list (quick-compare shortcuts) */}
          <div style={{
            background: 'var(--s)', border: '1px solid var(--b)', borderRadius: 16,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid var(--b)',
              background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                Audit History — Quick Compare
              </div>
              <div style={{ fontSize: 10, color: 'var(--t3)' }}>
                {orderedRuns.length} audits
              </div>
            </div>

            {/* Header row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '56px 1fr 80px 80px 100px 120px',
              padding: '9px 20px', borderBottom: '1px solid var(--b)',
              gap: 12,
            }}>
              {['#', 'Date', 'Score', 'Issues', 'Change', ''].map(h => (
                <div key={h} style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {h}
                </div>
              ))}
            </div>

            {orderedRuns.map((run, i) => {
              const prev = orderedRuns[i - 1] ?? null
              const scoreDelta = prev?.websiteScore != null && run.websiteScore != null
                ? {
                    change:    run.websiteScore - prev.websiteScore,
                    direction: run.websiteScore > prev.websiteScore ? 'improved' : run.websiteScore < prev.websiteScore ? 'declined' : 'unchanged',
                    percentage: prev.websiteScore > 0
                      ? Math.round(((run.websiteScore - prev.websiteScore) / prev.websiteScore) * 10000) / 100
                      : null,
                  }
                : null
              const isLatest = i === orderedRuns.length - 1
              const isFrom   = String(run.auditNumber) === String(fromAudit)
              const isTo     = String(run.auditNumber) === String(toAudit)

              return (
                <div
                  key={run._id}
                  style={{
                    display: 'grid', gridTemplateColumns: '56px 1fr 80px 80px 100px 120px',
                    padding: '12px 20px', borderBottom: i < orderedRuns.length - 1 ? '1px solid var(--b)' : 'none',
                    alignItems: 'center', gap: 12,
                    background: isFrom || isTo ? 'rgba(119,48,237,0.04)' : 'transparent',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isFrom && !isTo) e.currentTarget.style.background = 'var(--s2)' }}
                  onMouseLeave={e => { if (!isFrom && !isTo) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 34, height: 34, borderRadius: 9,
                    background: isLatest ? 'rgba(119,48,237,0.12)' : 'var(--s2)',
                    border: `1px solid ${isLatest ? 'rgba(119,48,237,0.25)' : 'var(--b)'}`,
                    fontFamily: 'var(--font-metric)', fontSize: 12, fontWeight: 800,
                    color: isLatest ? '#b580ff' : 'var(--t2)',
                  }}>
                    {run.auditNumber}
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--t2)' }}>
                    {new Date(run.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {isLatest && <span style={{ marginLeft: 7, fontSize: 9, fontWeight: 700, color: '#b580ff', background: 'rgba(157,78,221,0.1)', border: '1px solid rgba(157,78,221,0.2)', borderRadius: 20, padding: '1px 6px' }}>LATEST</span>}
                    {i === 0 && orderedRuns.length > 1 && <span style={{ marginLeft: 7, fontSize: 9, fontWeight: 700, color: 'var(--t3)', background: 'var(--s2)', border: '1px solid var(--b)', borderRadius: 20, padding: '1px 6px' }}>FIRST</span>}
                    {isFrom && <span style={{ marginLeft: 7, fontSize: 9, fontWeight: 700, color: '#b580ff', background: 'rgba(181,128,255,0.1)', border: '1px solid rgba(181,128,255,0.25)', borderRadius: 20, padding: '1px 6px' }}>FROM</span>}
                    {isTo && <span style={{ marginLeft: 7, fontSize: 9, fontWeight: 700, color: '#00e5ff', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 20, padding: '1px 6px' }}>TO</span>}
                  </div>

                  <div style={{ fontFamily: 'var(--font-metric)', fontSize: 16, fontWeight: 800, color: 'var(--t)' }}>
                    {run.websiteScore != null ? formatVal(run.websiteScore) : '—'}
                  </div>

                  <div style={{ fontFamily: 'var(--font-metric)', fontSize: 14, fontWeight: 700, color: 'var(--t2)' }}>
                    {run.totalIssues ?? '—'}
                  </div>

                  <div>
                    {scoreDelta ? (
                      <DeltaBadge delta={scoreDelta} suffix="pts" />
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--t3)' }}>—</span>
                    )}
                  </div>

                  {/* Quick-compare button */}
                  <button
                    onClick={() => {
                      const latestNum = orderedRuns[orderedRuns.length - 1]?.auditNumber
                      if (!isLatest) {
                        setFromAudit(String(run.auditNumber))
                        setToAudit(String(latestNum))
                      } else if (i > 0) {
                        setFromAudit(String(orderedRuns[0].auditNumber))
                        setToAudit(String(run.auditNumber))
                      }
                      setTriggered(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    style={{
                      fontSize: 11, fontWeight: 600,
                      padding: '5px 12px', borderRadius: 8,
                      background: 'var(--s2)', border: '1px solid var(--b)',
                      color: 'var(--t2)', cursor: 'pointer',
                      transition: 'border-color 0.12s, color 0.12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#b580ff'; e.currentTarget.style.color = '#b580ff' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b)'; e.currentTarget.style.color = 'var(--t2)' }}
                  >
                    {isLatest ? '← vs First' : 'vs Latest →'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
