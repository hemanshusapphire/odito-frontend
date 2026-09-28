import { describe, test, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent, within } from "@testing-library/react"
import ConnectedAccountsCard from "./ConnectedAccountsCard"
import apiService from "@/lib/apiService"

/**
 * WordPress plugin management coverage: ONE WordPress connection (Application
 * Password) with a nested "Lead Capture" / "SEO Bridge" row underneath it,
 * exactly the same list pattern Google Services already uses (one parent
 * row, one child row per independent account/plugin, each with its own
 * badge and action button). Every hook this component depends on is mocked
 * so this exercises real render logic against a controlled backend shape,
 * without a live connection.
 */

const mockProject = { activeProjectId: "project-1" }

vi.mock("@/contexts/ProjectContext", () => ({
  useProject: () => mockProject,
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/app/settings/profile",
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}))

vi.mock("@/lib/apiService", () => ({
  default: { downloadWordPressPlugin: vi.fn(), downloadSeoBridgePlugin: vi.fn() },
}))

let wordPressStatusData
let pluginStatusData
let capabilitiesData
let capabilitiesLoading = false

vi.mock("@/hooks/useDashboardQueries", () => ({
  useGoogleServiceConnections: () => ({ data: { data: {} }, isLoading: false }),
  useConnectGoogleService: () => vi.fn(),
  useDisconnectGoogleService: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false, error: null }),
  invalidateGoogleServiceStatusQueries: vi.fn(),
  useWordPressStatus: () => ({ data: { data: wordPressStatusData }, isLoading: false }),
  useConnectWordPress: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false, error: null, reset: vi.fn() }),
  useVerifyWordPressConnection: () => ({ mutate: vi.fn(), isPending: false, isError: false, error: null }),
  useDisconnectWordPress: () => ({ mutateAsync: vi.fn().mockResolvedValue({ success: true }), isPending: false, isError: false, error: null }),
  useWordPressPluginStatus: () => ({ data: { data: pluginStatusData } }),
  useGenerateWordPressPairingToken: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, isError: false, error: null, data: null, reset: vi.fn() }),
  useWordPressForms: () => ({ data: { data: [] } }),
  useWordPressCapabilities: () => ({ data: { data: capabilitiesData }, isLoading: capabilitiesLoading }),
}))

const CONNECTED = { connected: true, status: "connected", siteName: "My Site", siteUrl: "https://example.com" }
const NOT_CONNECTED = { connected: false, status: "not_connected" }

const NEITHER_PLUGIN = { connected: false }
const LEAD_CAPTURE_ONLY = { connected: true, pluginVersion: "1.2.0", formsDetected: 2, lastFormSyncAt: null, lastSeenAt: null }

function bridgeCaps(overrides = {}) {
  return {
    connected: true, provider: "rank_math", providerLabel: "Rank Math", providers: ["rank_math"],
    ambiguous: false,
    capabilities: { title: { read: true, write: true }, metaDescription: { read: true, write: true }, canonical: { read: true, write: true } },
    bridgeRequired: false, bridgeInstalled: true, bridgeActive: true, bridgeVersion: "1.0.0", bridgeVersionSupported: true,
    ...overrides,
  }
}

const BRIDGE_NOT_INSTALLED = {
  connected: true, provider: "rank_math", providerLabel: "Rank Math", providers: ["rank_math"], ambiguous: false,
  capabilities: { title: { read: true, write: false }, metaDescription: { read: true, write: false }, canonical: { read: true, write: false } },
  bridgeRequired: true, bridgeInstalled: false, bridgeActive: false, bridgeVersion: null, bridgeVersionSupported: true,
}

beforeEach(() => {
  wordPressStatusData = CONNECTED
  pluginStatusData = NEITHER_PLUGIN
  capabilitiesData = BRIDGE_NOT_INSTALLED
  capabilitiesLoading = false
  vi.clearAllMocks()
})

/** Both the Google Services and WordPress plugin lists are collapsed by default (a chevron toggle expands them) — expand once per test before looking for a plugin row. */
function expandWordPressPlugins() {
  const toggle = screen.queryByRole("button", { name: /Show Odito WordPress plugins/i })
  if (toggle) fireEvent.click(toggle)
}

function leadCaptureRow() {
  expandWordPressPlugins()
  return screen.getByText("Lead Capture").closest("li")
}

function seoBridgeRow() {
  expandWordPressPlugins()
  return screen.getByText("SEO Bridge").closest("li")
}

describe("ConnectedAccountsCard — WordPress plugins (Lead Capture / SEO Bridge, one shared connection)", () => {
  test("WordPress not connected: both plugin rows show a 'Not Connected' badge and 'Connect WordPress first.'", () => {
    wordPressStatusData = NOT_CONNECTED
    render(<ConnectedAccountsCard />)

    const lc = leadCaptureRow()
    const sb = seoBridgeRow()
    expect(within(lc).getByText("Not Connected")).toBeInTheDocument()
    expect(within(lc).getByText("Connect WordPress first.")).toBeInTheDocument()
    expect(within(sb).getByText("Not Connected")).toBeInTheDocument()
    expect(within(sb).getByText("Connect WordPress first.")).toBeInTheDocument()
  })

  test("only ONE WordPress connect control exists — no separate 'Connect Lead Capture' or 'Connect SEO Bridge' button", () => {
    wordPressStatusData = NOT_CONNECTED
    render(<ConnectedAccountsCard />)

    expect(screen.getByRole("button", { name: "Connect" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Connect Lead Capture/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Connect SEO Bridge/i })).not.toBeInTheDocument()
  })

  test("WordPress connected, both plugins missing: both rows show a 'Not Installed' badge", () => {
    pluginStatusData = NEITHER_PLUGIN
    capabilitiesData = { ...BRIDGE_NOT_INSTALLED, bridgeRequired: false }
    render(<ConnectedAccountsCard />)

    expect(within(leadCaptureRow()).getByText("Not Installed")).toBeInTheDocument()
    expect(within(seoBridgeRow()).getByText("Not Installed")).toBeInTheDocument()
  })

  test("Lead Capture installed, SEO Bridge missing: independent states, one connected does not imply the other", () => {
    pluginStatusData = LEAD_CAPTURE_ONLY
    capabilitiesData = BRIDGE_NOT_INSTALLED
    render(<ConnectedAccountsCard />)

    const lc = leadCaptureRow()
    expect(within(lc).getByText("Installed")).toBeInTheDocument()
    expect(within(lc).getByText("Version 1.2.0")).toBeInTheDocument()
    expect(within(lc).getByText("2 forms detected")).toBeInTheDocument()

    const sb = seoBridgeRow()
    expect(within(sb).getByText("Not Installed")).toBeInTheDocument()
    expect(within(sb).getByRole("button", { name: /Download Odito SEO Bridge/i })).toBeInTheDocument()
  })

  test("SEO Bridge installed, Lead Capture missing: independent states", () => {
    pluginStatusData = NEITHER_PLUGIN
    capabilitiesData = bridgeCaps()
    render(<ConnectedAccountsCard />)

    const lc = leadCaptureRow()
    expect(within(lc).getByText("Not Installed")).toBeInTheDocument()
    expect(within(lc).getByRole("button", { name: /Get Pairing Token/i })).toBeInTheDocument()

    const sb = seoBridgeRow()
    expect(within(sb).getByText("Active")).toBeInTheDocument()
    expect(within(sb).getByText("Version 1.0.0")).toBeInTheDocument()
    expect(within(sb).getByText("Provider:")).toBeInTheDocument()
    expect(within(sb).getByText("Rank Math")).toBeInTheDocument()
  })

  test("both plugins installed and active", () => {
    pluginStatusData = LEAD_CAPTURE_ONLY
    capabilitiesData = bridgeCaps()
    render(<ConnectedAccountsCard />)

    expect(screen.queryByText("Not Installed")).not.toBeInTheDocument()
    expect(within(leadCaptureRow()).getByText("Installed")).toBeInTheDocument()
    expect(within(seoBridgeRow()).getByText("Active")).toBeInTheDocument()
  })

  test("SEO Bridge installed but INACTIVE in WordPress: distinct badge, no capabilities offered", () => {
    capabilitiesData = bridgeCaps({ bridgeActive: false, capabilities: null })
    render(<ConnectedAccountsCard />)

    const sb = seoBridgeRow()
    expect(within(sb).getByText("Inactive")).toBeInTheDocument()
    expect(within(sb).getByText("Odito SEO Bridge is installed but inactive. Activate it in WordPress.")).toBeInTheDocument()
    expect(within(sb).queryByText(/Can auto-apply:/)).not.toBeInTheDocument()
  })

  test("Rank Math detected via the Bridge", () => {
    capabilitiesData = bridgeCaps({ provider: "rank_math", providerLabel: "Rank Math" })
    render(<ConnectedAccountsCard />)
    expect(within(seoBridgeRow()).getByText("Rank Math")).toBeInTheDocument()
  })

  test("Yoast SEO detected via the Bridge", () => {
    capabilitiesData = bridgeCaps({ provider: "yoast", providerLabel: "Yoast SEO" })
    render(<ConnectedAccountsCard />)
    expect(within(seoBridgeRow()).getByText("Yoast SEO")).toBeInTheDocument()
  })

  test("SEOPress detected via the Bridge — canonical stays unsupported even though title/description are writable", () => {
    capabilitiesData = bridgeCaps({
      provider: "seopress", providerLabel: "SEOPress", providers: ["seopress"],
      capabilities: { title: { read: true, write: true }, metaDescription: { read: true, write: true }, canonical: { read: false, write: false } },
    })
    render(<ConnectedAccountsCard />)

    const sb = seoBridgeRow()
    expect(within(sb).getByText("SEOPress")).toBeInTheDocument()
    const canAutoApply = within(sb).getByText(/Can auto-apply:/)
    expect(canAutoApply.textContent).toContain("Title")
    expect(canAutoApply.textContent).toContain("Meta description")
    expect(canAutoApply.textContent).not.toContain("Canonical")
  })

  test("AIOSEO detected via the Bridge", () => {
    capabilitiesData = bridgeCaps({ provider: "aioseo", providerLabel: "AIOSEO", providers: ["aioseo"] })
    render(<ConnectedAccountsCard />)
    expect(within(seoBridgeRow()).getByText("AIOSEO")).toBeInTheDocument()
  })

  test("multiple SEO plugins detected: badge reads 'Multiple Plugins', automatic fixes disabled, never guesses a provider", () => {
    capabilitiesData = {
      connected: true, provider: "multiple", providerLabel: "Multiple SEO plugins detected",
      providers: ["rank_math", "yoast"], ambiguous: true, capabilities: null,
      bridgeRequired: false, bridgeInstalled: true, bridgeActive: true, bridgeVersion: "1.0.0", bridgeVersionSupported: true,
    }
    render(<ConnectedAccountsCard />)

    const sb = seoBridgeRow()
    expect(within(sb).getByText("Multiple Plugins")).toBeInTheDocument()
    expect(within(sb).getByText("Multiple SEO plugins detected.")).toBeInTheDocument()
    expect(within(sb).getByText("Rank Math, Yoast SEO")).toBeInTheDocument()
    expect(within(sb).getByText("Automatic SEO fixes are disabled until one provider is selected.")).toBeInTheDocument()
  })

  test("Bridge 404 (not installed) is treated as a normal missing-plugin state, not a fatal WordPress connection error", () => {
    pluginStatusData = LEAD_CAPTURE_ONLY
    capabilitiesData = BRIDGE_NOT_INSTALLED
    render(<ConnectedAccountsCard />)

    // WordPress connection itself still reads as fully connected.
    expect(screen.getByText("My Site")).toBeInTheDocument()
    expect(within(seoBridgeRow()).getByText("Not Installed")).toBeInTheDocument()
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
  })

  test("Bridge version is displayed once installed and active", () => {
    capabilitiesData = bridgeCaps({ bridgeVersion: "1.4.2" })
    render(<ConnectedAccountsCard />)
    expect(within(seoBridgeRow()).getByText("Version 1.4.2")).toBeInTheDocument()
  })

  test("Bridge version incompatible: 'Update Required' badge, capabilities withheld, prompts an update instead of offering auto-apply", () => {
    capabilitiesData = bridgeCaps({ bridgeVersion: "0.9.0", bridgeVersionSupported: false, capabilities: null })
    render(<ConnectedAccountsCard />)

    const sb = seoBridgeRow()
    expect(within(sb).getByText("Update Required")).toBeInTheDocument()
    expect(within(sb).getByText("Please update Odito SEO Bridge to continue using automatic SEO fixes.")).toBeInTheDocument()
    expect(within(sb).queryByText(/Can auto-apply:/)).not.toBeInTheDocument()
  })

  test("Download Odito SEO Bridge button uses the existing apiService.downloadSeoBridgePlugin — no other download mechanism", () => {
    capabilitiesData = BRIDGE_NOT_INSTALLED
    render(<ConnectedAccountsCard />)

    const downloadButton = within(seoBridgeRow()).getByRole("button", { name: /Download Odito SEO Bridge/i })
    fireEvent.click(downloadButton)
    expect(apiService.downloadSeoBridgePlugin).toHaveBeenCalledTimes(1)
    expect(apiService.downloadWordPressPlugin).not.toHaveBeenCalled()
  })

  test("installed Bridge older than the shipped one (1.1.0 vs latest): shows versions, an 'Update Available' badge and a working Download", () => {
    capabilitiesData = bridgeCaps({ bridgeVersion: "1.1.0", latestBridgeVersion: "1.3.0", bridgeUpdateAvailable: true })
    render(<ConnectedAccountsCard />)

    const sb = seoBridgeRow()
    expect(within(sb).getByText("Update Available")).toBeInTheDocument()
    expect(within(sb).getByText("Version 1.1.0")).toBeInTheDocument()
    expect(within(sb).getByText("Update available: 1.1.0 → 1.3.0")).toBeInTheDocument()
    fireEvent.click(within(sb).getByRole("button", { name: /Download latest Odito SEO Bridge/i }))
    expect(apiService.downloadSeoBridgePlugin).toHaveBeenCalledTimes(1)
  })

  test("Bridge already current: no update prompt, plain 'Active' badge", () => {
    capabilitiesData = bridgeCaps({ bridgeVersion: "1.3.0", latestBridgeVersion: "1.3.0", bridgeUpdateAvailable: false })
    render(<ConnectedAccountsCard />)

    const sb = seoBridgeRow()
    expect(within(sb).getByText("Active")).toBeInTheDocument()
    expect(within(sb).queryByTestId("seo-bridge-update")).not.toBeInTheDocument()
    expect(within(sb).queryByRole("button", { name: /Download/i })).not.toBeInTheDocument()
  })

  test("a Bridge below the compatibility floor also gets the Download button", () => {
    capabilitiesData = bridgeCaps({ bridgeVersion: "0.9.0", latestBridgeVersion: "1.3.0", bridgeUpdateAvailable: true, bridgeVersionSupported: false, capabilities: null })
    render(<ConnectedAccountsCard />)

    expect(within(seoBridgeRow()).getByRole("button", { name: /Download latest Odito SEO Bridge/i })).toBeInTheDocument()
  })

  test("while Bridge capabilities are loading, the SEO Bridge row shows a checking indicator instead of stale or guessed data", () => {
    capabilitiesLoading = true
    capabilitiesData = null
    render(<ConnectedAccountsCard />)

    const sb = seoBridgeRow()
    expect(within(sb).getByText("Checking...")).toBeInTheDocument()
    expect(within(sb).getByText("Loading...")).toBeInTheDocument()
  })
})
