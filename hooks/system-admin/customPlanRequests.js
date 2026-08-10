"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiService from '@/lib/apiService'
import { queryKeys } from '@/lib/query/keys'
import { staleTimes, gcTimes } from '@/lib/query/stale-times'

export function useAdminCustomPlanRequests(params = {}) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.customPlanRequests.list(params),
    queryFn: () => apiService.getSystemAdminCustomPlanRequests(params),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
    placeholderData: (previousData) => previousData,
  })
}

export function useAdminCustomPlanRequest(id) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.customPlanRequests.detail(id),
    queryFn: () => apiService.getSystemAdminCustomPlanRequestDetail(id),
    enabled: !!id,
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}

/**
 * These two mutations call the EXISTING adminUpdateCustomPlanRequestStatus/
 * adminAddCustomPlanRequestNote endpoints (see apiService.js) — no new
 * backend logic. On success they invalidate this request's detail + the
 * list (status/company columns can change), same shape as
 * useInvalidateAfterSubscriptionChange in subscriptions.js.
 */
function useInvalidateAfterCustomPlanRequestChange() {
  const queryClient = useQueryClient()
  return (id) => {
    queryClient.invalidateQueries({ queryKey: ['system-admin', 'custom-plan-requests', 'list'] })
    queryClient.invalidateQueries({ queryKey: queryKeys.systemAdmin.customPlanRequests.detail(id) })
  }
}

export function useUpdateCustomPlanRequest() {
  const invalidate = useInvalidateAfterCustomPlanRequestChange()
  return useMutation({
    mutationFn: ({ id, status }) => apiService.adminUpdateCustomPlanRequestStatus(id, status),
    onSuccess: (_data, { id }) => invalidate(id),
  })
}

export function useAddCustomPlanRequestNote() {
  const invalidate = useInvalidateAfterCustomPlanRequestChange()
  return useMutation({
    mutationFn: ({ id, note }) => apiService.adminAddCustomPlanRequestNote(id, note),
    onSuccess: (_data, { id }) => invalidate(id),
  })
}
