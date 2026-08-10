"use client"

import { useQuery } from '@tanstack/react-query'
import apiService from '@/lib/apiService'
import { queryKeys } from '@/lib/query/keys'
import { staleTimes, gcTimes } from '@/lib/query/stale-times'

/**
 * Operations Center — Jobs, Webhooks, Audit Logs. Every hook here is
 * read-only (no mutations in this file at all): monitoring only, no
 * retry/replay/delete/requeue action anywhere in Phase 2F/2G.
 */

/* ────────────────────────────── Jobs ────────────────────────────── */

export function useSystemAdminJobs(params = {}) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.jobs.list(params),
    queryFn: () => apiService.getSystemAdminJobs(params),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
    placeholderData: (previousData) => previousData,
  })
}

export function useSystemAdminJobsSummary() {
  return useQuery({
    queryKey: queryKeys.systemAdmin.jobs.summary(),
    queryFn: () => apiService.getSystemAdminJobsSummary(),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}

export function useSystemAdminJob(jobId) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.jobs.detail(jobId),
    queryFn: () => apiService.getSystemAdminJobDetail(jobId),
    enabled: !!jobId,
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}

/* ──────────────────────────── Webhooks ──────────────────────────── */

export function useSystemAdminWebhooks(params = {}) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.webhooks.list(params),
    queryFn: () => apiService.getSystemAdminWebhooks(params),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
    placeholderData: (previousData) => previousData,
  })
}

export function useSystemAdminWebhooksSummary() {
  return useQuery({
    queryKey: queryKeys.systemAdmin.webhooks.summary(),
    queryFn: () => apiService.getSystemAdminWebhooksSummary(),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}

export function useSystemAdminWebhook(id) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.webhooks.detail(id),
    queryFn: () => apiService.getSystemAdminWebhookDetail(id),
    enabled: !!id,
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}

/* ─────────────────────────── Audit Logs ─────────────────────────── */

export function useSystemAdminAuditLogs(params = {}) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.auditLogs.list(params),
    queryFn: () => apiService.getSystemAdminAuditLogs(params),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
    placeholderData: (previousData) => previousData,
  })
}

export function useSystemAdminAuditLogsSummary() {
  return useQuery({
    queryKey: queryKeys.systemAdmin.auditLogs.summary(),
    queryFn: () => apiService.getSystemAdminAuditLogsSummary(),
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}

export function useSystemAdminAuditLog(id) {
  return useQuery({
    queryKey: queryKeys.systemAdmin.auditLogs.detail(id),
    queryFn: () => apiService.getSystemAdminAuditLogDetail(id),
    enabled: !!id,
    staleTime: staleTimes.STANDARD,
    gcTime: gcTimes.STANDARD,
  })
}
