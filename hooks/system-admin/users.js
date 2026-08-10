"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiService from '@/lib/apiService'
import { queryKeys } from '@/lib/query/keys'
import { staleTimes, gcTimes } from '@/lib/query/stale-times'

/**
 * Server-side search/filter/sort/paginate — `params` (search, role,
 * subscriptionStatus, emailVerified, accountStatus, sort, page, limit) is
 * part of the query key so every distinct filter combination gets its own
 * cache entry, same convention as tasks.list(params)/fixLogs.list(params)
 * in lib/query/keys.js.
 */
export function useSystemAdminUsers(params = {}) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.users.list(params),
    queryFn: () => apiService.getSystemAdminUsers(params),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
    placeholderData: (previousData) => previousData,
  })
}

export function useSystemAdminUserDetail(userId) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.users.detail(userId),
    queryFn: () => apiService.getSystemAdminUserDetail(userId),
    enabled: !!userId,
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}

/**
 * Suspend/activate both invalidate the list (status/avatar-adjacent columns
 * change) and that one user's detail query — never a full queryClient.clear().
 */
export function useSuspendUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, reason }) => apiService.suspendSystemAdminUser(userId, reason),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['system-admin', 'users', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.systemAdmin.users.detail(userId) })
    },
  })
}

export function useActivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, reason }) => apiService.activateSystemAdminUser(userId, reason),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['system-admin', 'users', 'list'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.systemAdmin.users.detail(userId) })
    },
  })
}
