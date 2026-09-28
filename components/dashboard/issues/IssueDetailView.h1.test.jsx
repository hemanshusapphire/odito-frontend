import { describe, test, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import IssueDetailView from "./IssueDetailView"
import apiService from "@/lib/apiService"

/**
 * "Apply via WordPress" for a missing H1. An H1 is page CONTENT, so eligibility comes from the
 * backend's per-page builder adapter (GET /wordpress/h1-context), never from the SEO plugin. This
 * exercises the REAL IssueDetailView + DIYRenderer + H1ApplyDialog with a real QueryClient; only the
 * network-facing hooks/apiService are mocked.
 */

let pageResolutionData

vi.mock("@/contexts/ProjectContext", () => ({
  useProject: () => ({ activeProject: { _id: "project-1", main_url: "https://naxonify.com" } }),
}))

vi.mock("@/lib/socketService", () => ({
  default: {
    onTaskImplemented: vi.fn(), onTaskVerified: vi.fn(), onTaskReopened: vi.fn(),
    offTaskImplemented: vi.fn(), offTaskVerified: vi.fn(), offTaskReopened: vi.fn(),
    joinProject: vi.fn(),
  },
}))

vi.mock("@/components/recommendations", () => ({
  IssueRecommendationPanel: () => <div data-testid="ai-recommendation-panel" />,
}))

vi.mock("@/components/issue-context/CurrentStateRenderer", () => ({
  default: () => <div data-testid="current-state-renderer" />,
}))

let taskMapData
let linkedRecommendationData
let linkedRecommendationLoading
let h1ContextData
let h1ContextLoading
let h1ContextError
const refetchH1Context = vi.fn()
const h1HookCalls = []
const seoDataSpy = vi.fn()

vi.mock("@/hooks/useDashboardQueries", () => ({
  useIssueUrls: () => ({ data: null, isLoading: false }),
  useActiveTaskUrls: () => ({ data: { data: { taskMap: taskMapData, fixedUrls: [], fixedCount: 0 } } }),
  useWordPressCapabilities: () => ({ data: { data: { connected: true, provider: "rank_math", providerLabel: "Rank Math", ambiguous: false, bridgeRequired: false, capabilities: {} } } }),
  useWordPressSiteSchema: () => ({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() }),
  useWordPressPageResolution: () => ({ data: pageResolutionData, isLoading: false, isError: false }),
  useWordPressH1Context: (projectId, pageUrl, recommended, options) => {
    h1HookCalls.push({ projectId, pageUrl, recommended, options })
    return { data: h1ContextData ? { data: h1ContextData } : undefined, isLoading: h1ContextLoading, isError: h1ContextError, refetch: refetchH1Context }
  },
  useWordPressSeoData: (...args) => { seoDataSpy(...args); return { data: undefined, isLoading: false, isError: false } },
  useLinkTaskRecommendation: () => ({ mutate: vi.fn(), isPending: false }),
  useRecommendationById: () => ({ data: linkedRecommendationData, isLoading: linkedRecommendationLoading }),
}))

vi.mock("@/lib/apiService", () => ({
  default: {
    getIssueContext: vi.fn().mockResolvedValue({ success: true, data: null }),
    request: vi.fn(),
    createTask: vi.fn(),
    applyWordPressFix: vi.fn(),
    linkTaskRecommendation: vi.fn(),
    getRecommendationById: vi.fn(),
  },
}))

const PAGE = "https://naxonify.com/seo-reseller"
const RAW_RECOMMENDATION = "<h1>\n  SEO Reseller Services by Naxonify\n</h1>"
const FINGERPRINT = "c1ad5513295e2e05adcca70a41557391d2942e11c2492e0ceceba452bc7ac96e"

const DIVI_SUPPORTED = {
  supported: true,
  builder: { name: "divi", label: "Divi" },
  state: "missing",
  postId: 4721,
  fingerprint: FINGERPRINT,
  current: { h1Count: 0, h1Texts: [], state: "missing", pageTitle: "SEO Reseller" },
  plan: {
    strategy: "divi_promote_page_title_heading",
    summary: "The page-title heading in “Page Title Section” (currently an H2 reading “SEO Reseller”) becomes the page's H1 with the recommended text. No module is added or removed.",
    changes: ["Heading level H2 → H1", "Text: dynamic page title “SEO Reseller” → the recommended H1"],
  },
  recommended: { ok: true, text: "SEO Reseller Services by Naxonify" },
}

function renderView(issueCode = "h1_missing") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <IssueDetailView
        issue={{ issue_code: issueCode, title: "H1 Tag Missing", affected_urls: [PAGE] }}
        initialSelUrl={PAGE}
        initialMode="diy"
      />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  h1HookCalls.length = 0
  taskMapData = { [PAGE]: { _id: "task-1", status: "task_created", recommendationId: "rec-1" } }
  linkedRecommendationData = { data: { _id: "rec-1", sections: { contentRewrite: { optimized: RAW_RECOMMENDATION } } } }
  linkedRecommendationLoading = false
  h1ContextData = DIVI_SUPPORTED
  h1ContextLoading = false
  h1ContextError = false
})

const openDialog = async () => {
  fireEvent.click(await screen.findByText("Apply via WordPress"))
  return screen.findByRole("dialog", { name: "Apply H1 via WordPress" })
}

describe("h1_missing — when Apply via WordPress is offered", () => {
  test("a supported page (Divi) with a linked, applicable recommendation offers Apply via WordPress", async () => {
    renderView()
    expect(await screen.findByText("Apply via WordPress")).toBeInTheDocument()
    expect(screen.getByText(/directly in WordPress \(Divi\)/)).toBeInTheDocument()
  })

  test("the recommendation is passed to the context read only as a preview, and only once its link is known", async () => {
    renderView()
    await screen.findByText("Apply via WordPress")
    const last = h1HookCalls[h1HookCalls.length - 1]
    expect(last.pageUrl).toBe(PAGE)
    expect(last.recommended).toBe(RAW_RECOMMENDATION)
    expect(last.options.enabled).toBe(true)
  })

  test("the context is not requested while the task's recommendation is still loading", () => {
    linkedRecommendationData = null
    linkedRecommendationLoading = true
    renderView()
    expect(h1HookCalls.every((call) => call.options.enabled === false)).toBe(true)
    expect(screen.queryByText("Apply via WordPress")).not.toBeInTheDocument()
  })

  test("an unsupported builder is not offered, and the backend's reason is shown instead", () => {
    h1ContextData = {
      supported: false, builder: { name: "elementor", label: "Elementor" }, state: "unknown",
      reason: "This page is built with Elementor. Odito cannot change Elementor page data safely yet, so H1 changes are not applied automatically.",
    }
    renderView()
    expect(screen.queryByText("Apply via WordPress")).not.toBeInTheDocument()
    expect(screen.getByText(/built with Elementor/)).toBeInTheDocument()
  })

  test("a page that already has an H1 is not offered (never replaced)", () => {
    h1ContextData = { ...DIVI_SUPPORTED, supported: false, state: "present", reason: "The page already has an H1 (“Old heading”). Odito does not replace an existing H1 automatically." }
    renderView()
    expect(screen.queryByText("Apply via WordPress")).not.toBeInTheDocument()
    expect(screen.getByText(/already has an H1/)).toBeInTheDocument()
  })

  test("a recommendation that cannot be applied as plain text is not offered, with the reason", () => {
    h1ContextData = { ...DIVI_SUPPORTED, recommended: { ok: false, code: "SCRIPT", message: "The recommended H1 contains a script." } }
    renderView()
    expect(screen.queryByText("Apply via WordPress")).not.toBeInTheDocument()
    expect(screen.getByText(/The recommended H1 cannot be applied automatically: The recommended H1 contains a script\./)).toBeInTheDocument()
  })

  test("multiple_h1_tags is never offered, even for a page the adapter could handle", () => {
    renderView("multiple_h1_tags")
    expect(screen.queryByText("Apply via WordPress")).not.toBeInTheDocument()
    expect(h1HookCalls.every((call) => call.options.enabled === false)).toBe(true)
  })

  test("no task yet: not offered", () => {
    taskMapData = {}
    renderView()
    expect(screen.queryByText("Apply via WordPress")).not.toBeInTheDocument()
  })

  test("task without a linked recommendation: the 'generate one' message, not the Apply button", () => {
    taskMapData = { [PAGE]: { _id: "task-1", status: "task_created", recommendationId: null } }
    linkedRecommendationData = null
    renderView()
    expect(screen.queryByText("Apply via WordPress")).not.toBeInTheDocument()
    expect(screen.getByText(/No AI recommendation is linked to this task yet/)).toBeInTheDocument()
  })
})

describe("h1_missing — the confirmation dialog", () => {
  test("shows Current, Recommended (plain text), Target, Page builder, what changes, and the direct-edit warning", async () => {
    renderView()
    const dialog = await openDialog()

    expect(within(dialog).getByTestId("h1-current")).toHaveTextContent("No H1 found")
    expect(within(dialog).getByTestId("h1-recommended")).toHaveTextContent("SEO Reseller Services by Naxonify")
    expect(within(dialog).getByTestId("h1-recommended").textContent).not.toMatch(/<h1/i)
    expect(within(dialog).getByTestId("h1-target")).toHaveTextContent("H1")
    expect(within(dialog).getByTestId("h1-builder")).toHaveTextContent("Divi")
    expect(within(dialog).getByTestId("h1-plan")).toHaveTextContent("No module is added or removed")
    expect(within(dialog).getByText("This changes the page content directly.")).toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: "Apply via WordPress" })).toBeEnabled()
  })

  test("never reads an SEO-plugin value for an H1", async () => {
    renderView()
    await openDialog()
    expect(seoDataSpy.mock.calls.every(([, , options]) => options?.enabled === false)).toBe(true)
  })

  test("Apply sends ONLY the reviewed page fingerprint and approval — no content, value, post id or current value", async () => {
    apiService.applyWordPressFix.mockResolvedValue({ success: true, data: { alreadyApplied: false, immediateVerification: "success" } })
    renderView()
    const dialog = await openDialog()
    fireEvent.click(within(dialog).getByRole("button", { name: "Apply via WordPress" }))

    await waitFor(() => expect(apiService.applyWordPressFix).toHaveBeenCalledTimes(1))
    const [taskId, payload] = apiService.applyWordPressFix.mock.calls[0]
    expect(taskId).toBe("task-1")
    expect(payload).toEqual({ expectedContentFingerprint: FINGERPRINT, approved: true })
    expect(await screen.findByText(/H1 added to your page via WordPress — pending verification on next recrawl/)).toBeInTheDocument()
  })

  test("a write the live page does not confirm yet is reported as a warning, never as success", async () => {
    apiService.applyWordPressFix.mockResolvedValue({ success: true, data: { alreadyApplied: false, immediateVerification: "failed" } })
    renderView()
    const dialog = await openDialog()
    fireEvent.click(within(dialog).getByRole("button", { name: "Apply via WordPress" }))

    expect(await screen.findByText(/could not confirm it on the live page yet/)).toBeInTheDocument()
    expect(screen.queryByText(/H1 added to your page via WordPress/)).not.toBeInTheDocument()
  })

  test("a stale page (409 stale_current_value) replaces Apply with Refresh Page State — never an automatic retry", async () => {
    apiService.applyWordPressFix.mockRejectedValue(
      Object.assign(new Error("This page changed on WordPress after you reviewed it, so nothing was overwritten. Refresh and review it again."), {
        status: 409, code: "CONFLICT", details: { reason: "stale_current_value" },
      })
    )
    renderView()
    const dialog = await openDialog()
    fireEvent.click(within(dialog).getByRole("button", { name: "Apply via WordPress" }))

    const refresh = await within(dialog).findByRole("button", { name: "Refresh Page State" })
    expect(within(dialog).queryByRole("button", { name: "Apply via WordPress" })).not.toBeInTheDocument()
    expect(within(dialog).getByText(/changed on WordPress after you reviewed it/)).toBeInTheDocument()
    expect(apiService.applyWordPressFix).toHaveBeenCalledTimes(1)

    refetchH1Context.mockClear()
    fireEvent.click(refresh)
    expect(refetchH1Context).toHaveBeenCalledTimes(1)
    expect(apiService.applyWordPressFix).toHaveBeenCalledTimes(1)
  })
})
