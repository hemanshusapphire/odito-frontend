"use client"

import { useQuery } from '@tanstack/react-query'
import apiService from '@/lib/apiService'
import { queryKeys } from '@/lib/query/keys'
import { staleTimes, gcTimes } from '@/lib/query/stale-times'

/**
 * No mutations in this file — Phase 2E is read-only (no refund workflow,
 * no payment edits). Same STANDARD tier and shape as dashboard.js/users.js/
 * subscriptions.js.
 */
export function useSystemAdminPayments(params = {}) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.payments.list(params),
    queryFn: () => apiService.getSystemAdminPayments(params),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Platform-wide, filter-independent — always the true totals regardless of
 * whatever search/filter the table currently has applied, same pattern as
 * useSystemAdminDashboard().
 */
export function useSystemAdminPaymentsSummary() {
  return useQuery({
    queryKey: queryKeys.systemAdmin.payments.summary(),
    queryFn: () => apiService.getSystemAdminPaymentsSummary(),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}

export function useSystemAdminPaymentDetail(paymentId) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.payments.detail(paymentId),
    queryFn: () => apiService.getSystemAdminPaymentDetail(paymentId),
    enabled: !!paymentId,
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}
