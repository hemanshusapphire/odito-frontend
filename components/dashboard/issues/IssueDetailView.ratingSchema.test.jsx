import { describe, test, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import IssueDetailView from "./IssueDetailView"
import apiService from "@/lib/apiService"

/**
 * AggregateRating through Apply-via-WordPress. Real IssueDetailView + real
 * DIYRenderer + real RatingSchemaApplyDialog + a real QueryClient; only the
 * network layer is mocked (same approach as IssueDetailView.faqSchema.test.jsx).
 */

let pageResolutionData

vi.mock("@/contexts/ProjectContext", () => ({
  useProject: () => ({ activeProject: { _id: "project-1", main_url: "https://example.com" } }),
}))
vi.mock("@/lib/socketService", () => ({
  default: { onTaskImplemented: vi.fn(), onTaskVerified: vi.fn(), onTaskReopened: vi.fn(), offTaskImplemented: vi.fn(), offTaskVerified: vi.fn(), offTaskReopened: vi.fn(), joinProject: vi.fn() },
}))
vi.mock("@/components/recommendations", () => ({ IssueRecommendationPanel: () => <div data-testid="ai-recommendation-panel" /> }))
vi.mock("@/components/issue-context/CurrentStateRenderer", () => ({ default: () => <div data-testid="current-state-renderer" /> }))

let taskMapData
let wpCapabilitiesData
let linkedRecommendationData
const seoDataOptionsSpy = vi.fn()
const linkMutationSpy = vi.fn().mockResolvedValue({ success: true })

vi.mock("@/hooks/useDashboardQueries", () => ({
  useIssueUrls: () => ({ data: null, isLoading: false }),
  useActiveTaskUrls: () => ({ data: { data: { taskMap: taskMapData, fixedUrls: [], fixedCount: 0 } } }),
  useWordPressCapabilities: () => ({ data: { data: wpCapabilitiesData } }),
  useWordPressSiteSchema: () => ({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() }),
  // Page-content (H1) eligibility — not exercised by this file (its issues are not h1_missing).
  useWordPressPageResolution: () => ({ data: pageResolutionData, isLoading: false, isError: false }),
  useWordPressH1Context: () => ({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() }),
  useWordPressSeoData: (_p, _u, options) => { seoDataOptionsSpy(options); return { data: undefined, isLoading: false, isError: false } },
  useLinkTaskRecommendation: () => ({ mutate: linkMutationSpy, isPending: false }),
  useRecommendationById: () => ({ data: linkedRecommendationData, isLoading: false }),
}))
vi.mock("@/lib/apiService", () => ({
  default: {
    getIssueContext: vi.fn().mockResolvedValue({ success: true, data: null }),
    request: vi.fn(), createTask: vi.fn(), applyWordPressFix: vi.fn(), linkTaskRecommendation: vi.fn(), getRecommendationById: vi.fn(),
  },
}))

const PAGE_URL = "https://example.com/seo"
const JSON_LD = JSON.stringify({
  "@context": "https://schema.org", "@type": "Service", "@id": "https://example.com/seo/#service", name: "SEO Service",
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "127", bestRating: "5" },
}, null, 2)

const BRIDGE = {
  connected: true, provider: "rank_math", providerLabel: "Rank Math", providers: ["rank_math"], ambiguous: false, bridgeRequired: false,
  bridgeInstalled: true, bridgeActive: true, bridgeVersionSupported: true, faqSchemaSupported: true, ratingSchemaSupported: true,
  bridgeRequirements: { robots: "1.1.0", site_schema: "1.1.0", faq_schema: "1.2.0", rating_schema: "1.3.0" },
  capabilities: { title: { read: true, write: true } },
}

function renderView() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <IssueDetailView issue={{ issue_code: "aggregate_rating_schema", title: "AggregateRating Schema Missing", affected_urls: [PAGE_URL] }} initialSelUrl={PAGE_URL} initialMode="diy" />
    </QueryClientProvider>
  )
}

function withLinkedTask() {
  taskMapData = { [PAGE_URL]: { _id: "task-1", status: "task_created", recommendationId: "rec-1" } }
  linkedRecommendationData = { data: { _id: "rec-1", ruleId: "aggregate_rating_schema", sections: { recommendedVersion: JSON_LD, implementationExample: { type: "html", content: "<script></script>" } } } }
}

beforeEach(() => {
  vi.clearAllMocks()
  taskMapData = {}
  wpCapabilitiesData = BRIDGE
  linkedRecommendationData = null
})

describe("IssueDetailView — AggregateRating: Apply via WordPress", () => {
  test("offered when the Bridge supports rating schema and the task has its recommendation; label keeps its casing", async () => {
    withLinkedTask()
    renderView()
    expect(await screen.findByText("Apply via WordPress")).toBeInTheDocument()
    expect(screen.getByText(/Odito can write this AggregateRating schema directly to your connected/)).toBeInTheDocument()
  })

  test("the dialog previews the exact generated JSON-LD and states what it is built from; no SEO-plugin value is read", async () => {
    withLinkedTask()
    renderView()
    fireEvent.click(await screen.findByText("Apply via WordPress"))

    const dialog = await screen.findByRole("dialog", { name: "Apply AggregateRating schema" })
    expect(within(dialog).getByTestId("rating-schema-preview").textContent).toBe(JSON_LD)
    expect(within(dialog).getByText("Generated schema preview")).toBeInTheDocument()
    expect(dialog).toHaveTextContent("4.8 out of 5 from 127 reviews")
    expect(dialog).toHaveTextContent("existing Service “SEO Service”")
    expect(dialog).toHaveTextContent("nothing was estimated")
    expect(apiService.applyWordPressFix).not.toHaveBeenCalled()
    expect(seoDataOptionsSpy.mock.calls.every(([o]) => o?.enabled === false)).toBe(true)
  })

  test("Apply Fix sends ONLY { approved } — no client-supplied schema or rating", async () => {
    withLinkedTask()
    apiService.applyWordPressFix.mockResolvedValue({ success: true, data: { alreadyApplied: false, immediateVerification: "success" } })
    renderView()
    fireEvent.click(await screen.findByText("Apply via WordPress"))
    fireEvent.click(await screen.findByRole("button", { name: "Apply Fix" }))

    await waitFor(() => expect(apiService.applyWordPressFix).toHaveBeenCalledTimes(1))
    const [taskId, payload] = apiService.applyWordPressFix.mock.calls[0]
    expect(taskId).toBe("task-1")
    expect(Object.keys(payload)).toEqual(["approved"])
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Apply AggregateRating schema" })).not.toBeInTheDocument())
  })

  test("FAQ support alone is not enough: a Bridge with FAQ but no rating support names the version needed", async () => {
    withLinkedTask()
    wpCapabilitiesData = { ...BRIDGE, ratingSchemaSupported: false }
    renderView()
    await waitFor(() => expect(screen.getByText(/Applying AggregateRating schema through WordPress requires Odito SEO Bridge 1\.3\.0 or newer/)).toBeInTheDocument())
    expect(screen.queryByText("Apply via WordPress")).not.toBeInTheDocument()
  })

  test("no Bridge installed: not offered, the reason names the plugin", async () => {
    withLinkedTask()
    wpCapabilitiesData = { ...BRIDGE, bridgeInstalled: false, bridgeActive: false, bridgeRequired: true, faqSchemaSupported: false, ratingSchemaSupported: false }
    renderView()
    await waitFor(() => expect(screen.getByText(/Applying AggregateRating schema through WordPress requires the Odito SEO Bridge plugin/)).toBeInTheDocument())
    expect(screen.queryByText("Apply via WordPress")).not.toBeInTheDocument()
  })

  test("works with several SEO plugins active — independent of the SEO provider", async () => {
    withLinkedTask()
    wpCapabilitiesData = { ...BRIDGE, provider: "multiple", providers: ["rank_math", "yoast"], ambiguous: true, capabilities: null }
    renderView()
    expect(await screen.findByText("Apply via WordPress")).toBeInTheDocument()
  })

  test("a linked recommendation that is not a valid rating schema cannot be applied", async () => {
    withLinkedTask()
    linkedRecommendationData = { data: { _id: "rec-1", ruleId: "aggregate_rating_schema", sections: { recommendedVersion: "Add AggregateRating schema with ratingValue and reviewCount." } } }
    renderView()
    fireEvent.click(await screen.findByText("Apply via WordPress"))
    expect(await screen.findByText(/does not contain a valid AggregateRating schema/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Apply Fix" })).toBeDisabled()
  })

  test("RATING_CONTENT_CHANGED: the backend's message, 'Regenerate from current page' instead of a doomed retry, and regenerating requests a new recommendation without client-supplied values", async () => {
    withLinkedTask()
    apiService.applyWordPressFix.mockRejectedValue(
      Object.assign(new Error("The rating on this page, or the schema entity it belongs to, no longer matches the generated schema. Generate the recommendation again from the current page content, then apply it."), {
        status: 409, code: "RATING_CONTENT_CHANGED", details: { field: "aggregate_rating", regenerateRequired: true },
      })
    )
    apiService.request.mockResolvedValue({ success: true, data: { id: "rec-2", sections: {} }, meta: {} })
    renderView()

    fireEvent.click(await screen.findByText("Apply via WordPress"))
    fireEvent.click(await screen.findByRole("button", { name: "Apply Fix" }))

    expect(await screen.findByText(/no longer matches the generated schema/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Apply Fix" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Refresh Live Value" })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Regenerate from current page" }))
    await waitFor(() => expect(apiService.request).toHaveBeenCalledTimes(1))
    const [path, init] = apiService.request.mock.calls[0]
    expect(path).toBe("/recommendations/generate")
    const body = JSON.parse(init.body)
    expect(body).toMatchObject({ projectId: "project-1", issueId: "aggregate_rating_schema", pageUrl: PAGE_URL })
    expect(JSON.stringify(body)).not.toContain("4.8")
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Apply AggregateRating schema" })).not.toBeInTheDocument())
  })
})
