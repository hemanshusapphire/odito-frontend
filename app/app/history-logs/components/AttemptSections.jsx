"use client"

import { useState } from 'react'
import { AttemptStatusBadge, originLabel } from '../statusMeta'
import { renderTypedValue, renderAfterValue, renderGenericValue } from './snapshotRenderers'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function SectionLabel({ children, hint }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
      {children}
      {hint && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', color: 'var(--t3)' }}> · {hint}</span>}
    </div>
  )
}

function CardShell({ children, tone = 'neutral' }) {
  const toneStyles = {
    neutral: { border: 'var(--color-border-default)', bg: 'var(--color-surface)' },
    success: { border: 'var(--color-status-success-border)', bg: 'var(--color-status-success-surface)' },
    error:   { border: 'var(--color-status-error-border)',   bg: 'var(--color-status-error-surface)' },
    warning: { border: 'var(--color-status-warning-border)', bg: 'var(--color-status-warning-surface)' },
  }
  const t = toneStyles[tone] || toneStyles.neutral
  return (
    <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 12, padding: '14px 16px' }}>
      {children}
    </div>
  )
}

function ExpandableText({ text, maxChars = 260 }) {
  const [expanded, setExpanded] = useState(false)
  if (!text) return null
  const isLong = text.length > maxChars
  const shown = expanded || !isLong ? text : text.slice(0, maxChars) + '…'
  return (
    <div>
      <div style={{
        fontSize: 13, color: 'var(--t)', lineHeight: 1.55,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        maxHeight: expanded ? 320 : undefined,
        overflowY: expanded ? 'auto' : undefined,
      }}>
        &ldquo;{shown}&rdquo;
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: 'var(--cy)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}

function MissingValue({ children = 'Missing' }) {
  return <div style={{ fontSize: 13, color: 'var(--t3)', fontStyle: 'italic' }}>{children}</div>
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  if (!text) return null
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          // Clipboard access can fail (permissions, insecure context) — non-critical, silently no-op.
        }
      }}
      aria-label="Copy value"
      style={{
        fontSize: 10, fontWeight: 600, color: copied ? 'var(--color-status-success)' : 'var(--t3)',
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

function GenericValueCard({ generic }) {
  if (!generic || generic.isEmpty) return <CardShell><MissingValue /></CardShell>
  if (generic.text) return <CardShell><ExpandableText text={generic.text} /></CardShell>
  if (generic.entries && generic.entries.length) {
    return (
      <CardShell>
        <div style={{ display: 'grid', gap: 6 }}>
          {generic.entries.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 8, fontSize: 12 }}>
              <span style={{ color: 'var(--t3)', minWidth: 100, flexShrink: 0 }}>{k}</span>
              <span style={{ color: 'var(--t)', wordBreak: 'break-word' }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
            </div>
          ))}
        </div>
      </CardShell>
    )
  }
  return <CardShell><MissingValue /></CardShell>
}

// ── BEFORE ───────────────────────────────────────────────────────────────

export function BeforeStateCard({ before }) {
  if (!before || before.source === 'unavailable') {
    return <CardShell><MissingValue>Before state not available for this issue.</MissingValue></CardShell>
  }

  if (before.source === 'diagnostic_string') {
    const text = String(before.value)
    return (
      <CardShell>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>Detected State</span>
          <CopyButton text={text} />
        </div>
        <div style={{ marginTop: 6 }}><ExpandableText text={text} /></div>
        <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 8 }}>
          Diagnostic value — exact prior content wasn&apos;t captured for this issue type.
        </div>
      </CardShell>
    )
  }

  const rendered = renderTypedValue(before.value)
  if (!rendered) return <GenericValueCard generic={renderGenericValue(before.value)} />

  return (
    <CardShell>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>{rendered.label}</span>
        {rendered.text && <CopyButton text={rendered.text} />}
      </div>
      <div style={{ marginTop: 6 }}>
        {rendered.text ? <ExpandableText text={rendered.text} /> : <MissingValue />}
      </div>
      {rendered.meta && <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 8 }}>{rendered.meta}</div>}
    </CardShell>
  )
}

// ── FIX APPLIED ──────────────────────────────────────────────────────────

export function FixAppliedCard({ attempt }) {
  if (attempt.attemptKind === 'reverify_only') {
    return (
      <CardShell>
        <div style={{ fontSize: 13, color: 'var(--t2)' }}>
          Re-verification only — no new fix was applied in this attempt.
        </div>
      </CardShell>
    )
  }

  const fixApplied = attempt.fixApplied
  const snapshot = fixApplied?.snapshot
  const newValueText = snapshot?.contentRewrite?.optimized || snapshot?.recommendedVersion || null
  const actionLabel = snapshot?.recommendedFix || (snapshot ? 'Fix applied' : 'Marked as implemented')

  return (
    <CardShell>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)', marginBottom: newValueText ? 10 : 4 }}>
        {actionLabel}
      </div>

      {newValueText && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 4 }}>New value</div>
          <ExpandableText text={newValueText} />
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 18px', fontSize: 11, color: 'var(--t3)', marginTop: 6 }}>
        <span>Source: <strong style={{ color: 'var(--t2)', fontWeight: 600 }}>{originLabel(attempt.origin)}</strong></span>
        <span>Implemented: <strong style={{ color: 'var(--t2)', fontWeight: 600 }}>{formatDate(attempt.implementedAt)}</strong></span>
      </div>
    </CardShell>
  )
}

// ── AFTER ────────────────────────────────────────────────────────────────

export function AfterStateCard({ attempt }) {
  const verification = attempt.verification || {}
  const contextSrc = attempt.before?.value?.type === 'image_alt'
    ? (attempt.before.value.src || attempt.before.value.imageUrl)
    : null

  if (!verification.verifiedAt || verification.result == null) {
    return (
      <CardShell tone="warning">
        <div style={{ fontSize: 13, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>○</span> Verification pending — this fix hasn&apos;t been re-checked yet.
        </div>
      </CardShell>
    )
  }

  const isVerified = verification.result === 'verified_fixed'
  const tone = isVerified ? 'success' : 'error'

  if (verification.method === 'value_diff') {
    const rendered = renderAfterValue(verification.after?.value, { contextSrc })
    return (
      <CardShell tone={tone}>
        {rendered && rendered.text ? (
          <>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>{rendered.label}</span>
            <div style={{ marginTop: 6 }}><ExpandableText text={rendered.text} /></div>
          </>
        ) : (
          <MissingValue>{isVerified ? 'No value found — issue considered resolved.' : 'Missing'}</MissingValue>
        )}
        <div style={{
          fontSize: 11, fontWeight: 600, marginTop: 10, display: 'flex', alignItems: 'center', gap: 6,
          color: isVerified ? 'var(--color-status-success)' : 'var(--color-status-error)',
        }}>
          {verification.matched === false && isVerified
            ? <>⚠ Verified by presence, but the value comparison didn&apos;t match the applied fix</>
            : isVerified
              ? <>✓ Found during verification</>
              : <>⚠ Still detected during verification</>}
        </div>
      </CardShell>
    )
  }

  // presence_fallback — no exact value captured, only whether the issue is still detected
  return (
    <CardShell tone={tone}>
      <div style={{
        fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
        color: isVerified ? 'var(--color-status-success)' : 'var(--color-status-error)',
      }}>
        {isVerified ? '✓ Issue no longer detected during verification' : '⚠ Issue still detected during verification'}
      </div>
      <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 8 }}>
        Presence check only — exact after-value wasn&apos;t captured for this issue type.
      </div>
    </CardShell>
  )
}

// ── VERIFICATION RESULT ──────────────────────────────────────────────────

export function VerificationResultBlock({ attempt }) {
  const verification = attempt.verification || {}
  const methodLabel = verification.method === 'value_diff'
    ? 'Value comparison'
    : verification.method === 'presence_fallback'
      ? 'Presence verification'
      : verification.method === 'ai_visibility_issue_lifecycle'
        ? 'AI visibility check'
        : null

  if (!verification.verifiedAt || verification.result == null) {
    return (
      <div>
        <AttemptStatusBadge status="pending_verification" />
        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 8 }}>
          Fix applied on {formatDate(attempt.implementedAt)} — awaiting the next verification scan.
        </div>
      </div>
    )
  }

  return (
    <div>
      <AttemptStatusBadge status={verification.result} />
      <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 8 }}>
        Verified on {formatDate(verification.verifiedAt)}
        {methodLabel && <> · Method: {methodLabel}</>}
      </div>
      {verification.result === 'reopened' && (
        <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 8, lineHeight: 1.5, maxWidth: 480 }}>
          This issue was fixed previously but was detected again during the latest verification scan.
        </div>
      )}
    </div>
  )
}

function ArrowDivider() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--t3)', fontSize: 15, margin: '2px 0', lineHeight: 1 }}>
      ↓
    </div>
  )
}

// ── Composition ──────────────────────────────────────────────────────────

/**
 * Full Before → Fix Applied → After → Verification body for one fix
 * attempt. Used both as the modal's main content (latest attempt) and,
 * collapsed by default, inside each FixHistoryTimeline row — so history
 * never loses the same Before/Fix/After clarity the primary view has.
 */
export default function AttemptSections({ attempt }) {
  if (!attempt) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div>
        <SectionLabel hint="What was detected">Before</SectionLabel>
        <BeforeStateCard before={attempt.before} />
      </div>
      <ArrowDivider />
      <div>
        <SectionLabel hint="What changed">Fix Applied</SectionLabel>
        <FixAppliedCard attempt={attempt} />
      </div>
      <ArrowDivider />
      <div>
        <SectionLabel hint="What verification found">After</SectionLabel>
        <AfterStateCard attempt={attempt} />
      </div>
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--b)' }}>
        <SectionLabel>Verification</SectionLabel>
        <VerificationResultBlock attempt={attempt} />
      </div>
    </div>
  )
}
