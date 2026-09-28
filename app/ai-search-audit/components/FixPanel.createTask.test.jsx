import { vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { QueryClientProvider } from "@tanstack/react-query"
import FixPanel from "./FixPanel"
import apiService from "@/lib/apiService"
import { defineCreateTaskScenarios } from "@/test-utils/createTaskScenarios"

/**
 * AI Search Audit FixPanel (app/ai-search-audit/components). It used to pass
 * only `onMarkFixed`, so its Create Task button was dead. (Currently no screen
 * imports this component, but it is wired the same way so it works if mounted.)
 */

const PROJECT = { _id: "project-1" }
vi.mock("@/contexts/ProjectContext", () => ({ useProject: () => ({ activeProject: PROJECT }) }))
vi.mock("@/components/recommendations/RecommendationCodeBlock", () => ({ default: () => null }))
vi.mock("@/components/recommendations/RecommendationDiffViewer", () => ({ default: () => null }))
vi.mock("@/components/recommendations/RecommendationLoadingState", () => ({ default: () => null }))
vi.mock("@/components/issue-context/CurrentStateRenderer", () => ({ default: () => null }))
vi.mock("@/components/diy/DIYRenderer", () => ({ default: () => null }))
vi.mock("./AuditIQHelp", () => ({ default: () => null }))
vi.mock("@/hooks/useIssueContext", () => ({ useIssueContext: () => ({ data: null, isLoading: false, error: null }) }))

let taskMapData
vi.mock("@/hooks/useDashboardQueries", () => ({
  useActiveTaskUrls: () => ({ data: { data: { taskMap: taskMapData } } }),
}))
vi.mock("@/lib/apiService", () => ({ default: { request: vi.fn(), createTask: vi.fn() } }))

const URL_ = "https://example.com/services"
const ISSUE = { id: "AISO-12", title: "Missing llms.txt reference", category: "AISEO", severity: "high", urls: [{ url: URL_ }] }

defineCreateTaskScenarios({
  label: "AI Search Audit FixPanel",
  apiService,
  pageUrl: URL_,
  expectedPayload: { projectId: "project-1", issueKey: "AISO-12", issueName: "Missing llms.txt reference", issueCategory: "AISEO" },
  setTaskMap: (map) => { taskMapData = map },
  renderScreen: (queryClient) => render(
    <QueryClientProvider client={queryClient}>
      <FixPanel issue={ISSUE} selIdx={0} mode="ai" setMode={() => {}} onFixed={() => {}} />
    </QueryClientProvider>
  ),
  generate: async () => {
    fireEvent.click(await screen.findByRole("button", { name: /Generate AI Recommendation/ }))
    await waitFor(() => expect(screen.getByRole("button", { name: /Regenerate/ })).toBeInTheDocument())
  },
})
