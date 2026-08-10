"use client"

import { useQuery } from '@tanstack/react-query'
import apiService from '@/lib/apiService'
import { queryKeys } from '@/lib/query/keys'
import { staleTimes, gcTimes } from '@/lib/query/stale-times'

/**
 * ODITO-OPS-001 — Verification Operations Dashboard. Every hook here is
 * read-only (no mutations anywhere in this file), same convention as
 * hooks/system-admin/operations.js's Jobs/Webhooks/Audit Logs hooks.
 *
 * REALTIME staleTime/gcTime (not the module's usual STANDARD) is used for
 * Queue and Worker Health specifically — both surface live, fast-moving
 * state (queue depth, worker uptime) where a 5-minute-stale read would be
 * actively misleading for an ops incident; Batches/Recovery move slowly
 * enough that STANDARD (matching every other System Admin list) is fine.
 */

/* ────────────────────────── Batch Dashboard ────────────────────────── */

export function useSystemAdminVerificationBatches(params = {}) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.verificationBatches.list(params),
    queryFn: () => apiService.getSystemAdminVerificationBatches(params),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
    placeholderData: (previousData) => previousData,
  })
}

export function useSystemAdminVerificationBatchesSummary() {
  return useQuery({
    queryKey: queryKeys.systemAdmin.verificationBatches.summary(),
    queryFn: () => apiService.getSystemAdminVerificationBatchesSummary(),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}

export function useSystemAdminVerificationBatchDetail(batchId) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.verificationBatches.detail(batchId),
    queryFn: () => apiService.getSystemAdminVerificationBatchDetail(batchId),
    enabled: !!batchId,
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}

/* ────────────────────────── Queue Dashboard ────────────────────────── */

export function useSystemAdminVerificationQueueSummary() {
  return useQuery({
    queryKey: queryKeys.systemAdmin.verificationQueue.summary(),
    queryFn: () => apiService.getSystemAdminVerificationQueueSummary(),
    staleTime: staleTimes.REALTIME,
    gcTime: gcTimes.REALTIME,
    refetchInterval: staleTimes.REALTIME,
  })
}

/* ───────────────────────── Recovery Dashboard ───────────────────────── */

export function useSystemAdminVerificationRecoveryEvents(params = {}) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.verificationRecovery.list(params),
    queryFn: () => apiService.getSystemAdminVerificationRecoveryEvents(params),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
    placeholderData: (previousData) => previousData,
  })
}

export function useSystemAdminVerificationRecoverySummary() {
  return useQuery({
    queryKey: queryKeys.systemAdmin.verificationRecovery.summary(),
    queryFn: () => apiService.getSystemAdminVerificationRecoverySummary(),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}

/* ─────────────────────────── Worker Health ─────────────────────────── */

export function useSystemAdminVerificationWorkerHealth() {
  return useQuery({
    queryKey: queryKeys.systemAdmin.verificationWorkers.health(),
    queryFn: () => apiService.getSystemAdminVerificationWorkerHealth(),
    staleTime: staleTimes.REALTIME,
    gcTime: gcTimes.REALTIME,
    refetchInterval: staleTimes.REALTIME,
  })
}
