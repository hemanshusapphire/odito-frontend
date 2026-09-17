import { describe, test, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, within, fireEvent, waitFor } from "@testing-library/react"
import ConnectedAccountsCard from "./ConnectedAccountsCard"

/**
 * Independent Google account per service — Settings UI coverage. Every
 * service-affecting hook (useGoogleServiceConnections/
 * useConnectGoogleService/useDisconnectGoogleService) is mocked so this
 * exercises real component logic (which row renders what, which service a
 * click actually targets) against controlled, independent per-service data,
 * without a live backend. WordPress hooks in the same file are stubbed too
 * since ConnectedAccountsCard renders WordPressProviderRow unconditionally.
 */

const mockProject = { activeProjectId: "project-1" }

vi.mock("@/contexts/ProjectContext", () => ({
  useProject: () => mockProject,
}))

const mockRouterReplace = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
  usePathname: () => "/app/settings/profile",
  useSearchParams: () => mockSearchParams,
}))

const mockQueryClient = { invalidateQueries: vi.fn() }

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => mockQueryClient,
}))

vi.mock("@/lib/apiService", () => ({
  default: { downloadWordPressPlugin: vi.fn() },
}))

let googleConnectionsData
const connectServiceFns = {}
const disconnectMutations = {}

function makeDisconnectMutation() {
  return {
    mutateAsync: vi.fn().mockResolvedValue({ success: true }),
    isPending: false,
    isError: false,
    error: null,
  }
}

const mockInvalidateGoogleServiceStatusQueries = vi.fn()

vi.mock("@/hooks/useDashboardQueries", () => ({
  useGoogleServiceConnections: vi.fn(() => ({ data: { data: googleConnectionsData }, isLoading: false })),
  useConnectGoogleService: vi.fn((projectId, service) => {
    connectServiceFns[service] = connectServiceFns[service] || vi.fn().mockResolvedValue(undefined)
    return connectServiceFns[service]
  }),
  useDisconnectGoogleService: vi.fn((projectId, service) => {
    disconnectMutations[service] = disconnectMutations[service] || makeDisconnectMutation()
    return disconnectMutations[service]
  }),
  // Wrapped in a closure (not a direct reference) so the mock factory
  // object literal — constructed as soon as this module is first resolved,
  // before this file's own top-level `const` declarations have run — never
  // reads mockInvalidateGoogleServiceStatusQueries before it's initialized.
  invalidateGoogleServiceStatusQueries: (...args) => mockInvalidateGoogleServiceStatusQueries(...args),
  useWordPressStatus: () => ({ data: { data: { connected: false, status: "not_connected" } }, isLoading: false }),
  useConnectWordPress: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false, error: null, reset: vi.fn() }),
  useVerifyWordPressConnection: () => ({ mutate: vi.fn(), isPending: false, isError: false, error: null }),
  useDisconnectWordPress: () => makeDisconnectMutation(),
  useWordPressPluginStatus: () => ({ data: { data: { connected: false } } }),
  useGenerateWordPressPairingToken: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, isError: false, error: null, data: null, reset: vi.fn() }),
  useWordPressForms: () => ({ data: { data: [] } }),
}))

beforeEach(() => {
  for (const key of Object.keys(connectServiceFns)) delete connectServiceFns[key]
  for (const key of Object.keys(disconnectMutations)) delete disconnectMutations[key]
  mockSearchParams = new URLSearchParams()
  mockRouterReplace.mockClear()
  mockQueryClient.invalidateQueries.mockClear()
  mockInvalidateGoogleServiceStatusQueries.mockClear()

  googleConnectionsData = {
    google_ads: { connected: true, status: "connected", email: "ads@example.com", connectedAt: "2026-01-01", lastSync: "2026-02-01" },
    search_console: { connected: true, status: "connected", email: "seo@example.com", connectedAt: "2026-01-02", lastSync: null },
    analytics: { connected: false, status: "not_connected", email: null },
    business_profile: { connected: false, status: "revoked", email: "oldbiz@example.com" },
  }
})

describe("ConnectedAccountsCard — Google Services", () => {
  test("renders all four services, each with its own connected account", () => {
    render(<ConnectedAccountsCard />)

    expect(screen.getByText("Google Services")).toBeInTheDocument()
    expect(screen.getByText("Google Ads")).toBeInTheDocument()
    expect(screen.getByText("Search Console")).toBeInTheDocument()
    expect(screen.getByText("Analytics")).toBeInTheDocument()
    expect(screen.getByText("Business Profile")).toBeInTheDocument()

    expect(screen.getByText("ads@example.com")).toBeInTheDocument()
    expect(screen.getByText("seo@example.com")).toBeInTheDocument()
  })

  test("a disconnected service shows 'Not Connected' and a Connect button; an independent connected service is unaffected", () => {
    render(<ConnectedAccountsCard />)

    expect(screen.getAllByText("Not Connected").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Connect Google Account").length).toBeGreaterThan(0)

    // Business Profile was previously connected (now revoked) — surfaced as
    // "Reconnect Required", distinct from Analytics' plain "Not Connected".
    expect(screen.getByText("Reconnect Required")).toBeInTheDocument()
    expect(screen.getByText(/Previously connected as oldbiz@example.com/)).toBeInTheDocument()
  })

  test("Connect only starts OAuth for the clicked service, not any other", async () => {
    render(<ConnectedAccountsCard />)

    const analyticsHeading = screen.getByText("Analytics")
    const analyticsRow = analyticsHeading.closest("li")
    const connectButton = within(analyticsRow).getByRole("button", { name: /Connect Google Account/i })

    fireEvent.click(connectButton)

    expect(connectServiceFns.analytics).toHaveBeenCalledTimes(1)
    expect(connectServiceFns.google_ads).not.toHaveBeenCalled()
    expect(connectServiceFns.search_console).not.toHaveBeenCalled()
    expect(connectServiceFns.business_profile).not.toHaveBeenCalled()
  })

  test("Disconnect confirmation names only the clicked service and disconnecting it never touches the others", async () => {
    render(<ConnectedAccountsCard />)

    const adsHeading = screen.getByText("Google Ads")
    const adsRow = adsHeading.closest("li")
    const disconnectButton = within(adsRow).getByRole("button", { name: /^Disconnect$/i })
    fireEvent.click(disconnectButton)

    // Dialog copy is scoped to Google Ads specifically (Section 12).
    expect(screen.getByText("Disconnect Google Ads?")).toBeInTheDocument()
    expect(screen.getByText(/Odito will stop accessing Google Ads data/)).toBeInTheDocument()

    const confirmButton = screen.getByRole("button", { name: /^Disconnect Google Ads$/i })
    fireEvent.click(confirmButton)

    await waitFor(() => expect(disconnectMutations.google_ads.mutateAsync).toHaveBeenCalledTimes(1))
    expect(disconnectMutations.search_console.mutateAsync).not.toHaveBeenCalled()
    expect(disconnectMutations.analytics.mutateAsync).not.toHaveBeenCalled()
    expect(disconnectMutations.business_profile.mutateAsync).not.toHaveBeenCalled()
  })

  test("Change Account is offered for a connected service and starts that service's OAuth flow again", () => {
    render(<ConnectedAccountsCard />)

    const searchConsoleHeading = screen.getByText("Search Console")
    const searchConsoleRow = searchConsoleHeading.closest("li")
    const changeButton = within(searchConsoleRow).getByRole("button", { name: /Change Account/i })

    fireEvent.click(changeButton)

    expect(connectServiceFns.search_console).toHaveBeenCalledTimes(1)
    expect(connectServiceFns.google_ads).not.toHaveBeenCalled()
  })

  test("landing back here with ?google_connected=1 invalidates every service's status query, not just this card's own", () => {
    // Regression: this used to only invalidate googleServices.connections
    // (fixing this card's own rows) — the dedicated search-console/
    // analytics/business-profile/google-ads pages kept serving a stale,
    // persisted "not connected" query result until their 5-minute
    // staleTime expired, since nothing told React Query their data was
    // out of date.
    mockSearchParams = new URLSearchParams("?google_connected=1&projectId=project-1")

    render(<ConnectedAccountsCard />)

    expect(mockInvalidateGoogleServiceStatusQueries).toHaveBeenCalledTimes(1)
    expect(mockInvalidateGoogleServiceStatusQueries).toHaveBeenCalledWith(mockQueryClient, "project-1")
  })

  test("landing back here with ?google_error=... does not invalidate any query", () => {
    mockSearchParams = new URLSearchParams("?google_error=save_failed")

    render(<ConnectedAccountsCard />)

    expect(mockInvalidateGoogleServiceStatusQueries).not.toHaveBeenCalled()
  })
})
