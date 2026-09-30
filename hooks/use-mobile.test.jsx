import { describe, it, expect, afterEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useIsMobile, useIsCompactNav } from "./use-mobile"

function setWidth(w) {
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: w })
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
}

describe("nav breakpoints", () => {
  afterEach(() => setWidth(1024))

  it("useIsCompactNav switches to the drawer below 1024px (sidebar is 260px wide)", () => {
    setWidth(1023)
    expect(renderHook(() => useIsCompactNav()).result.current).toBe(true)
    setWidth(1024)
    expect(renderHook(() => useIsCompactNav()).result.current).toBe(false)
  })

  it("useIsMobile keeps its original 768px breakpoint for every other consumer", () => {
    setWidth(800)
    expect(renderHook(() => useIsMobile()).result.current).toBe(false)
    expect(renderHook(() => useIsCompactNav()).result.current).toBe(true)
    setWidth(767)
    expect(renderHook(() => useIsMobile()).result.current).toBe(true)
  })
})
