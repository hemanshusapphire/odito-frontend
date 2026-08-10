"use client"

import { useQuery } from '@tanstack/react-query'
import apiService from '@/lib/apiService'
import { queryKeys } from '@/lib/query/keys'
import { staleTimes, gcTimes } from '@/lib/query/stale-times'

/**
 * Single aggregate call for the System Admin dashboard cards — one API
 * request, one React Query cache entry, mirroring the pattern in
 * hooks/useDashboardQueries.js (useSubscription, etc). STANDARD tier
 * (5 min) matches the "general cached data" tier: dashboard stats don't
 * need audit-result freshness, but shouldn't go stale for a full session.
 */
export function useSystemAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.systemAdmin.dashboard(),
    queryFn: () => apiService.getSystemAdminDashboard(),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}
