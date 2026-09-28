import { vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { QueryClientProvider } from "@tanstack/react-query"
import TechCheckDetailView from "./TechCheckDetailView"
import apiService from "@/lib/apiService"
import { defineCreateTaskScenarios } from "@/test-utils/createTaskScenarios"

/**
 * Technical Checks: Create Task through the REAL recommendation panel.
 * (Regression: the panel's button calls `onCreateTask`; this view only ever
 * passed `onMarkFixed`, so the click did nothing at all.)
 */

// Stable reference: the view refetches whenever activeProject changes identity.
const ACTIVE_PROJECT = { _id: "project-1" }
vi.mock("@/contexts/ProjectContext", () => ({ useProject: () => ({ activeProject: ACTIVE_PROJECT }) }))
vi.mock("@/components/recommendations/RecommendationCodeBlock", () => ({ default: () => null }))
vi.mock("@/components/recommendations/RecommendationDiffViewer", () => ({ default: () => null }))
vi.mock("@/components/recommendations/RecommendationLoadingState", () => ({ default: () => null }))
vi.mock("@/components/issue-context/CurrentStateRenderer", () => ({ default: () => null }))
vi.mock("@/hooks/useIssueContext", () => ({ useIssueContext: () => ({ data: null, isLoading: false, error: null }) }))

let taskMapData
vi.mock("@/hooks/useDashboardQueries", () => ({
  useActiveTaskUrls: () => ({ data: { data: { taskMap: taskMapData, fixedUrls: [], fixedCount: 0 } } }),
}))

vi.mock("@/lib/apiService", () => ({
  default: { getTechnicalCheckDetail: vi.fn(), createTask: vi.fn(), updateTaskStatus: vi.fn(), request: vi.fn() },
}))

const PAGE = "https://example.com/about"
const CHECK = { id: "noindex_key_pages", name: "Noindex on key pages", category: "Indexability" }

defineCreateTaskScenarios({
  label: "Technical Checks",
  apiService,
  pageUrl: PAGE,
  expectedPayload: { projectId: "project-1", issueKey: "noindex_key_pages", issueName: "Noindex on key pages", issueCategory: "Indexability" },
  setTaskMap: (map) => {
    taskMapData = map
    apiService.getTechnicalCheckDetail.mockResolvedValue({
      success: true,
      data: { check: { ...CHECK, status: "Critical" }, pages: [{ url: PAGE, message: "Page has noindex directive" }] },
    })
  },
  renderScreen: (queryClient) => render(
    <QueryClientProvider client={queryClient}>
      <TechCheckDetailView check={CHECK} onBack={() => {}} />
    </QueryClientProvider>
  ),
  generate: async () => {
    fireEvent.click(await screen.findByText(PAGE))
    fireEvent.click(await screen.findByRole("button", { name: /Generate AI Recommendation/ }))
    await waitFor(() => expect(screen.getByRole("button", { name: /Regenerate/ })).toBeInTheDocument())
  },
})
