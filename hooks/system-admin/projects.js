"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiService from '@/lib/apiService'
import { queryKeys } from '@/lib/query/keys'
import { staleTimes, gcTimes } from '@/lib/query/stale-times'

export function useSystemAdminProjects(params = {}) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.projects.list(params),
    queryFn: () => apiService.getSystemAdminProjects(params),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
    placeholderData: (previousData) => previousData,
  })
}

export function useSystemAdminProjectsSummary() {
  return useQuery({
    queryKey: queryKeys.systemAdmin.projects.summary(),
    queryFn: () => apiService.getSystemAdminProjectsSummary(),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}

export function useSystemAdminProjectDetail(id) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.projects.detail(id),
    queryFn: () => apiService.getSystemAdminProjectDetail(id),
    enabled: !!id,
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}

/**
 * Both mutations invalidate the projects list + that project's detail +
 * the dashboard (audit/project counts shift) + the jobs list (a new job
 * just got created) — never a full queryClient.clear().
 */
function useInvalidateAfterProjectChange() {
  const queryClient = useQueryClient()
  return (projectId) => {
    queryClient.invalidateQueries({ queryKey: ['system-admin', 'projects', 'list'] })
    queryClient.invalidateQueries({ queryKey: queryKeys.systemAdmin.projects.summary() })
    queryClient.invalidateQueries({ queryKey: queryKeys.systemAdmin.projects.detail(projectId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.systemAdmin.dashboard() })
    queryClient.invalidateQueries({ queryKey: ['system-admin', 'jobs', 'list'] })
  }
}

export function useStartProjectAudit() {
  const invalidate = useInvalidateAfterProjectChange()
  return useMutation({
    mutationFn: ({ projectId, reason }) => apiService.startSystemAdminProjectAudit(projectId, reason),
    onSuccess: (_data, { projectId }) => invalidate(projectId),
  })
}

export function useDeleteProject() {
  const invalidate = useInvalidateAfterProjectChange()
  return useMutation({
    mutationFn: ({ projectId, reason }) => apiService.deleteSystemAdminProject(projectId, reason),
    onSuccess: (_data, { projectId }) => invalidate(projectId),
  })
}

export function useRestoreProject() {
  const invalidate = useInvalidateAfterProjectChange()
  return useMutation({
    mutationFn: ({ projectId, reason }) => apiService.restoreSystemAdminProject(projectId, reason),
    onSuccess: (_data, { projectId }) => invalidate(projectId),
  })
}

export function usePermanentlyDeleteProject() {
  const invalidate = useInvalidateAfterProjectChange()
  return useMutation({
    mutationFn: ({ projectId, reason }) => apiService.permanentlyDeleteSystemAdminProject(projectId, reason),
    onSuccess: (_data, { projectId }) => invalidate(projectId),
  })
}
