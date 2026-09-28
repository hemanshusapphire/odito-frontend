import { describe, test, expect, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import H1ApplyDialog from "./H1ApplyDialog"

const SUPPORTED = {
  supported: true,
  builder: { name: "divi", label: "Divi" },
  state: "missing",
  fingerprint: "a".repeat(64),
  current: { h1Count: 0, h1Texts: [] },
  plan: { summary: "The page-title heading becomes the H1.", changes: ["Heading level H2 → H1"] },
  recommended: { ok: true, text: "SEO Reseller Services by Naxonify" },
}

function setup(props = {}) {
  const handlers = { onOpenChange: vi.fn(), onConfirm: vi.fn(), onRefreshContext: vi.fn() }
  render(<H1ApplyDialog open context={SUPPORTED} pageUrl="https://naxonify.com/seo-reseller" {...handlers} {...props} />)
  return handlers
}

describe("H1ApplyDialog", () => {
  test("renders nothing when closed", () => {
    const { container } = render(<H1ApplyDialog open={false} context={SUPPORTED} />)
    expect(container).toBeEmptyDOMElement()
  })

  test("Apply confirms; Cancel closes without confirming", () => {
    const { onConfirm, onOpenChange } = setup()
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onConfirm).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("button", { name: "Apply via WordPress" }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  test("Apply is disabled while the page is being read", () => {
    setup({ contextLoading: true })
    expect(screen.getByRole("button", { name: "Apply via WordPress" })).toBeDisabled()
    expect(screen.getByText("Reading the page from WordPress…")).toBeInTheDocument()
  })

  test("Apply is disabled while applying, and says so", () => {
    setup({ isApplying: true })
    expect(screen.getByRole("button", { name: "Applying…" })).toBeDisabled()
  })

  test("an unreadable page shows a Refresh action instead of Apply — no state to approve", () => {
    const { onRefreshContext } = setup({ context: undefined, contextUnavailable: true })
    expect(screen.queryByRole("button", { name: "Apply via WordPress" })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Refresh Page State" }))
    expect(onRefreshContext).toHaveBeenCalledTimes(1)
  })

  test("an unsupported page cannot be applied and shows the reason", () => {
    setup({ context: { ...SUPPORTED, supported: false, reason: "This page is built with Elementor." } })
    expect(screen.getByRole("button", { name: "Apply via WordPress" })).toBeDisabled()
    expect(screen.getByTestId("h1-unsupported")).toHaveTextContent("built with Elementor")
  })

  test("a recommendation that is not applicable cannot be applied and shows why", () => {
    setup({ context: { ...SUPPORTED, recommended: { ok: false, message: "The recommended H1 contains a script." } } })
    expect(screen.getByRole("button", { name: "Apply via WordPress" })).toBeDisabled()
    expect(screen.getByTestId("h1-recommended")).toHaveTextContent("contains a script")
  })

  test("without a page fingerprint there is nothing to approve: Apply stays disabled", () => {
    setup({ context: { ...SUPPORTED, fingerprint: undefined } })
    expect(screen.getByRole("button", { name: "Apply via WordPress" })).toBeDisabled()
  })

  test("a non-retryable error disables Apply", () => {
    setup({ errorInfo: { message: "nope", nonRetryable: true } })
    expect(screen.getByRole("button", { name: "Apply via WordPress" })).toBeDisabled()
  })

  test("a lost task-version race after a successful write says the change WAS applied", () => {
    setup({ errorInfo: { message: "x", wordpressWriteSucceeded: true, isConflict: true, requiresRefresh: true } })
    expect(screen.getByText(/The WordPress change was applied, but Odito couldn't record it/)).toBeInTheDocument()
  })

  test("describes an empty H1 and an existing H1 in the Current field", () => {
    const { rerender } = render(<H1ApplyDialog open context={{ ...SUPPORTED, state: "empty" }} />)
    expect(screen.getByTestId("h1-current")).toHaveTextContent("Empty H1 (no text)")
    rerender(<H1ApplyDialog open context={{ ...SUPPORTED, state: "present", current: { h1Texts: ["Old heading"] } }} />)
    expect(screen.getByTestId("h1-current")).toHaveTextContent("Old heading")
  })
})
