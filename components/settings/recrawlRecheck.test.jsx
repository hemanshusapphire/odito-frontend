import { describe, test, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, waitFor, within, fireEvent, cleanup } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

/**
 * Settings UI for the Recrawl-vs-Recheck split:
 *   - "Weekly Recheck" (not the misleading "Weekly Recrawl") describes the automatic run
 *   - the manual Recrawl card shows the REAL remaining manual-recrawl credits
 *     (from the shared useSubscription() query — nothing hardcoded)
 *   - that count refreshes after a successful manual Recrawl
 *   - switching projects never carries another project's recrawl state over
 *
 * Real TanStack Query + real hooks (useSubscription, useAuditTrigger); only
 * the network/service edges (apiService, socketService, router, project
 * context) are mocked.
 */

const mockRouter = { push: vi.fn(), replace: vi.fn() }
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/app/settings",
  useSearchParams: () => new URLSearchParams(),
}))

let mockActiveProject = null
const mockRefreshProjects = vi.fn()
vi.mock("@/contexts/ProjectContext", () => ({
  useProject: () => ({ activeProject: mockActiveProject, refreshProjects: mockRefreshProjects }),
}))

vi.mock("@/lib/socketService", () => ({
  default: {
    onAuditCompleted: vi.fn(),
    onAuditError: vi.fn(),
    offAuditCompleted: vi.fn(),
    offAuditError: vi.fn(),
    joinProject: vi.fn(),
  },
}))

vi.mock("@/lib/apiService", () => ({
  default: {
    getSubscription: vi.fn(),
    startAudit: vi.fn(),
    getAuditStatus: vi.fn().mockResolvedValue({ data: {} }),
    updateProject: vi.fn().mockResolvedValue({ success: true }),
  },
}))

// SettingsPageContent's other children are irrelevant here (and heavy).
vi.mock("@/components/settings/SettingsTabs", () => ({ default: () => null }))
vi.mock("@/components/settings/DangerZoneCard", () => ({ default: () => null }))

import apiService from "@/lib/apiService"
import RecrawlCard from "./RecrawlCard"
import WeeklyRecheckCard from "./WeeklyRecheckCard"
import SettingsPageContent from "@/app/app/settings/page-content"

const subscriptionWith = (remaining, limit = 3) => ({
  success: true,
  data: { plan: { id: "starter" }, status: "active", recrawls: { limit, used: limit - remaining, remaining } },
})

function renderWithClient(ui, client = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  const utils = render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
  return { ...utils, client, rerenderUi: (next) => utils.rerender(<QueryClientProvider client={client}>{next}</QueryClientProvider>) }
}

const projectA = { _id: "proj-a", project_name: "Project A", scrape_frequency: "weekly", crawl_status: "completed" }
const projectB = { _id: "proj-b", project_name: "Project B", scrape_frequency: "manual", crawl_status: "completed" }

beforeEach(() => {
  cleanup()
  vi.clearAllMocks()
  apiService.getAuditStatus.mockResolvedValue({ data: {} })
  mockActiveProject = projectA
})

async function startRecrawlViaDialog() {
  fireEvent.click(screen.getAllByRole("button", { name: /start recrawl/i })[0])
  const dialog = await screen.findByRole("alertdialog")
  fireEvent.click(within(dialog).getAllByRole("button", { name: /^start recrawl$/i }).at(-1))
}

describe("Weekly Recheck card (test 15)", () => {
  test("says Weekly Recheck and describes the refresh — never 'Weekly Recrawl' or 'project recrawl every 7 days'", () => {
    renderWithClient(<WeeklyRecheckCard project={projectA} />)

    expect(screen.getByText("Weekly Recheck")).toBeInTheDocument()
    expect(screen.getByText(/automatically refreshes SEO, Accessibility and AI Visibility every 7 days/i)).toBeInTheDocument()
    expect(screen.getByText(/does not use manual recrawl credits/i)).toBeInTheDocument()
    expect(screen.queryByText(/weekly recrawl/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/performs a project recrawl/i)).not.toBeInTheDocument()
    expect(screen.getByRole("switch", { name: /toggle weekly recheck/i })).toBeChecked()
  })
})

describe("Manual Recrawl card credit display (tests 16–17)", () => {
  test("16: shows the real remaining count from the subscription — not a hardcoded number", async () => {
    apiService.getSubscription.mockResolvedValue(subscriptionWith(1))
    const first = renderWithClient(<RecrawlCard project={projectA} />)

    expect(screen.getByText(/uses 1 manual recrawl credit/i)).toBeInTheDocument()
    expect(await screen.findByText("1 manual recrawl remaining")).toBeInTheDocument()
    first.unmount()

    apiService.getSubscription.mockResolvedValue(subscriptionWith(7, 10))
    renderWithClient(<RecrawlCard project={projectA} />)
    expect(await screen.findByText("7 manual recrawls remaining")).toBeInTheDocument()
  })

  test.each([
    ["Starter", 3, "3 manual recrawls remaining"],
    ["Pro", 10, "10 manual recrawls remaining"],
    ["Premium", 30, "30 manual recrawls remaining"],
  ])("%s starts at its full allowance (%i) straight from the subscription payload", async (_plan, limit, text) => {
    apiService.getSubscription.mockResolvedValue(subscriptionWith(limit, limit))
    renderWithClient(<RecrawlCard project={projectA} />)
    expect(await screen.findByText(text)).toBeInTheDocument()
  })

  test("with 0 remaining the Start Recrawl button is disabled and the reason is shown", async () => {
    apiService.getSubscription.mockResolvedValue(subscriptionWith(0))
    renderWithClient(<RecrawlCard project={projectA} />)

    expect(await screen.findByText("0 manual recrawls remaining")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /start recrawl/i })).toBeDisabled()
    expect(screen.getByText(/no manual recrawls remaining/i)).toBeInTheDocument()
  })

  test("17: the count updates after a successful manual Recrawl", async () => {
    apiService.getSubscription
      .mockResolvedValueOnce(subscriptionWith(3))
      .mockResolvedValue(subscriptionWith(2))
    apiService.startAudit.mockResolvedValue({ success: true, data: {} })
    renderWithClient(<RecrawlCard project={projectA} />)
    expect(await screen.findByText("3 manual recrawls remaining")).toBeInTheDocument()

    await startRecrawlViaDialog()

    await waitFor(() => expect(apiService.startAudit).toHaveBeenCalledWith("proj-a"))
    expect(await screen.findByText("2 manual recrawls remaining")).toBeInTheDocument()
    expect(mockRouter.push).toHaveBeenCalledWith("/processing/proj-a")
  })

  test("a backend INSUFFICIENT_RECRAWLS rejection shows a clear message and re-syncs the count", async () => {
    apiService.getSubscription
      .mockResolvedValueOnce(subscriptionWith(1))
      .mockResolvedValue(subscriptionWith(0))
    const error = Object.assign(new Error("No manual recrawls remaining."), { code: "INSUFFICIENT_RECRAWLS", status: 403 })
    apiService.startAudit.mockRejectedValue(error)
    renderWithClient(<RecrawlCard project={projectA} />)
    expect(await screen.findByText("1 manual recrawl remaining")).toBeInTheDocument()

    await startRecrawlViaDialog()

    expect(await screen.findByText(/you have no manual recrawls remaining/i)).toBeInTheDocument()
    expect(await screen.findByText("0 manual recrawls remaining")).toBeInTheDocument()
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
})

describe("Project switching (test 18)", () => {
  test("another project's recrawl error/state is never shown after switching; the count is the account-level allowance", async () => {
    apiService.getSubscription.mockResolvedValue(subscriptionWith(2))
    apiService.startAudit.mockRejectedValue(Object.assign(new Error("Scraping already in progress for this project"), { status: 409 }))

    const view = renderWithClient(<SettingsPageContent />)
    expect(await screen.findByText("Project A")).toBeInTheDocument()
    expect(await screen.findByText("2 manual recrawls remaining")).toBeInTheDocument()

    await startRecrawlViaDialog()
    expect(await screen.findByText(/scraping already in progress/i)).toBeInTheDocument()

    // Switch to project B.
    mockActiveProject = projectB
    view.rerenderUi(<SettingsPageContent />)

    expect(await screen.findByText("Project B")).toBeInTheDocument()
    expect(screen.queryByText(/scraping already in progress/i)).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /start recrawl/i })).toBeEnabled()
    // Same account, same allowance — and still project-independent.
    expect(screen.getByText("2 manual recrawls remaining")).toBeInTheDocument()
    // Weekly Recheck reflects B's own setting (manual → OFF), not A's (weekly → ON).
    expect(screen.getByRole("switch", { name: /toggle weekly recheck/i })).not.toBeChecked()
    // The audit call for B (if the user starts one) targets B, never A.
    apiService.startAudit.mockClear()
    apiService.startAudit.mockResolvedValue({ success: true, data: {} })
    await startRecrawlViaDialog()
    await waitFor(() => expect(apiService.startAudit).toHaveBeenCalledWith("proj-b"))
  })
})
