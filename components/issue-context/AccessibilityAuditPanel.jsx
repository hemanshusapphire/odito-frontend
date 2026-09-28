"use client"

import React, { memo, useState } from "react"
import {
  FINDING_HINTS,
  FINDING_TITLES,
  INITIAL_VISIBLE_ELEMENTS,
  TRAP_VERDICT_LABELS,
  computedFocusStyles,
  elementHeadline,
  focusStyleLabel,
  highlightSnippet,
  testedSummary,
} from "./accessibilityAudit"

/**
 * AccessibilityAuditPanel
 *
 * The "Detected Issue" body for keyboard_accessibility. The generic one-line summary
 * ("Keyboard navigation test found 10 elements without focus indicators") told the user
 * nothing they could act on — not WHICH elements. This shows what the audit recorded:
 *
 *   Affected Elements (N)  — one card per element: tag, accessible name, selector, role,
 *                            current focus style, container; expandable for the DOM path,
 *                            link target, classes and the page CSS that removes the outline
 *   Focus trap             — container, verdict (intentional modal vs failure), cause,
 *                            the looping elements and the focus sequence
 *   Unreachable elements   — same cards
 *
 * "View Element" opens the element's details with its selector and a copy/paste snippet that
 * highlights it in the browser DevTools. It does not drive a browser: no automation
 * dependency, nothing to break, and the snippet only runs on the user's own page.
 * Display only — nothing here decides pass/fail.
 */

const TONES = {
  bad: { color: "var(--re)", surface: "var(--color-status-error-surface)", border: "var(--color-status-error-border)" },
  warn: { color: "var(--am)", surface: "var(--color-status-warning-surface)", border: "var(--color-status-warning-border)" },
  good: { color: "var(--gr)", surface: "var(--color-status-success-surface)", border: "var(--color-status-success-border)" },
}

const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function Field({ label, children, testId }) {
  if (children === null || children === undefined || children === "") return null
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 11.5, lineHeight: 1.5 }} data-testid={testId}>
      <span style={{ width: 92, flexShrink: 0, color: "var(--t3)" }}>{label}</span>
      <span style={{ minWidth: 0, color: "var(--t2)", wordBreak: "break-word" }}>{children}</span>
    </div>
  )
}

function CopyButton({ text, label, testId }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={async () => {
        const ok = await copyText(text)
        setCopied(ok)
        if (ok) setTimeout(() => setCopied(false), 1500)
      }}
      style={{ fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: 6, border: "1px solid var(--b)", background: "var(--s2)", color: "var(--t2)", cursor: "pointer" }}
    >
      {copied ? "Copied ✓" : label}
    </button>
  )
}

const ElementCard = memo(function ElementCard({ element, index, pageUrl, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const { tag, name } = elementHeadline(element)
  const styles = computedFocusStyles(element)
  const suppress = element.focusIndicator?.suppressingRule
  const notUnique = element.selectorUnique === false

  return (
    <div
      data-testid="a11y-element"
      style={{ padding: "11px 13px", background: "var(--s2)", border: "1px solid var(--b)", borderRadius: 10, display: "flex", flexDirection: "column", gap: 6 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", padding: "2px 7px", borderRadius: 5, background: "rgba(255,255,255,0.06)", color: "var(--t2)", ...mono }}>
          {tag}
        </span>
        {name && <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--t)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>“{name}”</span>}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--t3)" }}>#{index + 1}</span>
      </div>

      <Field label="Selector">
        <code style={{ ...mono, fontSize: 11, color: "var(--t)" }} data-testid="a11y-selector">{element.selector}</code>
        {notUnique && <span style={{ color: "var(--am)" }}> — matches more than one element</span>}
      </Field>
      <Field label="Role">{element.role}</Field>
      <Field label="Focus style" testId="a11y-focus-style">{focusStyleLabel(element)}</Field>
      <Field label="Container">{element.container?.role || element.container?.selector}</Field>

      <div>
        <button
          type="button"
          data-testid="a11y-view-element"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{ fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 7, border: "1px solid var(--b)", background: "transparent", color: "var(--t)", cursor: "pointer" }}
        >
          {open ? "Hide Element" : "View Element"}
        </button>
      </div>

      {open && (
        <div data-testid="a11y-element-details" style={{ marginTop: 4, paddingTop: 8, borderTop: "1px solid var(--b)", display: "flex", flexDirection: "column", gap: 6 }}>
          <Field label="DOM path"><code style={{ ...mono, fontSize: 11 }}>{element.domPath}</code></Field>
          {element.xpath && <Field label="XPath"><code style={{ ...mono, fontSize: 11 }}>{element.xpath}</code></Field>}
          <Field label="Link target">{element.href}</Field>
          <Field label="Classes">{element.classes?.length ? element.classes.join(" ") : null}</Field>
          <Field label="tabindex">{element.tabindex}</Field>
          {styles && (
            <Field label="Computed on focus">
              outline: {styles.outline} · box-shadow: {styles.boxShadow}
              {styles.backgroundColor ? ` · background: ${styles.backgroundColor}` : ""}
            </Field>
          )}
          {suppress && (
            <Field label="Cause" testId="a11y-suppress">
              A CSS rule on <code style={{ ...mono, fontSize: 11 }}>{suppress.selector}</code> in {suppress.stylesheet === "inline <style>" ? "an inline <style> block" : suppress.stylesheet} removes the outline.
            </Field>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
            <CopyButton text={element.selector} label="Copy selector" testId="a11y-copy-selector" />
            <CopyButton text={highlightSnippet(element.selector)} label="Copy highlight snippet" testId="a11y-copy-snippet" />
            {pageUrl && (
              <a href={pageUrl} target="_blank" rel="noreferrer noopener" style={{ fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: 6, border: "1px solid var(--b)", color: "var(--t2)", textDecoration: "none" }}>
                Open page ↗
              </a>
            )}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--t3)", lineHeight: 1.5 }}>
            To see it: open the page, press F12, paste the snippet in the Console. Nothing is changed on your site.
          </div>
        </div>
      )}
    </div>
  )
})

function ElementList({ elements, pageUrl }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? elements : elements.slice(0, INITIAL_VISIBLE_ELEMENTS)
  const hidden = elements.length - visible.length
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {visible.map((el, i) => <ElementCard key={`${el.selector}-${i}`} element={el} index={i} pageUrl={pageUrl} />)}
      {hidden > 0 && (
        <button type="button" data-testid="a11y-show-all" onClick={() => setShowAll(true)}
          style={{ fontSize: 11.5, fontWeight: 600, padding: "8px 12px", borderRadius: 8, border: "1px dashed var(--b)", background: "transparent", color: "var(--t2)", cursor: "pointer" }}>
          Show all {elements.length} elements ({hidden} more)
        </button>
      )}
      {showAll && elements.length > INITIAL_VISIBLE_ELEMENTS && (
        <button type="button" onClick={() => setShowAll(false)}
          style={{ fontSize: 11, color: "var(--t3)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
          Show fewer
        </button>
      )}
    </div>
  )
}

function FindingSection({ finding, pageUrl }) {
  const tone = finding.informational ? TONES.warn : TONES.bad
  const title = FINDING_TITLES[finding.type] || finding.type
  return (
    <section data-testid={`a11y-finding-${finding.type}`} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: tone.color }}>{title}</div>
        <div style={{ fontSize: 10.5, color: "var(--t3)" }}>{finding.informational ? "for information" : ""}</div>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--t2)", lineHeight: 1.5 }}>{FINDING_HINTS[finding.type]}</div>

      {finding.type === "focus_trap" && <TrapDetails finding={finding} />}

      <div data-testid="a11y-affected-count" style={{ fontSize: 9.5, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Affected Elements ({finding.count})
      </div>
      {finding.listTruncated && (
        <div data-testid="a11y-truncated" style={{ fontSize: 11, color: "var(--am)" }}>
          Showing the first {finding.elements.length} of {finding.count}.
        </div>
      )}
      <ElementList elements={finding.elements || []} pageUrl={pageUrl} />
    </section>
  )
}

function TrapDetails({ finding }) {
  const container = finding.container
  return (
    <div data-testid="a11y-trap" style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px", background: "var(--color-status-error-surface)", border: "1px solid var(--color-status-error-border)", borderRadius: 10 }}>
      <Field label="Verdict">{TRAP_VERDICT_LABELS[finding.verdict] || finding.verdict}</Field>
      <Field label="Container">{container?.selector ? <code style={{ ...mono, fontSize: 11 }}>{container.selector}</code> : "could not be identified"}</Field>
      <Field label="Container role">{container?.role}</Field>
      <Field label="Visible">{container ? (container.visible ? "yes" : "no — it is not visible, but focus is still inside it") : null}</Field>
      <Field label="Likely cause" testId="a11y-trap-cause">{finding.suspectedCause}</Field>
      <Field label="Started at">{finding.firstElement?.selector ? <code style={{ ...mono, fontSize: 11 }}>{finding.firstElement.selector}</code> : null}</Field>
      <Field label="Elements in loop">{finding.count}</Field>
      {finding.focusSequence?.length > 0 && (
        <div data-testid="a11y-sequence" style={{ marginTop: 4 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Focus sequence</div>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: "var(--t2)", lineHeight: 1.6 }}>
            {finding.focusSequence.slice(0, 12).map((s) => (
              <li key={s.step}><code style={{ ...mono, fontSize: 10.5 }}>{s.to}</code>{s.accessibleName ? ` — “${s.accessibleName}”` : ""}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

function Notice({ tone, title, children, testId }) {
  const t = TONES[tone]
  return (
    <div data-testid={testId} style={{ padding: "11px 14px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: t.color, marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 11.5, color: "var(--t2)", lineHeight: 1.55 }}>{children}</div>
    </div>
  )
}

const AccessibilityAuditPanel = memo(function AccessibilityAuditPanel({ audit }) {
  if (!audit) return null

  if (!audit.available) {
    if (audit.reason === "legacy_audit") {
      const n = audit.legacyCounts?.missingFocusOutline
      return (
        <Notice tone="warn" title="This page needs a fresh accessibility audit" testId="a11y-legacy">
          It was audited with an earlier version that only counted problems{n != null ? ` (${n} elements)` : ""} and did not record which elements are affected. Re-run the accessibility audit to see the exact elements and get a specific fix.
        </Notice>
      )
    }
    return (
      <Notice tone="warn" title="No keyboard audit for this page yet" testId="a11y-not-scanned">
        Run the accessibility audit to find the exact elements that fail keyboard and focus checks.
      </Notice>
    )
  }

  const failing = audit.findings.filter((f) => !f.informational)
  const informational = audit.findings.filter((f) => f.informational)
  const summary = testedSummary(audit)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div data-testid="a11y-summary" style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 11, color: "var(--t3)" }}>
        {summary && <span>{summary}</span>}
        {audit.technology?.label && <span data-testid="a11y-tech">Detected: {audit.technology.label}</span>}
        {audit.testedAt && <span>Audited {new Date(audit.testedAt).toLocaleString()}</span>}
      </div>

      {failing.length === 0 && (
        <Notice tone="good" title="No keyboard or focus failure in the latest audit" testId="a11y-clean">
          {audit.intentionalTrap
            ? "Focus is trapped inside a visible modal that can be closed — an intentional trap is not an accessibility failure."
            : "Every tested element showed a visible focus indicator and focus could always move on."}
        </Notice>
      )}

      {failing.map((f) => <FindingSection key={f.type} finding={f} pageUrl={audit.pageUrl} />)}

      {audit.intentionalTrap && failing.length > 0 && (
        <Notice tone="good" title={TRAP_VERDICT_LABELS[audit.intentionalTrap.verdict] || "Intentional focus trap"} testId="a11y-intentional">
          {audit.intentionalTrap.suspectedCause}
        </Notice>
      )}

      {informational.map((f) => <FindingSection key={f.type} finding={f} pageUrl={audit.pageUrl} />)}

      {audit.cssRulesUnavailable && (
        <div style={{ fontSize: 10.5, color: "var(--t3)" }}>Some stylesheets are served from another domain, so the CSS rule behind a missing indicator may not be shown.</div>
      )}
    </div>
  )
})

export default AccessibilityAuditPanel
