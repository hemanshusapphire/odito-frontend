import { describe, test, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import ConnectedAccountsCard from "./ConnectedAccountsCard"
import apiService from "@/lib/apiService"

/**
 * WordPress SEO capability / Odito SEO Bridge display coverage.
 *
 * No test previously exercised this block at all — added alongside the
 * Odito SEO Bridge integration. Every hook this component depends on is
 * mocked so this exercises real render logic (what shows for which
 * capabilities response) against a controlled backend shape, never a live
 * connection. Google Services / Odito Plugin (forms) hooks are stubbed to
 * their simplest disconnected shape since this file only cares about the
 * WordPress SEO section.
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

let capabilitiesData
let capabilitiesLoading = false

vi.mock("@/hooks/useDashboardQueries", () => ({
  useGoogleServiceConnections: () => ({ data: { data: {} }, isLoading: false }),
  useConnectGoogleService: () => vi.fn(),
  useDisconnectGoogleService: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false, error: null }),
  invalidateGoogleServiceStatusQueries: vi.fn(),
  useWordPressStatus: () => ({ data: { data: { connected: true, status: "connected", siteName: "My Site", siteUrl: "https://example.com" } }, isLoading: false }),
  useConnectWordPress: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false, error: null, reset: vi.fn() }),
  useVerifyWordPressConnection: () => ({ mutate: vi.fn(), isPending: false, isError: false, error: null }),
  useDisconnectWordPress: () => ({ mutateAsync: vi.fn().mockResolvedValue({ success: true }), isPending: false, isError: false, error: null }),
  useWordPressPluginStatus: () => ({ data: { data: { connected: false } } }),
  useGenerateWordPressPairingToken: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, isError: false, error: null, data: null, reset: vi.fn() }),
  useWordPressForms: () => ({ data: { data: [] } }),
  useWordPressCapabilities: () => ({ data: { data: capabilitiesData }, isLoading: capabilitiesLoading }),
}))

beforeEach(() => {
  capabilitiesLoading = false
  capabilitiesData = null
})

describe("ConnectedAccountsCard — WordPress SEO capability / Bridge display", () => {
  test("while capabilities are loading, shows a checking indicator instead of stale or guessed data", () => {
    capabilitiesLoading = true
    capabilitiesData = null
    render(<ConnectedAccountsCard />)

    expect(screen.getByText("Checking...")).toBeInTheDocument()
  })

  test("multiple SEO plugins active: surfaces the ambiguity explicitly and never guesses a provider", () => {
    capabilitiesData = {
      connected: true, provider: "multiple", providerLabel: "Multiple SEO plugins detected",
      providers: ["rank_math", "yoast"], ambiguous: true, capabilities: null,
      bridgeRequired: false, bridgeInstalled: false, bridgeVersion: null,
    }
    render(<ConnectedAccountsCard />)

    expect(screen.getByText("Multiple SEO plugins detected")).toBeInTheDocument()
    expect(screen.getByText("Rank Math, Yoast SEO")).toBeInTheDocument()
    expect(screen.getByText(/Odito cannot safely choose which plugin to edit/)).toBeInTheDocument()
  })

  test("Rank Math active with no Bridge installed: reports the provider, no writable fields, and prompts to install the Bridge", () => {
    capabilitiesData = {
      connected: true, provider: "rank_math", providerLabel: "Rank Math", providers: ["rank_math"],
      ambiguous: false,
      capabilities: {
        title: { read: true, write: false },
        metaDescription: { read: true, write: false },
        canonical: { read: true, write: false },
      },
      bridgeRequired: true, bridgeInstalled: false, bridgeVersion: null,
    }
    render(<ConnectedAccountsCard />)

    expect(screen.getByText("SEO Provider:")).toBeInTheDocument()
    expect(screen.getByText("Rank Math")).toBeInTheDocument()
    expect(screen.getByText("No fields can be auto-applied via WordPress yet for this provider.")).toBeInTheDocument()
    expect(screen.getByText(/Install the Odito SEO Bridge plugin to enable editing/)).toBeInTheDocument()
    // Must never claim the Bridge is connected when it isn't installed.
    expect(screen.queryByText(/Odito SEO Bridge: Connected/)).not.toBeInTheDocument()

    const downloadButton = screen.getByRole("button", { name: /Download Odito SEO Bridge/i })
    fireEvent.click(downloadButton)
    expect(apiService.downloadSeoBridgePlugin).toHaveBeenCalledTimes(1)
  })

  test("Bridge installed: no download prompt or button is shown", () => {
    capabilitiesData = {
      connected: true, provider: "rank_math", providerLabel: "Rank Math", providers: ["rank_math"],
      ambiguous: false,
      capabilities: {
        title: { read: true, write: true },
        metaDescription: { read: true, write: true },
        canonical: { read: true, write: true },
      },
      bridgeRequired: false, bridgeInstalled: true, bridgeVersion: "1.0.0",
    }
    render(<ConnectedAccountsCard />)

    expect(screen.queryByRole("button", { name: /Download Odito SEO Bridge/i })).not.toBeInTheDocument()
  })

  test("Rank Math active WITH the Bridge installed: shows Bridge connected + version, writable fields, and no install prompt", () => {
    capabilitiesData = {
      connected: true, provider: "rank_math", providerLabel: "Rank Math", providers: ["rank_math"],
      ambiguous: false,
      capabilities: {
        title: { read: true, write: true },
        metaDescription: { read: true, write: true },
        canonical: { read: true, write: true },
      },
      bridgeRequired: false, bridgeInstalled: true, bridgeVersion: "1.0.0",
    }
    render(<ConnectedAccountsCard />)

    expect(screen.getByText("Odito SEO Bridge: Connected (v1.0.0)")).toBeInTheDocument()
    expect(screen.getByText(/Can auto-apply:/)).toBeInTheDocument()
    expect(screen.getByText(/Title, Meta description, Canonical URL/)).toBeInTheDocument()
    expect(screen.queryByText(/Install the Odito SEO Bridge plugin/)).not.toBeInTheDocument()
  })

  test("SEOPress active with the Bridge installed: canonical stays unsupported even though title/description are writable", () => {
    capabilitiesData = {
      connected: true, provider: "seopress", providerLabel: "SEOPress", providers: ["seopress"],
      ambiguous: false,
      capabilities: {
        title: { read: true, write: true },
        metaDescription: { read: true, write: true },
        canonical: { read: false, write: false },
      },
      bridgeRequired: false, bridgeInstalled: true, bridgeVersion: "1.0.0",
    }
    render(<ConnectedAccountsCard />)

    const canAutoApply = screen.getByText(/Can auto-apply:/)
    expect(canAutoApply.textContent).toContain("Title")
    expect(canAutoApply.textContent).toContain("Meta description")
    expect(canAutoApply.textContent).not.toContain("Canonical")
  })
})
