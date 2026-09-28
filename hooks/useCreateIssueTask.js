"use client"

import { useCallback, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiService from "@/lib/apiService"
import { queryKeys } from "@/lib/query/keys"
import { useActiveTaskUrls } from "@/hooks/useDashboardQueries"

/**
 * useCreateIssueTask
 *
 * The one implementation behind every "Create Task" button of the AI
 * recommendation panel (IssueRecommendationPanel calls its `onCreateTask` prop;
 * a screen that doesn't pass one gets a dead button). Uses the existing
 * POST /tasks endpoint — no new API.
 *
 *   createTask(pageUrl)
 *     → duplicate?  a task for (project, issueKey, pageUrl) already in the task
 *                   map → no request, feedback "Task already exists"
 *     → otherwise   POST /tasks { status: 'task_created', origin: 'ai_fix', … }
 *                   → refresh the task lists → feedback "Task created"
 *     → failure     feedback = the API's own error message
 *
 * Repeated clicks while a request is in flight are ignored (and `isCreating`
 * lets the panel disable the button).
 *
 * @param {object}   p
 * @param {string}   p.projectId
 * @param {string}   p.issueKey       — the same key every other screen uses for this issue (issue_code / rule_id / check id)
 * @param {string}   [p.issueName]
 * @param {string}   [p.issueCategory]
 * @param {string|null} [p.recommendationId] — link the task to the generated recommendation (`recommendation.id`)
 * @param {(f: {message: string, type: 'success'|'error'}) => void} [p.onFeedback]
 * @returns {{ taskMap: object, createTask: (pageUrl: string) => void, isCreating: boolean }}
 */
export function useCreateIssueTask({ projectId, issueKey, issueName, issueCategory, recommendationId = null, onFeedback }) {
  const queryClient = useQueryClient()
  const { data: activeTaskUrlsResponse } = useActiveTaskUrls(projectId, issueKey)
  const taskMap = activeTaskUrlsResponse?.data?.taskMap || {}

  const mutation = useMutation({
    mutationFn: async (pageUrl) => {
      if (!projectId || !issueKey || !pageUrl) {
        throw new Error("Cannot create a task: the project, issue or page URL is missing.")
      }
      const existingTask = taskMap[pageUrl]
      if (existingTask) {
        return { success: true, data: existingTask, alreadyExists: true }
      }
      return apiService.createTask({
        projectId,
        issueKey,
        issueName: issueName || issueKey,
        issueCategory: issueCategory || "",
        pageUrl,
        status: "task_created",
        origin: "ai_fix",
        recommendationId: recommendationId || null,
      })
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.activeUrls(projectId, issueKey) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.summary(projectId) })
      // The server is idempotent too (returns the existing task with alreadyExists).
      onFeedback?.({ message: result?.alreadyExists ? "Task already exists" : "Task created", type: "success" })
    },
    onError: (err) => {
      onFeedback?.({ message: err?.message || "Failed to create task.", type: "error" })
    },
  })

  // `mutation.isPending` only flips on the next render, so several clicks in the
  // same tick would each start a request. The ref closes that window synchronously.
  const inFlight = useRef(false)
  const createTask = useCallback((pageUrl) => {
    if (!pageUrl || inFlight.current) return
    inFlight.current = true
    mutation.mutate(pageUrl, { onSettled: () => { inFlight.current = false } })
  }, [mutation])

  return { taskMap, createTask, isCreating: mutation.isPending }
}

export default useCreateIssueTask
