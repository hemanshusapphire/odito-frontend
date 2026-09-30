import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { render, screen } from "@testing-library/react"
import { LockedDarkTheme } from "./LockedDarkTheme"

const read = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8")

describe("LockedDarkTheme", () => {
  it("renders children inside a .dark + .theme-locked-dark boundary", () => {
    render(
      <LockedDarkTheme>
        <span>child</span>
      </LockedDarkTheme>
    )
    const boundary = screen.getByText("child").parentElement
    expect(boundary.classList.contains("dark")).toBe(true)
    expect(boundary.classList.contains("theme-locked-dark")).toBe(true)
  })

  it("stays dark when the global <html> theme is light", () => {
    document.documentElement.classList.remove("dark")
    render(
      <LockedDarkTheme>
        <span>child</span>
      </LockedDarkTheme>
    )
    expect(screen.getByText("child").parentElement.classList.contains("dark")).toBe(true)
  })

  // The legacy aliases (--text, --cyan, --grad1 ...) are resolved where they
  // are declared; if the boundary stops being in that selector list the
  // Processing screen silently inherits light-mode values again.
  it("re-declares the legacy aliases on the boundary", () => {
    const colors = read("../../styles/tokens/colors.css")
    expect(colors).toMatch(/:root,\s*\.theme-locked-dark\s*\{[^}]*--text:\s*var\(--color-text-primary\)/s)
  })

  it("is imported by globals.css after the dark theme", () => {
    const globals = read("../../app/globals.css")
    expect(globals.indexOf("themes/dark.css")).toBeGreaterThan(-1)
    expect(globals.indexOf("themes/locked-dark.css")).toBeGreaterThan(globals.indexOf("themes/dark.css"))
  })
})
