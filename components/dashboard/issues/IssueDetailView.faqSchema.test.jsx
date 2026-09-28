import { describe, test, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import IssueDetailView from "./IssueDetailView"
import apiService from "@/lib/apiService"

/**
 * FAQ schema through Apply-via-WordPress. Real IssueDetailView + real
 * DIYRenderer + real FaqSchemaApplyDialog + a real QueryClient; only the
 * network layer (apiService / dashboard query hooks) is mocked — same approach
 * as IssueDetailView.wordpressApply.test.jsx.
 */

let pageResolutionData
let pageResolutionLoading = false
let pageResolutionError = false

vi.mock("@/contexts/ProjectContext", () => ({
  useProject: () => ({ activeProject: { _id: "project-1", main_url: "https://example.com" } }),
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
let wpCapabilitiesData
let linkedRecommendationData
const seoDataOptionsSpy = vi.fn()
const linkMutationSpy = vi.fn().mockResolvedValue({ success: true })

vi.mock("@/hooks/useDashboardQueries", () => ({
  useIssueUrls: () => ({ data: null, isLoading: false }),
  useActiveTaskUrls: () => ({ data: { data: { taskMap: taskMapData, fixedUrls: [], fixedCount: 0 } } }),
  useWordPressCapabilities: () => ({ data: { data: wpCapabilitiesData } }),
  useWordPressSiteSchema: () => ({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() }),
  useWordPressPageResolution: () => ({ data: pageResolutionData ? { data: pageResolutionData } : undefined, isLoading: pageResolutionLoading, isError: pageResolutionError }),
  // Page-content (H1) eligibility — not exercised by this file (its issues are not h1_missing).
  useWordPressH1Context: () => ({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() }),
  useWordPressSeoData: (_projectId, _url, options) => {
    seoDataOptionsSpy(options)
    return { data: undefined, isLoading: false, isError: false }
  },
  useLinkTaskRecommendation: () => ({ mutate: linkMutationSpy, isPending: false }),
  useRecommendationById: () => ({ data: linkedRecommendationData, isLoading: false }),
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

const PAGE_URL = "https://example.com/faq"

const PAIRS = [
  { question: "What is SEO?", answer: "SEO is the practice of improving search visibility." },
  { question: "How long does it take?", answer: "Usually three to six months." },
]
const JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PAIRS.map((p) => ({ "@type": "Question", name: p.question, acceptedAnswer: { "@type": "Answer", text: p.answer } })),
}, null, 2)

const BRIDGE_WITH_FAQ = {
  connected: true, provider: "rank_math", providerLabel: "Rank Math", providers: ["rank_math"],
  ambiguous: false, bridgeRequired: false, bridgeInstalled: true, bridgeActive: true, bridgeVersionSupported: true,
  faqSchemaSupported: true,
  // Shape the real /capabilities response carries (backend BRIDGE_CAPABILITY_MIN_VERSIONS).
  bridgeRequirements: { robots: "1.1.0", site_schema: "1.1.0", faq_schema: "1.2.0", rating_schema: "1.3.0" },
  capabilities: { title: { read: true, write: true }, metaDescription: { read: true, write: true }, canonical: { read: true, write: true } },
}

function renderView() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <IssueDetailView
        issue={{ issue_code: "faq_schema", title: "FAQ schema missing", affected_urls: [PAGE_URL] }}
        initialSelUrl={PAGE_URL}
        initialMode="diy"
      />
    </QueryClientProvider>
  )
}

function withLinkedTask() {
  taskMapData = { [PAGE_URL]: { _id: "task-1", status: "task_created", recommendationId: "rec-1" } }
  linkedRecommendationData = { data: { _id: "rec-1", ruleId: "faq_schema", sections: { recommendedVersion: JSON_LD, implementationExample: { type: "html", content: "<script></script>" } } } }
}

beforeEach(() => {
  vi.clearAllMocks()
  taskMapData = {}
  wpCapabilitiesData = BRIDGE_WITH_FAQ
  linkedRecommendationData = null
  pageResolutionData = undefined
  pageResolutionLoading = false
  pageResolutionError = false
})

describe("IssueDetailView — FAQ schema: the page must resolve to a WordPress page/post before Apply", () => {
  const openDialog = async () => {
    withLinkedTask()
    renderView()
    fireEvent.click(await screen.findByText("Apply via WordPress"))
    return screen.findByRole("dialog", { name: "Apply FAQ schema" })
  }

  test("a resolved page (the site's front page) shows what it resolved to and Apply is available", async () => {
    pageResolutionData = { resolved: true, postId: 8, postType: "page", isFrontPage: true, permalink: "https://naxonify.com/" }
    const dialog = await openDialog()
    expect(within(dialog).getByTestId("page-resolution")).toHaveTextContent("WordPress page #8 (site front page)")
    expect(within(dialog).getByRole("button", { name: "Apply Fix" })).toBeEnabled()
  })

  test("an unresolved page shows the resolver's specific reason and keeps Apply disabled", async () => {
    pageResolutionData = { resolved: false, reason: "front_page_is_posts_index", message: "This site's homepage shows the latest posts (a blog index) rather than a single WordPress page." }
    const dialog = await openDialog()
    expect(within(dialog).getByTestId("page-resolution")).toHaveTextContent(/homepage shows the latest posts/)
    expect(within(dialog).getByRole("button", { name: "Apply Fix" })).toBeDisabled()
    fireEvent.click(within(dialog).getByRole("button", { name: "Apply Fix" }))
    expect(apiService.applyWordPressFix).not.toHaveBeenCalled()
    expect(within(dialog).queryByText("This page could not be resolved to a WordPress post or page.")).not.toBeInTheDocument()
  })

  test("while the page is being checked Apply is disabled", async () => {
    pageResolutionLoading = true
    const dialog = await openDialog()
    expect(within(dialog).getByTestId("page-resolution")).toHaveTextContent("Checking this page in WordPress…")
    expect(within(dialog).getByRole("button", { name: "Apply Fix" })).toBeDisabled()
  })

  test("if the check itself fails, Apply stays disabled and says so", async () => {
    pageResolutionError = true
    const dialog = await openDialog()
    expect(within(dialog).getByTestId("page-resolution")).toHaveTextContent(/Could not check this page in WordPress/)
    expect(within(dialog).getByRole("button", { name: "Apply Fix" })).toBeDisabled()
  })
})

describe("IssueDetailView — FAQ schema: Apply via WordPress", () => {
  test("offered when the Bridge supports FAQ schema and the task has its recommendation; the button says FAQ schema", async () => {
    withLinkedTask()
    renderView()

    expect(await screen.findByText("Apply via WordPress")).toBeInTheDocument()
    expect(screen.getByText(/Odito can write this FAQ schema directly to your connected/)).toBeInTheDocument()
  })

  test("the confirmation dialog previews the exact FAQPage JSON-LD before anything is applied — and reads no SEO-plugin value", async () => {
    withLinkedTask()
    renderView()

    fireEvent.click(await screen.findByText("Apply via WordPress"))

    const dialog = await screen.findByRole("dialog", { name: "Apply FAQ schema" })
    const preview = within(dialog).getByTestId("faq-schema-preview")
    expect(preview.textContent).toBe(JSON_LD)
    expect(within(dialog).getByText(/Only this page changes/)).toBeInTheDocument()
    expect(within(dialog).getByText(/nothing was added or reworded/)).toBeInTheDocument()
    expect(apiService.applyWordPressFix).not.toHaveBeenCalled()

    // The live SEO-field read used by title/meta/canonical must stay disabled.
    const options = seoDataOptionsSpy.mock.calls.map(([o]) => o)
    expect(options.length).toBeGreaterThan(0)
    expect(options.every((o) => o?.enabled === false)).toBe(true)
  })

  test("Apply Fix sends ONLY { approved } — no client-supplied schema, value or expectedCurrentValue", async () => {
    withLinkedTask()
    apiService.applyWordPressFix.mockResolvedValue({ success: true, data: { alreadyApplied: false, immediateVerification: "success" } })
    renderView()

    fireEvent.click(await screen.findByText("Apply via WordPress"))
    fireEvent.click(await screen.findByRole("button", { name: "Apply Fix" }))

    await waitFor(() => expect(apiService.applyWordPressFix).toHaveBeenCalledTimes(1))
    const [taskId, payload] = apiService.applyWordPressFix.mock.calls[0]
    expect(taskId).toBe("task-1")
    expect(Object.keys(payload)).toEqual(["approved"])
    expect(payload.approved).toBe(true)
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Apply FAQ schema" })).not.toBeInTheDocument())
  })

  test("works when several SEO plugins are active — FAQ schema does not depend on the SEO provider", async () => {
    withLinkedTask()
    wpCapabilitiesData = { ...BRIDGE_WITH_FAQ, provider: "multiple", providers: ["rank_math", "yoast"], ambiguous: true, capabilities: null }
    renderView()

    expect(await screen.findByText("Apply via WordPress")).toBeInTheDocument()
  })

  test("no Bridge installed: not offered, and the reason names the Bridge plugin specifically", async () => {
    withLinkedTask()
    wpCapabilitiesData = { ...BRIDGE_WITH_FAQ, bridgeInstalled: false, bridgeActive: false, bridgeRequired: true, faqSchemaSupported: false }
    renderView()

    await waitFor(() => expect(screen.getByText(/requires the Odito SEO Bridge plugin/)).toBeInTheDocument())
    expect(screen.queryByText("Apply via WordPress")).not.toBeInTheDocument()
  })

  test("an older Bridge without FAQ support: not offered, and the reason says which version is needed", async () => {
    withLinkedTask()
    wpCapabilitiesData = { ...BRIDGE_WITH_FAQ, faqSchemaSupported: false }
    renderView()

    await waitFor(() => expect(screen.getByText(/requires Odito SEO Bridge 1\.2\.0 or newer/)).toBeInTheDocument())
    expect(screen.queryByText("Apply via WordPress")).not.toBeInTheDocument()
  })

  test("the required version comes from the backend requirements, and the installed version is named (the 1.1.0-vs-1.2.0 report)", async () => {
    withLinkedTask()
    wpCapabilitiesData = { ...BRIDGE_WITH_FAQ, faqSchemaSupported: false, bridgeVersion: "1.1.0", bridgeRequirements: { faq_schema: "2.4.0" } }
    renderView()

    await waitFor(() => expect(screen.getByText(/requires Odito SEO Bridge 2\.4\.0 or newer \(this site has 1\.1\.0\)/)).toBeInTheDocument())
  })

  test("without backend requirements it never invents a version number", async () => {
    withLinkedTask()
    wpCapabilitiesData = { ...BRIDGE_WITH_FAQ, faqSchemaSupported: false, bridgeRequirements: undefined }
    renderView()

    await waitFor(() => expect(screen.getByText(/requires a newer version of Odito SEO Bridge/)).toBeInTheDocument())
    expect(screen.queryByText(/\d+\.\d+\.\d+ or newer/)).not.toBeInTheDocument()
  })

  test("a linked recommendation that is not a valid FAQPage cannot be applied", async () => {
    withLinkedTask()
    linkedRecommendationData = { data: { _id: "rec-1", ruleId: "faq_schema", sections: { recommendedVersion: "Add FAQPage schema markup to your FAQ content." } } }
    renderView()

    fireEvent.click(await screen.findByText("Apply via WordPress"))
    expect(await screen.findByText(/does not contain a valid FAQPage schema/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Apply Fix" })).toBeDisabled()
  })

  test("FAQ_CONTENT_CHANGED: shows the backend's message, offers 'Regenerate from current page' instead of a doomed retry, and regenerating closes the dialog and requests a new recommendation", async () => {
    withLinkedTask()
    apiService.applyWordPressFix.mockRejectedValue(
      Object.assign(new Error("The FAQ on this page no longer matches the generated schema. Generate the recommendation again from the current page content, then apply it."), {
        status: 409, code: "FAQ_CONTENT_CHANGED", details: { field: "faq_schema", regenerateRequired: true },
      })
    )
    apiService.request.mockResolvedValue({ success: true, data: { id: "rec-2", sections: {} }, meta: {} })
    renderView()

    fireEvent.click(await screen.findByText("Apply via WordPress"))
    fireEvent.click(await screen.findByRole("button", { name: "Apply Fix" }))

    expect(await screen.findByText(/no longer matches the generated schema/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Apply Fix" })).not.toBeInTheDocument()
    // Not the live-value refresh flow — that can never fix stale FAQ content.
    expect(screen.queryByRole("button", { name: "Refresh Live Value" })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Regenerate from current page" }))

    await waitFor(() => expect(apiService.request).toHaveBeenCalledTimes(1))
    const [path, init] = apiService.request.mock.calls[0]
    expect(path).toBe("/recommendations/generate")
    const body = JSON.parse(init.body)
    expect(body).toMatchObject({ projectId: "project-1", issueId: "faq_schema", pageUrl: PAGE_URL })
    // The server re-reads the page's FAQ itself; the client never supplies pairs.
    expect(JSON.stringify(body)).not.toContain("What is SEO?")
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Apply FAQ schema" })).not.toBeInTheDocument())
  })
})
