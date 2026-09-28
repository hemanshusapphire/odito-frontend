import { vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { QueryClientProvider } from "@tanstack/react-query"
import FixPanel from "./FixPanel"
import apiService from "@/lib/apiService"
import { defineCreateTaskScenarios } from "@/test-utils/createTaskScenarios"

/**
 * On-Page → page detail → issue "Fix" overlay (app/onpage/components/FixPanel).
 * It used to pass only `onMarkFixed`, so its Create Task button was dead.
 */

vi.mock("@/components/recommendations/RecommendationCodeBlock", () => ({ default: () => null }))
vi.mock("@/components/recommendations/RecommendationDiffViewer", () => ({ default: () => null }))
vi.mock("@/components/recommendations/RecommendationLoadingState", () => ({ default: () => null }))
vi.mock("@/components/issue-context/CurrentStateRenderer", () => ({ default: () => null }))
vi.mock("@/components/diy/DIYRenderer", () => ({ default: () => null }))
vi.mock("@/hooks/useIssueContext", () => ({ useIssueContext: () => ({ data: null, isLoading: false, error: null }) }))

let taskMapData
vi.mock("@/hooks/useDashboardQueries", () => ({
  useActiveTaskUrls: () => ({ data: { data: { taskMap: taskMapData } } }),
}))
vi.mock("@/lib/apiService", () => ({ default: { request: vi.fn(), createTask: vi.fn() } }))

const URL_ = "https://example.com/about"
const ISSUE = { id: "row-1", issue_code: "missing_h1", title: "H1 missing", category: "Content", severity: "high" }

defineCreateTaskScenarios({
  label: "On-Page page-detail FixPanel",
  apiService,
  pageUrl: URL_,
  // Same issue key every other on-page screen uses (issue_code), not the row id.
  expectedPayload: { projectId: "project-1", issueKey: "missing_h1", issueName: "H1 missing", issueCategory: "Content" },
  setTaskMap: (map) => { taskMapData = map },
  renderScreen: (queryClient) => render(
    <QueryClientProvider client={queryClient}>
      <FixPanel issue={ISSUE} url={URL_} projectId="project-1" onFixed={() => {}} onClose={() => {}} />
    </QueryClientProvider>
  ),
  generate: async () => {
    fireEvent.click(await screen.findByRole("button", { name: /Generate AI Recommendation/ }))
    await waitFor(() => expect(screen.getByRole("button", { name: /Regenerate/ })).toBeInTheDocument())
  },
})
