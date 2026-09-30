import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, within } from "@testing-library/react"
import IssueTable from "./IssueTable"

const issues = [
  { issue_code: "a", title: "Missing meta description on many templates", severity: "high", pages_affected: 12, impact_percentage: 18, difficulty: "easy" },
  { issue_code: "b", title: "H1 heading missing", severity: "low", pages_affected: 3, impact_percentage: 4, difficulty: "hard" },
]

describe("IssueTable — responsive structure", () => {
  it("wraps the table in a scroll container so it can never widen the page", () => {
    const { container } = render(<IssueTable issues={issues} />)
    const wrap = container.querySelector(".issue-table-wrap")
    expect(wrap).toBeTruthy()
    expect(wrap.querySelector("table.issue-table")).toBeTruthy()
  })

  it("keeps table semantics explicit (CSS turns rows into cards on phones)", () => {
    render(<IssueTable issues={issues} />)
    expect(screen.getByRole("table")).toBeTruthy()
    expect(screen.getAllByRole("columnheader")).toHaveLength(6)
    // header row + one row per issue
    expect(screen.getAllByRole("row")).toHaveLength(1 + issues.length)
  })

  it("labels every cell so the stacked-card layout can repeat the column name", () => {
    render(<IssueTable issues={issues} />)
    const firstRow = screen.getAllByRole("row")[1]
    const labels = within(firstRow).getAllByRole("cell").map((c) => c.getAttribute("data-label"))
    expect(labels).toEqual(["Issue", "Severity", "Pages", "Impact", "Difficulty", "Action"])
  })

  it("marks the title and action cells for card layout, and keeps the action reachable", () => {
    const onSelect = vi.fn()
    render(<IssueTable issues={issues} onSelect={onSelect} />)
    const firstRow = screen.getAllByRole("row")[1]
    const cells = within(firstRow).getAllByRole("cell")
    expect(cells[0].classList.contains("it-title")).toBe(true)
    expect(cells[5].classList.contains("it-action")).toBe(true)

    const btn = within(cells[5]).getByRole("button", { name: /fix with ai/i })
    expect(btn.classList.contains("tap-target")).toBe(true)
    fireEvent.click(btn)
    expect(onSelect).toHaveBeenCalledWith(0)
  })
})
