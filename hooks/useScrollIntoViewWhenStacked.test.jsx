import { describe, it, expect, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { useRef } from "react"
import { useScrollIntoViewWhenStacked } from "./useScrollIntoViewWhenStacked"

function Harness({ selected, direction }) {
  const ref = useRef(null)
  useScrollIntoViewWhenStacked(ref, selected)
  return (
    <div style={{ display: "flex", flexDirection: direction }}>
      <div ref={ref} data-testid="panel" />
    </div>
  )
}

describe("useScrollIntoViewWhenStacked", () => {
  let scrollIntoView
  beforeEach(() => {
    scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    window.matchMedia = window.matchMedia || (() => ({ matches: false }))
  })

  it("does not scroll on first render (deep-linked selection must not move the page)", () => {
    render(<Harness selected="/a" direction="column" />)
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it("scrolls the panel into view when a URL is picked while the layout is stacked", () => {
    const { rerender } = render(<Harness selected={null} direction="column" />)
    rerender(<Harness selected="/a" direction="column" />)
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: "start" }))
  })

  it("does nothing when the panel is side by side with the list", () => {
    const { rerender } = render(<Harness selected={null} direction="row" />)
    rerender(<Harness selected="/a" direction="row" />)
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it("does nothing when the selection is cleared", () => {
    const { rerender } = render(<Harness selected="/a" direction="column" />)
    rerender(<Harness selected={null} direction="column" />)
    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})
