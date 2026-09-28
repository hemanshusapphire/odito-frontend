/**
 * Helpers for the keyboard/focus accessibility issue (issueId "keyboard_accessibility").
 *
 * The backend's issue-context response carries an `accessibilityAudit` object for this
 * issue (see odito_backend/.../issue-context/accessibilityAudit.js):
 *
 *   {
 *     available: boolean,
 *     reason?: 'not_scanned' | 'legacy_audit',      // when available is false
 *     legacyCounts?: { missingFocusOutline, ... },
 *     pageUrl, auditVersion, testedAt,
 *     tested: { focusableTotal, focusableVisible, tabStopsVisited, completed, truncated },
 *     technology: { kind, label, cms, builder, theme, ... },
 *     findings: [{ type: 'missing_focus_indicator'|'focus_trap'|'unreachable_elements'|'weak_focus_indicator',
 *                  count, elements: [...], ... }],
 *     intentionalTrap: { verdict, container } | null,
 *   }
 *
 * Display only: nothing here decides pass/fail or invents an element — every row shown is
 * something the audit recorded from the live page.
 */

export const KEYBOARD_ISSUE_ID = "keyboard_accessibility"

/** The audit payload for a keyboard_accessibility issue context, or null for any other issue / no data. */
export function getAccessibilityAudit(issueContext) {
  const audit = issueContext?.accessibilityAudit
  return audit && typeof audit === "object" && "available" in audit ? audit : null
}

export const FINDING_TITLES = {
  missing_focus_indicator: "Missing focus indicators",
  focus_trap: "Focus trap",
  unreachable_elements: "Unreachable elements",
  weak_focus_indicator: "Weak focus indicators (low contrast)",
}

export const FINDING_HINTS = {
  missing_focus_indicator: "These elements show no visible change when they receive keyboard focus (outline, ring, border, background, underline…).",
  focus_trap: "Keyboard focus cycles among these elements and cannot leave.",
  unreachable_elements: "These visible controls could not be reached with the Tab key.",
  weak_focus_indicator: "A focus style exists but its colour is too close to the background (below 3:1).",
}

export const TRAP_VERDICT_LABELS = {
  unintended: "Unintended trap",
  hidden_container_trap: "Closed container still in the tab order",
  modal_without_exit: "Modal with no way out",
  intentional_modal: "Intentional modal (not a failure)",
  intentional_widget: "Intentional popup (not a failure)",
}

/** "BUTTON “Get Started”" — the card headline. */
export function elementHeadline(element) {
  const tag = (element?.tag || "element").toUpperCase()
  return { tag, name: element?.accessibleName || element?.text || null }
}

/** Plain-language current focus style of an element that failed / was tested. */
export function focusStyleLabel(element) {
  const fi = element?.focusIndicator
  if (!fi) return "—"
  if (fi.status === "missing") return "none — no visible change on focus"
  if (fi.status === "weak") return "present but low contrast"
  if (fi.status === "not_visible") return "element is not visible when focused"
  if (Array.isArray(fi.signals) && fi.signals.length) return fi.signals.join(", ")
  return fi.status || "—"
}

/** "outline: none · box-shadow: none" style line from the stored compact before/after styles. */
export function computedFocusStyles(element) {
  const after = element?.focusIndicator?.after
  if (!after) return null
  return {
    outline: after.outline || "none",
    boxShadow: after.boxShadow || "none",
    border: after.border || null,
    backgroundColor: after.backgroundColor || null,
    color: after.color || null,
  }
}

/**
 * A snippet the user can paste into the browser DevTools console on the affected page
 * to scroll to and highlight the element. The selector is embedded through JSON.stringify,
 * so quotes/backslashes in it can never break out of the string literal.
 */
export function highlightSnippet(selector) {
  return [
    "(() => {",
    `  const el = document.querySelector(${JSON.stringify(String(selector ?? ""))});`,
    "  if (!el) { console.warn('Element not found — the page may have changed since the audit.'); return; }",
    "  el.scrollIntoView({ block: 'center', behavior: 'smooth' });",
    "  el.style.outline = '4px solid #ff00aa';",
    "  el.style.outlineOffset = '3px';",
    "  console.log('Odito: highlighted', el);",
    "})();",
  ].join("\n")
}

/** How many rows are visible before "Show all". */
export const INITIAL_VISIBLE_ELEMENTS = 5

/** Human "tested 44 of 79 focusable elements" line, or null when the audit didn't record it. */
export function testedSummary(audit) {
  const t = audit?.tested
  if (!t || t.tabStopsVisited == null) return null
  const parts = [`${t.tabStopsVisited} keyboard stops tested`]
  if (t.focusableVisible != null) parts.push(`${t.focusableVisible} visible focusable elements`)
  if (t.truncated) parts.push("stopped at the safety limit — some elements may be untested")
  return parts.join(" · ")
}

export default { KEYBOARD_ISSUE_ID, getAccessibilityAudit, elementHeadline, focusStyleLabel, computedFocusStyles, highlightSnippet, testedSummary };
