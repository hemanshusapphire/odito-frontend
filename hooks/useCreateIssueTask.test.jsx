import { describe, test, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useCreateIssueTask } from "./useCreateIssueTask"
import apiService from "@/lib/apiService"

let taskMapData
vi.mock("@/hooks/useDashboardQueries", () => ({
  useActiveTaskUrls: () => ({ data: { data: { taskMap: taskMapData } } }),
}))
vi.mock("@/lib/apiService", () => ({ default: { createTask: vi.fn() } }))

const URL_A = "https://example.com/a"
const BASE = { projectId: "project-1", issueKey: "missing_h1", issueName: "H1 missing", issueCategory: "Content", recommendationId: "rec-1" }

function setup(props = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  vi.spyOn(queryClient, "invalidateQueries")
  const onFeedback = vi.fn()
  const hook = renderHook(() => useCreateIssueTask({ ...BASE, onFeedback, ...props }), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
  return { ...hook, onFeedback, queryClient }
}

beforeEach(() => {
  vi.clearAllMocks()
  taskMapData = {}
})

describe("useCreateIssueTask", () => {
  test("POSTs the task with project, page URL, issue key/name/category, task_created status and the recommendation link", async () => {
    apiService.createTask.mockResolvedValue({ success: true, data: { _id: "t1" } })
    const { result, onFeedback } = setup()

    act(() => result.current.createTask(URL_A))

    await waitFor(() => expect(onFeedback).toHaveBeenCalledWith({ message: "Task created", type: "success" }))
    expect(apiService.createTask).toHaveBeenCalledWith({
      projectId: "project-1", issueKey: "missing_h1", issueName: "H1 missing", issueCategory: "Content",
      pageUrl: URL_A, status: "task_created", origin: "ai_fix", recommendationId: "rec-1",
    })
  })

  test("refreshes this issue's task list, all tasks, and the summary", async () => {
    apiService.createTask.mockResolvedValue({ success: true, data: {} })
    const { result, queryClient, onFeedback } = setup()
    act(() => result.current.createTask(URL_A))
    await waitFor(() => expect(onFeedback).toHaveBeenCalled())

    const keys = queryClient.invalidateQueries.mock.calls.map(([a]) => a.queryKey)
    expect(keys).toContainEqual(["tasks", "project-1", "active-urls", "missing_h1"])
    expect(keys).toContainEqual(["tasks", "project-1"])
    expect(keys).toContainEqual(["tasks", "project-1", "summary"])
  })

  test("a task already in the task map is never re-created: no request, 'Task already exists'", async () => {
    taskMapData = { [URL_A]: { _id: "t0", status: "task_created" } }
    const { result, onFeedback } = setup()

    act(() => result.current.createTask(URL_A))

    await waitFor(() => expect(onFeedback).toHaveBeenCalledWith({ message: "Task already exists", type: "success" }))
    expect(apiService.createTask).not.toHaveBeenCalled()
  })

  test("the server's own alreadyExists answer is reported the same way", async () => {
    apiService.createTask.mockResolvedValue({ success: true, data: {}, alreadyExists: true })
    const { result, onFeedback } = setup()
    act(() => result.current.createTask(URL_A))
    await waitFor(() => expect(onFeedback).toHaveBeenCalledWith({ message: "Task already exists", type: "success" }))
  })

  test("a failure is reported with the API's message (or a fallback), never swallowed", async () => {
    apiService.createTask.mockRejectedValueOnce(new Error("Boom from API"))
    const { result, onFeedback } = setup()
    act(() => result.current.createTask(URL_A))
    await waitFor(() => expect(onFeedback).toHaveBeenCalledWith({ message: "Boom from API", type: "error" }))

    apiService.createTask.mockRejectedValueOnce({})
    act(() => result.current.createTask("https://example.com/b"))
    await waitFor(() => expect(onFeedback).toHaveBeenLastCalledWith({ message: "Failed to create task.", type: "error" }))
  })

  test("isCreating is true while in flight and repeated calls send one request", async () => {
    let resolve
    apiService.createTask.mockReturnValue(new Promise((r) => { resolve = r }))
    const { result, onFeedback } = setup()

    act(() => { result.current.createTask(URL_A); result.current.createTask(URL_A) })
    await waitFor(() => expect(result.current.isCreating).toBe(true))
    act(() => result.current.createTask(URL_A))
    expect(apiService.createTask).toHaveBeenCalledTimes(1)

    await act(async () => { resolve({ success: true, data: {} }) })
    await waitFor(() => expect(result.current.isCreating).toBe(false))
    expect(onFeedback).toHaveBeenCalledTimes(1)
  })

  test("no page URL: nothing is sent; a missing project is reported instead of posting a broken task", async () => {
    const { result, onFeedback } = setup()
    act(() => result.current.createTask(null))
    act(() => result.current.createTask(""))
    expect(apiService.createTask).not.toHaveBeenCalled()
    expect(onFeedback).not.toHaveBeenCalled()

    const noProject = setup({ projectId: undefined })
    act(() => noProject.result.current.createTask(URL_A))
    await waitFor(() => expect(noProject.onFeedback).toHaveBeenCalledWith(expect.objectContaining({ type: "error" })))
    expect(apiService.createTask).not.toHaveBeenCalled()
  })

  test("falls back to the issue key for the name and an empty category; no recommendation -> null link", async () => {
    apiService.createTask.mockResolvedValue({ success: true, data: {} })
    const { result, onFeedback } = setup({ issueName: undefined, issueCategory: undefined, recommendationId: undefined })
    act(() => result.current.createTask(URL_A))
    await waitFor(() => expect(onFeedback).toHaveBeenCalled())
    expect(apiService.createTask).toHaveBeenCalledWith(expect.objectContaining({ issueName: "missing_h1", issueCategory: "", recommendationId: null }))
  })

  test("exposes the task map for the caller's duplicate / status display", () => {
    taskMapData = { [URL_A]: { _id: "t0" } }
    expect(setup().result.current.taskMap).toEqual({ [URL_A]: { _id: "t0" } })
  })
})
