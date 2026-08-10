"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiService from '@/lib/apiService'
import { queryKeys } from '@/lib/query/keys'
import { staleTimes, gcTimes } from '@/lib/query/stale-times'

export function useSystemAdminSubscriptions(params = {}) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.subscriptions.list(params),
    queryFn: () => apiService.getSystemAdminSubscriptions(params),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
    placeholderData: (previousData) => previousData,
  })
}

export function useSystemAdminSubscriptionDetail(userId) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.subscriptions.detail(userId),
    queryFn: () => apiService.getSystemAdminSubscriptionDetail(userId),
    enabled: !!userId,
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}

/**
 * These three mutations call the EXISTING adminAssignPlan/adminAdjustQuota/
 * adminUpdateStatus endpoints (see apiService.js) — no new backend logic.
 * On success they invalidate this subscription's detail + the subscriptions
 * list + the User Management list (credits/pages/plan columns overlap) +
 * the dashboard's active-subscription/revenue cards, all of which can
 * change as a result — never a full queryClient.clear().
 */
function useInvalidateAfterSubscriptionChange() {
  const queryClient = useQueryClient()
  return (userId) => {
    queryClient.invalidateQueries({ queryKey: ['system-admin', 'subscriptions', 'list'] })
    queryClient.invalidateQueries({ queryKey: queryKeys.systemAdmin.subscriptions.detail(userId) })
    queryClient.invalidateQueries({ queryKey: ['system-admin', 'users', 'list'] })
    queryClient.invalidateQueries({ queryKey: queryKeys.systemAdmin.users.detail(userId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.systemAdmin.dashboard() })
  }
}

export function useAdminAssignPlan() {
  const invalidate = useInvalidateAfterSubscriptionChange()
  return useMutation({
    mutationFn: ({ userId, planId, reason }) => apiService.adminAssignPlan(userId, planId, reason),
    onSuccess: (_data, { userId }) => invalidate(userId),
  })
}

export function useAdminAdjustQuota() {
  const invalidate = useInvalidateAfterSubscriptionChange()
  return useMutation({
    mutationFn: ({ userId, credits, pages, reason }) => apiService.adminAdjustQuota(userId, { credits, pages }, reason),
    onSuccess: (_data, { userId }) => invalidate(userId),
  })
}

export function useAdminUpdateSubscriptionStatus() {
  const invalidate = useInvalidateAfterSubscriptionChange()
  return useMutation({
    mutationFn: ({ userId, status, reason }) => apiService.adminUpdateSubscriptionStatus(userId, status, reason),
    onSuccess: (_data, { userId }) => invalidate(userId),
  })
}
