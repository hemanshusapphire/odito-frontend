import { describe, test, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import IssueDetailView from "./IssueDetailView"
import apiService from "@/lib/apiService"

/**
 * sameAs (Organization social profiles) through Apply-via-WordPress: the site
 * owner ENTERS the URLs. Real IssueDetailView + real DIYRenderer + real
 * SameAsApplyDialog + a real QueryClient; only the network layer is mocked.
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
let wpCapabilitiesData
let siteSchemaData
let linkedRecommendationData
const refetchSiteSchema = vi.fn()

vi.mock("@/hooks/useDashboardQueries", () => ({
  useIssueUrls: () => ({ data: null, isLoading: false }),
  useActiveTaskUrls: () => ({ data: { data: { taskMap: taskMapData, fixedUrls: [], fixedCount: 0 } } }),
  useWordPressCapabilities: () => ({ data: { data: wpCapabilitiesData } }),
  useWordPressSiteSchema: () => ({ data: siteSchemaData, isLoading: false, isError: false, refetch: refetchSiteSchema }),
  // Page-content (H1) eligibility — not exercised by this file (its issues are not h1_missing).
  useWordPressPageResolution: () => ({ data: pageResolutionData, isLoading: false, isError: false }),
  useWordPressH1Context: () => ({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() }),
  useWordPressSeoData: () => ({ data: undefined, isLoading: false, isError: false }),
  useLinkTaskRecommendation: () => ({ mutate: vi.fn(), isPending: false }),
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

const PAGE_URL = "https://naxonify.com/contact-us"
const FB = "https://www.facebook.com/naxonify"
const YT = "https://www.youtube.com/@naxonify"
const LI = "https://www.linkedin.com/company/naxonify"

// Exactly what the AI is told to say when no profile URL exists in its context.
const NO_URL_RECOMMENDATION = "not provided in context — the site owner must supply their own real, verified social profile URLs before this field can be populated"

const CAPABILITIES = {
  connected: true, provider: "rank_math", providerLabel: "Rank Math", providers: ["rank_math"],
  ambiguous: false, bridgeRequired: false, bridgeInstalled: true, bridgeActive: true, bridgeVersionSupported: true,
  capabilities: { title: { read: true, write: true } },
}
const SITE_SCHEMA = (org = {}) => ({
  data: { supported: true, provider: "rank_math", organization: { protectedSameAs: [], additionalSameAs: [], ...org }, breadcrumbs: { enabled: false } },
})

function renderView() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <IssueDetailView
        issue={{ issue_code: "sameas_array", title: "Organization schema missing sameAs array", affected_urls: [PAGE_URL] }}
        initialSelUrl={PAGE_URL}
        initialMode="diy"
      />
    </QueryClientProvider>
  )
}

const openDialog = async () => {
  fireEvent.click(await screen.findByText("Apply via WordPress"))
  return screen.findByRole("dialog", { name: "Add social profiles to Organization schema" })
}

beforeEach(() => {
  vi.clearAllMocks()
  wpCapabilitiesData = CAPABILITIES
  siteSchemaData = SITE_SCHEMA()
  taskMapData = { [PAGE_URL]: { _id: "task-1", status: "task_created", recommendationId: "rec-1" } }
  linkedRecommendationData = { data: { _id: "rec-1", ruleId: "sameas_array", sections: { recommendedVersion: NO_URL_RECOMMENDATION, contentRewrite: { optimized: NO_URL_RECOMMENDATION } } } }
})

describe("IssueDetailView — sameAs: the site owner enters the profile URLs", () => {
  test("the card no longer promises 'no manual editing required'; it says the owner must enter their own URLs", async () => {
    renderView()
    expect(await screen.findByText("Apply via WordPress")).toBeInTheDocument()
    expect(screen.getByText(/Enter your own verified social profile URLs/)).toBeInTheDocument()
    expect(screen.queryByText(/no manual editing required/)).not.toBeInTheDocument()
  })

  test("the recommendation's 'not provided in context' text never reaches the dialog — the owner gets an input instead, and nothing is pre-filled", async () => {
    renderView()
    const dialog = await openDialog()
    expect(within(dialog).queryByText(/not provided in context/)).not.toBeInTheDocument()
    expect(within(dialog).getByLabelText("LinkedIn profile URL")).toHaveValue("")
    expect(within(dialog).getByText(/Add your verified social profile URLs below/)).toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: /Apply via WordPress/ })).toBeDisabled()
  })

  test("the owner sees every common platform (not just LinkedIn), all optional, all empty", async () => {
    renderView()
    const dialog = await openDialog()
    for (const label of ["Facebook", "Instagram", "LinkedIn", "X / Twitter", "YouTube", "TikTok", "Pinterest"]) {
      expect(within(dialog).getByLabelText(`${label} profile URL`)).toHaveValue("")
    }
    expect(within(dialog).getByLabelText("Other profile URL 1")).toHaveValue("")
    expect(within(dialog).getByText(/All fields are optional/)).toBeInTheDocument()
  })

  test("several platforms + a custom URL: the backend receives ALL of them as a flat, normalized list — and nothing platform- or storage-specific", async () => {
    siteSchemaData = SITE_SCHEMA({ protectedSameAs: [FB], additionalSameAs: [YT] })
    apiService.applyWordPressFix.mockResolvedValue({
      success: true,
      data: { alreadyApplied: false, immediateVerification: "success", sameAs: { added: [], additionalProfiles: [] } },
    })
    renderView()
    const dialog = await openDialog()

    // The existing protected Facebook and saved YouTube show in their own cards.
    expect(within(dialog).getByTestId("sameas-protected-facebook")).toHaveTextContent(FB)
    expect(within(dialog).getByTestId("sameas-saved-youtube")).toHaveTextContent(YT)

    fireEvent.change(within(dialog).getByLabelText("Instagram profile URL"), { target: { value: "https://instagram.com/naxonify" } })
    fireEvent.change(within(dialog).getByLabelText("LinkedIn profile URL"), { target: { value: "https://linkedin.com/company/naxonify/" } })
    fireEvent.change(within(dialog).getByLabelText("X / Twitter profile URL"), { target: { value: "https://x.com/naxonify" } })
    fireEvent.change(within(dialog).getByLabelText("Other profile URL 1"), { target: { value: "https://www.behance.net/naxonify" } })
    fireEvent.click(within(dialog).getByRole("button", { name: /Apply via WordPress/ }))

    await waitFor(() => expect(apiService.applyWordPressFix).toHaveBeenCalledTimes(1))
    const [taskId, sent] = apiService.applyWordPressFix.mock.calls[0]
    expect(taskId).toBe("task-1")
    expect(sent).toEqual({
      approved: true,
      additionalProfiles: [
        "https://instagram.com/naxonify",
        "https://linkedin.com/company/naxonify",
        "https://x.com/naxonify",
        "https://www.behance.net/naxonify",
      ],
      removeProfiles: [],
      // The existing additional profile is reported (for stale detection), never re-sent as an addition.
      expectedAdditionalProfiles: [YT],
    })
    expect(JSON.stringify(sent)).not.toContain(FB)
  })

  test("a URL in the wrong platform field still applies (warning only), and is sent unchanged", async () => {
    apiService.applyWordPressFix.mockResolvedValue({ success: true, data: { alreadyApplied: false, immediateVerification: "success", sameAs: { added: [] } } })
    renderView()
    const dialog = await openDialog()
    fireEvent.change(within(dialog).getByLabelText("Facebook profile URL"), { target: { value: "https://instagram.com/naxonify" } })
    expect(within(dialog).getByRole("status")).toHaveTextContent("This URL does not appear to be a Facebook URL. Please verify it.")
    fireEvent.click(within(dialog).getByRole("button", { name: /Apply via WordPress/ }))
    await waitFor(() => expect(apiService.applyWordPressFix).toHaveBeenCalledTimes(1))
    expect(apiService.applyWordPressFix.mock.calls[0][1].additionalProfiles).toEqual(["https://instagram.com/naxonify"])
  })

  test("applying sends the owner's URL and the list they were shown — and nothing else that could pick a storage location", async () => {
    siteSchemaData = SITE_SCHEMA({ protectedSameAs: [FB], additionalSameAs: [YT] })
    apiService.applyWordPressFix.mockResolvedValue({
      success: true,
      data: { alreadyApplied: false, immediateVerification: "success", sameAs: { added: [LI], additionalProfiles: [YT, LI] } },
    })
    renderView()
    const dialog = await openDialog()

    fireEvent.change(within(dialog).getByLabelText("LinkedIn profile URL"), { target: { value: `${LI}/` } })
    fireEvent.click(within(dialog).getByRole("button", { name: /Apply via WordPress/ }))

    await waitFor(() => expect(apiService.applyWordPressFix).toHaveBeenCalledTimes(1))
    const [taskId, payload] = apiService.applyWordPressFix.mock.calls[0]
    expect(taskId).toBe("task-1")
    expect(payload).toEqual({
      approved: true,
      additionalProfiles: [LI],
      removeProfiles: [],
      expectedAdditionalProfiles: [YT],
    })
    expect("expectedCurrentValue" in payload).toBe(false)
  })

  test("success is 'Social profile added to WordPress. Verification pending.' — never 'fixed'", async () => {
    apiService.applyWordPressFix.mockResolvedValue({ success: true, data: { alreadyApplied: false, immediateVerification: "success", sameAs: { added: [LI] } } })
    renderView()
    const dialog = await openDialog()
    fireEvent.change(within(dialog).getByLabelText("LinkedIn profile URL"), { target: { value: LI } })
    fireEvent.click(within(dialog).getByRole("button", { name: /Apply via WordPress/ }))

    const toast = await screen.findByText("Social profile added to WordPress. Verification pending.")
    expect(toast.textContent).not.toMatch(/fixed|verified/i)
    await waitFor(() => expect(screen.queryByRole("dialog", { name: /social profiles/i })).not.toBeInTheDocument())
  })

  test("plural wording when several were added", async () => {
    apiService.applyWordPressFix.mockResolvedValue({ success: true, data: { alreadyApplied: false, immediateVerification: "success", sameAs: { added: [LI, YT] } } })
    renderView()
    const dialog = await openDialog()
    fireEvent.change(within(dialog).getByLabelText("LinkedIn profile URL"), { target: { value: LI } })
    fireEvent.change(within(dialog).getByLabelText("YouTube profile URL"), { target: { value: YT } })
    fireEvent.click(within(dialog).getByRole("button", { name: /Apply via WordPress/ }))

    expect(await screen.findByText("Social profiles added to WordPress. Verification pending.")).toBeInTheDocument()
    expect(apiService.applyWordPressFix.mock.calls[0][1].additionalProfiles).toEqual([LI, YT])
  })

  test("WordPress accepted it but read-back did not confirm: a warning, never the success wording", async () => {
    apiService.applyWordPressFix.mockResolvedValue({ success: true, data: { alreadyApplied: false, immediateVerification: "failed", sameAs: { added: [LI] } } })
    renderView()
    const dialog = await openDialog()
    fireEvent.change(within(dialog).getByLabelText("LinkedIn profile URL"), { target: { value: LI } })
    fireEvent.click(within(dialog).getByRole("button", { name: /Apply via WordPress/ }))

    expect(await screen.findByText(/could not confirm the saved profiles match what you entered/)).toBeInTheDocument()
    expect(screen.queryByText("Social profile added to WordPress. Verification pending.")).not.toBeInTheDocument()
  })

  test("already-present profiles: 'no change needed', still pending verification", async () => {
    apiService.applyWordPressFix.mockResolvedValue({ success: true, data: { alreadyApplied: true, immediateVerification: "success", sameAs: { added: [], alreadyPresent: [LI] } } })
    renderView()
    const dialog = await openDialog()
    fireEvent.change(within(dialog).getByLabelText("LinkedIn profile URL"), { target: { value: LI } })
    fireEvent.click(within(dialog).getByRole("button", { name: /Apply via WordPress/ }))

    expect(await screen.findByText(/already in your Organization schema — no change needed. Verification pending/)).toBeInTheDocument()
  })

  test("a backend validation rejection stays in the dialog with the backend's reason, and the owner's input is kept", async () => {
    const error = Object.assign(new Error("URL must not contain a username or password."), { status: 400, code: "INVALID_PROFILES" })
    apiService.applyWordPressFix.mockRejectedValue(error)
    renderView()
    const dialog = await openDialog()
    fireEvent.change(within(dialog).getByLabelText("LinkedIn profile URL"), { target: { value: LI } })
    fireEvent.click(within(dialog).getByRole("button", { name: /Apply via WordPress/ }))

    expect(await within(dialog).findByText("URL must not contain a username or password.")).toBeInTheDocument()
    expect(within(dialog).getByLabelText("LinkedIn profile URL")).toHaveValue(LI)
    expect(within(dialog).getByRole("button", { name: /Apply via WordPress/ })).toBeEnabled()
  })

  test("a stale-list conflict offers 'Refresh Live Value' (which refetches the site schema) and keeps the typed URL", async () => {
    const error = Object.assign(new Error("The social profiles on WordPress have changed since this dialog was opened."), { status: 409, code: "CONFLICT" })
    apiService.applyWordPressFix.mockRejectedValue(error)
    renderView()
    const dialog = await openDialog()
    fireEvent.change(within(dialog).getByLabelText("LinkedIn profile URL"), { target: { value: LI } })
    fireEvent.click(within(dialog).getByRole("button", { name: /Apply via WordPress/ }))

    const refresh = await within(dialog).findByRole("button", { name: "Refresh Live Value" })
    expect(within(dialog).getByLabelText("LinkedIn profile URL")).toHaveValue(LI)
    refetchSiteSchema.mockClear()
    fireEvent.click(refresh)
    await waitFor(() => expect(within(dialog).getByRole("button", { name: /Apply via WordPress/ })).toBeInTheDocument())
  })

  test("a Bridge without site-level schema support: no Apply offered, the backend's reason is shown instead", async () => {
    siteSchemaData = { data: { supported: false, reason: "This WordPress site is running an older version of the Odito SEO Bridge that does not yet support site-level schema fixes. Update the plugin, then try again." } }
    renderView()
    expect(await screen.findByText(/older version of the Odito SEO Bridge/)).toBeInTheDocument()
    expect(screen.queryByText("Apply via WordPress")).not.toBeInTheDocument()
  })

  test("with no linked recommendation the fix is still not offered (existing structural gate)", async () => {
    taskMapData = { [PAGE_URL]: { _id: "task-1", status: "task_created", recommendationId: null } }
    linkedRecommendationData = null
    renderView()
    await waitFor(() => expect(screen.queryByText("Apply via WordPress")).not.toBeInTheDocument())
  })
})
