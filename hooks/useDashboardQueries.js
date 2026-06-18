"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiService from '@/lib/apiService'
import { queryKeys } from '@/lib/query/keys'
import { staleTimes, gcTimes } from '@/lib/query/stale-times'

// ==================== OVERVIEW QUERIES ====================

export function useProjectOverview(projectId) {
  return useQuery({
    queryKey: queryKeys.projects.overview(projectId),
    queryFn: () => apiService.getProjectOverview(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.AUDIT_RESULT,
  })
}

export function useIssueCounts(projectId) {
  return useQuery({
    queryKey: queryKeys.issues.counts(projectId),
    queryFn: () => apiService.getIssueCounts(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.AUDIT_RESULT,
  })
}

// ==================== TECHNICAL CHECKS QUERIES ====================

export function useTechnicalChecks(projectId) {
  return useQuery({
    queryKey: queryKeys.technical.all(projectId),
    queryFn: () => apiService.getTechnicalChecks(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.AUDIT_RESULT,
  })
}

export function useTechnicalCheckDetail(projectId, checkId) {
  return useQuery({
    queryKey: queryKeys.technical.detail(projectId, checkId),
    queryFn: () => apiService.getTechnicalCheckDetail(projectId, checkId),
    enabled: !!projectId && !!checkId,
    staleTime: staleTimes.STANDARD,
  })
}

// ==================== ON-PAGE ISSUES QUERIES ====================

export function useOnPageIssues(projectId) {
  return useQuery({
    queryKey: queryKeys.issues.onpage(projectId),
    queryFn: () => apiService.getOnPageIssues(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.AUDIT_RESULT,
  })
}

export function useIssueUrls(projectId, issueCode) {
  return useQuery({
    queryKey: [...queryKeys.issues.onpage(projectId), issueCode],
    queryFn: () => apiService.getIssueUrls(projectId, issueCode),
    enabled: !!projectId && !!issueCode,
    staleTime: staleTimes.STANDARD,
  })
}

export function usePageIssues(projectId, pageUrl) {
  return useQuery({
    queryKey: queryKeys.issues.page(projectId, pageUrl),
    queryFn: () => apiService.getPageIssues(projectId, pageUrl),
    enabled: !!projectId && !!pageUrl,
    staleTime: staleTimes.STANDARD,
  })
}

// ==================== ACCESSIBILITY QUERIES ====================

export function useAccessibilityIssues(projectId) {
  return useQuery({
    queryKey: queryKeys.issues.accessibility(projectId),
    queryFn: () => apiService.getAccessibilityIssues({ projectId }),
    enabled: !!projectId,
    staleTime: staleTimes.AUDIT_RESULT,
  })
}

// ==================== PAGESPEED QUERIES ====================

export function usePageSpeedData(projectId) {
  return useQuery({
    queryKey: queryKeys.pagespeed.data(projectId),
    queryFn: () => apiService.getPageSpeedData(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.AUDIT_RESULT,
  })
}


// ==================== PROJECTS QUERIES ====================

export function useProjects(page = 1, limit = 50, enabled = true) {
  return useQuery({
    queryKey: queryKeys.projects.list({ page, limit }),
    queryFn: () => apiService.getProjects(page, limit),
    staleTime: staleTimes.AUDIT_RESULT,
    gcTime: gcTimes.STANDARD,
    refetchOnWindowFocus: false,
    enabled: !!enabled,
  })
}

// ==================== AEO HUB QUERIES ====================

export function useAEOHub(projectId) {
  return useQuery({
    queryKey: queryKeys.aeoHub.data(projectId),
    queryFn: () => apiService.getAEOHubData(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.STANDARD,
  })
}

// ==================== AI SEARCH AUDIT QUERIES ====================

export function useAISearchAuditProject(projectId) {
  return useQuery({
    queryKey: queryKeys.aiAudit.project(projectId),
    queryFn: () => apiService.getProjectById(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.STATIC, // Project data rarely changes
  })
}

export function useAISearchAudit(projectId) {
  return useQuery({
    queryKey: queryKeys.aiAudit.summary(projectId),
    queryFn: () => apiService.getAISearchAudit(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.STANDARD,
  })
}

export function useAISearchAuditIssues(projectId) {
  return useQuery({
    queryKey: queryKeys.aiAudit.issues(projectId),
    queryFn: () => apiService.getAISearchAuditIssues(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.STANDARD,
  })
}

export function useAISearchAuditIssue(projectId, issueId) {
  return useQuery({
    queryKey: queryKeys.aiAudit.issue(projectId, issueId),
    queryFn: () => apiService.getAISearchAuditIssue(projectId, issueId),
    enabled: !!projectId && !!issueId,
    staleTime: staleTimes.STANDARD,
  })
}

export function useAISearchAuditIssuePages(projectId, issueId, options = {}) {
  return useQuery({
    queryKey: queryKeys.aiAudit.issuePages(projectId, issueId, options),
    queryFn: () => apiService.getAISearchAuditIssuePages(projectId, issueId, options),
    enabled: !!projectId && !!issueId,
    staleTime: staleTimes.STANDARD,
  })
}

export function useAIAccessibility(projectId) {
  return useQuery({
    queryKey: queryKeys.aiAudit.accessibility(projectId),
    queryFn: () => apiService.getAIAccessibility(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.STANDARD,
  })
}

// ==================== PRE AUDIT QUERIES ====================

export function usePreAudit(projectId) {
  return useQuery({
    queryKey: queryKeys.preAudit.detail(projectId),
    queryFn: () => apiService.getPreAudit(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.STATIC,
  })
}

// ==================== AI VIDEO QUERIES ====================

export function useAIVisibilityPages(projectId, params = {}) {
  return useQuery({
    queryKey: queryKeys.aiVideo.pages(projectId, params),
    queryFn: () => apiService.getAIVisibilityPages(projectId, params),
    enabled: !!projectId,
    staleTime: staleTimes.STANDARD,
  })
}

export function useAIVisibilityPage(projectId, url) {
  return useQuery({
    queryKey: queryKeys.aiVideo.page(projectId, url),
    queryFn: () => apiService.getAIVisibilityPage(projectId, url),
    enabled: !!projectId && !!url,
    staleTime: staleTimes.STANDARD,
  })
}

export function useAIVisibilityWorstPages(projectId, limit = 5) {
  return useQuery({
    queryKey: queryKeys.aiVideo.worst(projectId, limit),
    queryFn: () => apiService.getAIVisibilityWorstPages(projectId, limit),
    enabled: !!projectId,
    staleTime: staleTimes.STANDARD,
  })
}

export function useAIVisibilityEntityGraph(projectId) {
  return useQuery({
    queryKey: queryKeys.aiVideo.graph(projectId),
    queryFn: () => apiService.getAIVisibilityEntityGraph(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.STANDARD,
  })
}

// ==================== FIX LOGS QUERIES (deprecated — use task hooks) ====================

/**
 * @deprecated Use useActiveTaskUrls instead
 */
export function useFixedUrls(projectId, issueKey) {
  return useQuery({
    queryKey: queryKeys.fixLogs.fixedUrls(projectId, issueKey),
    queryFn: () => apiService.getFixedUrls(projectId, issueKey),
    enabled: !!projectId && !!issueKey,
    staleTime: staleTimes.DYNAMIC,
  })
}

/**
 * @deprecated Use useTasks instead
 */
export function useFixLogs(params = {}) {
  return useQuery({
    queryKey: queryKeys.fixLogs.list(params),
    queryFn: () => apiService.getFixLogs(params),
    enabled: !!params.projectId,
    staleTime: staleTimes.DYNAMIC,
  })
}

// ==================== TASK LIFECYCLE QUERIES ====================

/**
 * Returns all tasks for a specific issue + project, keyed by URL.
 * Used by issue detail page to show task status badges on each URL.
 */
export function useActiveTaskUrls(projectId, issueKey) {
  return useQuery({
    queryKey: queryKeys.tasks.activeUrls(projectId, issueKey),
    queryFn: () => apiService.getActiveTaskUrls(projectId, issueKey),
    enabled: !!projectId && !!issueKey,
    staleTime: staleTimes.DYNAMIC,
  })
}

/**
 * Paginated task list. Powers the Optimization Center.
 */
export function useTasks(params = {}) {
  return useQuery({
    queryKey: queryKeys.tasks.list(params),
    queryFn: () => apiService.getTasks(params),
    enabled: !!params.projectId,
    staleTime: staleTimes.DYNAMIC,
  })
}

/**
 * Task summary counts by status for a project.
 */
export function useTaskSummary(projectId) {
  return useQuery({
    queryKey: queryKeys.tasks.summary(projectId),
    queryFn: () => apiService.getTaskSummary(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.DYNAMIC,
  })
}

/**
 * Delete a task (soft delete). Optimistically removes the row from all cached
 * task lists and refreshes the summary counts.
 *
 * @param {string} projectId - needed for targeted cache invalidation
 */
export function useDeleteTask(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId) => apiService.deleteTask(taskId),

    onMutate: async (taskId) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all(projectId) })

      // Snapshot for rollback
      const previousLists = queryClient.getQueriesData({ queryKey: ['tasks', projectId, 'list'] })
      const previousSummary = queryClient.getQueryData(queryKeys.tasks.summary(projectId))

      // Optimistically remove row from every cached list page
      queryClient.setQueriesData(
        { queryKey: ['tasks', projectId, 'list'] },
        (old) => {
          if (!old?.data?.tasks) return old
          return {
            ...old,
            data: {
              ...old.data,
              tasks: old.data.tasks.filter((t) => t._id !== taskId),
              pagination: old.data.pagination
                ? { ...old.data.pagination, total: Math.max(0, old.data.pagination.total - 1) }
                : old.data.pagination,
            },
          }
        }
      )

      return { previousLists, previousSummary }
    },

    onError: (_err, _taskId, context) => {
      // Roll back optimistic update on error
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data)
        }
      }
      if (context?.previousSummary) {
        queryClient.setQueryData(queryKeys.tasks.summary(projectId), context.previousSummary)
      }
    },

    onSettled: () => {
      // Always resync from server — summary counts + lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.summary(projectId) })
    },
  })
}

// ==================== AUDIT HISTORY QUERIES ====================

export function useLatestComparison(projectId) {
  return useQuery({
    queryKey: queryKeys.auditHistory.comparison(projectId),
    queryFn: () => apiService.getLatestComparison(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.AUDIT_RESULT,
  })
}

export function useAuditHistory(projectId, { enabled = true, page = 1 } = {}) {
  return useQuery({
    queryKey: queryKeys.auditHistory.history(projectId, page),
    queryFn: () => apiService.getAuditHistory(projectId, page),
    enabled: !!projectId && enabled,
    staleTime: staleTimes.AUDIT_RESULT,
  })
}

export function useProjectTrends(projectId) {
  return useQuery({
    queryKey: queryKeys.auditHistory.trends(projectId),
    queryFn: () => apiService.getProjectTrends(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.AUDIT_RESULT,
  })
}

export function useAiImpact(projectId) {
  return useQuery({
    queryKey: queryKeys.auditHistory.aiImpact(projectId),
    queryFn: () => apiService.getAiImpact(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.AUDIT_RESULT,
  })
}

export function useAllAuditHistory(projectId) {
  return useQuery({
    queryKey: queryKeys.auditHistory.historyAll(projectId),
    queryFn: () => apiService.getAuditHistory(projectId, 1, 50),
    enabled: !!projectId,
    staleTime: staleTimes.AUDIT_RESULT,
  })
}

export function useAuditComparison(projectId, from, to, { enabled = false } = {}) {
  return useQuery({
    queryKey: queryKeys.auditHistory.auditComparison(projectId, from, to),
    queryFn: () => apiService.getAuditComparison(projectId, from, to),
    enabled: !!projectId && !!from && !!to && String(from) !== String(to) && enabled,
    staleTime: staleTimes.AUDIT_RESULT,
  })
}

// ==================== RAW HTML QUERIES ====================

export function usePageRawHtml(projectId, url) {
  return useQuery({
    queryKey: queryKeys.rawHtml.detail(projectId, url),
    queryFn: () => apiService.getPageRawHtml(url, projectId),
    enabled: !!projectId && !!url,
    staleTime: staleTimes.STANDARD,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}
