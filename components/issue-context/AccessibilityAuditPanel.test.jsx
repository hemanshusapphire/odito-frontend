import { describe, test, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react"
import AccessibilityAuditPanel from "./AccessibilityAuditPanel"
import CurrentStateRenderer from "./CurrentStateRenderer"
import {
  getAccessibilityAudit,
  elementHeadline,
  focusStyleLabel,
  highlightSnippet,
  testedSummary,
  INITIAL_VISIBLE_ELEMENTS,
} from "./accessibilityAudit"
import realAudit from "./__fixtures__/naxonify-accessibility-audit.json"

/**
 * The keyboard-accessibility "Detected Issue" panel. `realAudit` is the accessibilityAudit
 * payload the backend produces from an actual audit of https://naxonify.com/ (40 elements
 * without a visible focus indicator, no focus trap) — not hand-written mock data.
 */

const el = (over = {}) => ({
  tag: "button", role: "button", accessibleName: "Get Started", selector: "button.cta-primary", selectorUnique: true, domPath: "main > section > button.cta-primary",
  href: null, classes: ["cta-primary"], tabindex: null, container: { selector: "main", role: "main" },
  focusIndicator: { status: "missing", signals: [], after: { outline: "none", boxShadow: "none", backgroundColor: "rgb(1, 97, 244)" }, suppressingRule: null }, ...over,
})

const auditWith = (findings, over = {}) => ({
  available: true, pageUrl: "https://example.com/", auditVersion: 2, testedAt: "2026-09-26T05:00:00.000Z",
  tested: { focusableTotal: 12, focusableVisible: 10, tabStopsVisited: 10, completed: true, truncated: false },
  technology: { kind: "plain-css", label: "Unknown (plain HTML/CSS assumed)" }, findings, intentionalTrap: null, ...over,
})

const missing = (elements, count = elements.length, extra = {}) => ({ type: "missing_focus_indicator", count, testedCount: 10, elements, listTruncated: false, ...extra })

describe("AccessibilityAuditPanel — the real Naxonify audit", () => {
  test("shows 'Affected Elements (40)' and the first five as cards, not a one-line diagnostic", () => {
    render(<AccessibilityAuditPanel audit={realAudit} />)
    expect(screen.getByTestId("a11y-affected-count")).toHaveTextContent("Affected Elements (40)")
    expect(screen.getAllByTestId("a11y-element")).toHaveLength(INITIAL_VISIBLE_ELEMENTS)
    expect(screen.queryByText(/Keyboard navigation test found/)).not.toBeInTheDocument()
  })

  test("each card shows tag, accessible name, selector, role and current focus style", () => {
    render(<AccessibilityAuditPanel audit={realAudit} />)
    const card = screen.getAllByTestId("a11y-element")[1]
    expect(within(card).getByText("A")).toBeInTheDocument()
    expect(within(card).getByText("“Home”")).toBeInTheDocument()
    expect(within(card).getByTestId("a11y-selector")).toHaveTextContent("#menu-main-menu > li:nth-of-type(1) > a")
    expect(within(card).getByText("link")).toBeInTheDocument()
    expect(within(card).getByTestId("a11y-focus-style")).toHaveTextContent("none — no visible change on focus")
  })

  test("'Show all' reveals all 40", () => {
    render(<AccessibilityAuditPanel audit={realAudit} />)
    fireEvent.click(screen.getByTestId("a11y-show-all"))
    expect(screen.getAllByTestId("a11y-element")).toHaveLength(40)
    expect(screen.queryByTestId("a11y-show-all")).not.toBeInTheDocument()
  })

  test("summary: how many were tested, the detected stack, and no trap section", () => {
    render(<AccessibilityAuditPanel audit={realAudit} />)
    expect(screen.getByTestId("a11y-summary")).toHaveTextContent("44 keyboard stops tested")
    expect(screen.getByTestId("a11y-tech")).toHaveTextContent("Detected: WordPress · Divi")
    expect(screen.queryByTestId("a11y-trap")).not.toBeInTheDocument()
    expect(screen.queryByTestId("a11y-finding-focus_trap")).not.toBeInTheDocument()
  })

  test("View Element opens the details: DOM path, the CSS rule that removes the outline, and safe actions", () => {
    render(<AccessibilityAuditPanel audit={realAudit} />)
    const card = screen.getAllByTestId("a11y-element")[0]
    expect(within(card).queryByTestId("a11y-element-details")).not.toBeInTheDocument()
    fireEvent.click(within(card).getByTestId("a11y-view-element"))
    const details = within(card).getByTestId("a11y-element-details")
    expect(details).toHaveTextContent("DOM path")
    expect(within(details).getByTestId("a11y-suppress")).toHaveTextContent("an inline <style> block")
    expect(within(details).getByTestId("a11y-copy-selector")).toBeInTheDocument()
    expect(within(details).getByTestId("a11y-copy-snippet")).toBeInTheDocument()
    expect(within(details).getByRole("link", { name: /Open page/ })).toHaveAttribute("href", "https://naxonify.com/")
    expect(within(details).getByRole("link", { name: /Open page/ })).toHaveAttribute("rel", expect.stringContaining("noopener"))
    fireEvent.click(within(card).getByTestId("a11y-view-element"))
    expect(within(card).queryByTestId("a11y-element-details")).not.toBeInTheDocument()
  })
})

describe("AccessibilityAuditPanel — copy actions", () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
  })

  test("copies the selector and a highlight snippet built from it", async () => {
    render(<AccessibilityAuditPanel audit={auditWith([missing([el()])])} />)
    fireEvent.click(screen.getByTestId("a11y-view-element"))
    fireEvent.click(screen.getByTestId("a11y-copy-selector"))
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith("button.cta-primary"))
    fireEvent.click(screen.getByTestId("a11y-copy-snippet"))
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith(highlightSnippet("button.cta-primary")))
    expect(await screen.findAllByText("Copied ✓")).not.toHaveLength(0)
  })

  test("a failed clipboard write does not claim success", async () => {
    navigator.clipboard.writeText.mockRejectedValue(new Error("denied"))
    render(<AccessibilityAuditPanel audit={auditWith([missing([el()])])} />)
    fireEvent.click(screen.getByTestId("a11y-view-element"))
    fireEvent.click(screen.getByTestId("a11y-copy-selector"))
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalled())
    expect(screen.queryByText("Copied ✓")).not.toBeInTheDocument()
  })
})

describe("AccessibilityAuditPanel — states", () => {
  test("a selector that matches several elements is flagged, never presented as unique", () => {
    render(<AccessibilityAuditPanel audit={auditWith([missing([el({ selectorUnique: false, xpath: "/html/body/button[2]" })])])} />)
    expect(screen.getByText(/matches more than one element/)).toBeInTheDocument()
    fireEvent.click(screen.getByTestId("a11y-view-element"))
    expect(screen.getByText("/html/body/button[2]")).toBeInTheDocument()
  })

  test("a truncated list says so with the true total", () => {
    render(<AccessibilityAuditPanel audit={auditWith([missing(Array.from({ length: 50 }, (_, i) => el({ selector: `#e${i}` })), 133, { listTruncated: true })])} />)
    expect(screen.getByTestId("a11y-affected-count")).toHaveTextContent("Affected Elements (133)")
    expect(screen.getByTestId("a11y-truncated")).toHaveTextContent("Showing the first 50 of 133")
  })

  test("an unintended focus trap shows container, verdict, cause, cycle and sequence", () => {
    const trap = {
      type: "focus_trap", count: 2, verdict: "hidden_container_trap", suspectedCause: "a closed drawer is still in the tab order",
      container: { selector: "div.mobile-menu", role: "div", visible: false }, firstElement: { selector: "#logo" },
      elements: [el({ tag: "a", accessibleName: "Home", selector: ".mobile-menu a.home" }), el({ tag: "a", accessibleName: "About", selector: ".mobile-menu a.about" })],
      focusSequence: [{ step: 1, to: "#logo", accessibleName: "Logo" }, { step: 2, to: ".mobile-menu a.home", accessibleName: "Home" }],
    }
    render(<AccessibilityAuditPanel audit={auditWith([trap])} />)
    const box = screen.getByTestId("a11y-trap")
    expect(box).toHaveTextContent("Closed container still in the tab order")
    expect(box).toHaveTextContent("div.mobile-menu")
    expect(box).toHaveTextContent("not visible, but focus is still inside it")
    expect(screen.getByTestId("a11y-trap-cause")).toHaveTextContent("closed drawer")
    expect(within(screen.getByTestId("a11y-sequence")).getAllByRole("listitem")).toHaveLength(2)
    expect(screen.getAllByTestId("a11y-element")).toHaveLength(2)
  })

  test("only an INTENTIONAL modal trap: reported as not a failure", () => {
    render(<AccessibilityAuditPanel audit={auditWith([], { intentionalTrap: { verdict: "intentional_modal", suspectedCause: "visible closable modal" } })} />)
    expect(screen.getByTestId("a11y-clean")).toHaveTextContent("intentional trap is not an accessibility failure")
    expect(screen.queryByTestId("a11y-trap")).not.toBeInTheDocument()
  })

  test("a clean audit says so", () => {
    render(<AccessibilityAuditPanel audit={auditWith([])} />)
    expect(screen.getByTestId("a11y-clean")).toHaveTextContent("No keyboard or focus failure")
  })

  test("weak indicators are shown as informational, after the failures", () => {
    render(<AccessibilityAuditPanel audit={auditWith([missing([el()]), { type: "weak_focus_indicator", informational: true, count: 1, elements: [el({ focusIndicator: { status: "weak" } })] }])} />)
    expect(screen.getByTestId("a11y-finding-weak_focus_indicator")).toHaveTextContent("for information")
    expect(screen.getByText("present but low contrast")).toBeInTheDocument()
  })

  test("a legacy (counts-only) audit tells the user to re-run instead of showing fake elements", () => {
    render(<AccessibilityAuditPanel audit={{ available: false, reason: "legacy_audit", legacyCounts: { missingFocusOutline: 10 }, findings: [] }} />)
    expect(screen.getByTestId("a11y-legacy")).toHaveTextContent("only counted problems (10 elements)")
    expect(screen.getByTestId("a11y-legacy")).toHaveTextContent("Re-run the accessibility audit")
    expect(screen.queryByTestId("a11y-element")).not.toBeInTheDocument()
  })

  test("a page never audited", () => {
    render(<AccessibilityAuditPanel audit={{ available: false, reason: "not_scanned", findings: [] }} />)
    expect(screen.getByTestId("a11y-not-scanned")).toBeInTheDocument()
  })

  test("renders nothing without an audit", () => {
    const { container } = render(<AccessibilityAuditPanel audit={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  test("never renders raw HTML from element data (text is escaped)", () => {
    render(<AccessibilityAuditPanel audit={auditWith([missing([el({ accessibleName: "<img src=x onerror=alert(1)>", selector: "#a" })])])} />)
    expect(screen.getByText("“<img src=x onerror=alert(1)>”")).toBeInTheDocument()
    expect(document.querySelector("img[src='x']")).toBeNull()
  })
})

describe("CurrentStateRenderer integration", () => {
  const ctx = (extra = {}) => ({
    identity: { issueId: "keyboard_accessibility", pipeline: "on_page" },
    currentState: { displayType: "list", affectedItems: ["Keyboard navigation test found 10 elements without focus indicators"], rawValue: [], isAbsent: false, measurement: {} },
    expectedState: { description: "x" }, metadata: { readinessScore: 90, missingSignals: [] }, ...extra,
  })

  test("uses the audit panel when the context carries an accessibilityAudit", () => {
    render(<CurrentStateRenderer issueContext={ctx({ accessibilityAudit: realAudit })} />)
    expect(screen.getByTestId("a11y-affected-count")).toHaveTextContent("Affected Elements (40)")
    expect(screen.queryByText(/Keyboard navigation test found 10 elements/)).not.toBeInTheDocument()
  })

  test("other issues (no accessibilityAudit) are unaffected", async () => {
    render(<CurrentStateRenderer issueContext={ctx()} />)
    expect(screen.queryByTestId("a11y-affected-count")).not.toBeInTheDocument()
    expect(screen.getByText("Current State")).toBeInTheDocument()
  })
})

describe("accessibilityAudit helpers", () => {
  test("getAccessibilityAudit only accepts an audit-shaped object", () => {
    expect(getAccessibilityAudit({ accessibilityAudit: realAudit })).toBe(realAudit)
    for (const bad of [null, undefined, {}, { accessibilityAudit: null }, { accessibilityAudit: "x" }, { accessibilityAudit: {} }]) expect(getAccessibilityAudit(bad)).toBeNull()
  })

  test("elementHeadline and focusStyleLabel", () => {
    expect(elementHeadline({ tag: "a", accessibleName: "About" })).toEqual({ tag: "A", name: "About" })
    expect(elementHeadline({ tag: "button", text: "Go" }).name).toBe("Go")
    expect(elementHeadline(null)).toEqual({ tag: "ELEMENT", name: null })
    expect(focusStyleLabel({ focusIndicator: { status: "missing" } })).toBe("none — no visible change on focus")
    expect(focusStyleLabel({ focusIndicator: { status: "present", signals: ["outline", "box-shadow"] } })).toBe("outline, box-shadow")
    expect(focusStyleLabel({})).toBe("—")
  })

  test("testedSummary mentions truncation honestly", () => {
    expect(testedSummary({ tested: { tabStopsVisited: 60, focusableVisible: 66, truncated: true } })).toMatch(/stopped at the safety limit/)
    expect(testedSummary({ tested: {} })).toBeNull()
    expect(testedSummary(null)).toBeNull()
  })

  test("highlightSnippet cannot be broken out of by a hostile selector", () => {
    const snippet = highlightSnippet('a[href="x"]"); alert(1); ("')
    expect(snippet).toContain(JSON.stringify('a[href="x"]"); alert(1); ("'))
    // The dangerous text only ever appears inside the JSON string literal.
    const body = snippet.split("\n").find((l) => l.includes("querySelector"))
    expect(() => new Function(`return ${body.trim().replace(/^const el = /, "").replace(/;$/, "").replace("document.querySelector", "String")}`)()).not.toThrow()
    expect(snippet.split("\n").filter((l) => l.includes("alert(1)"))).toHaveLength(1)
  })
})
