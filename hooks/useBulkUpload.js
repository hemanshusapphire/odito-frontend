"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiService from '@/lib/apiService'
import { staleTimes } from '@/lib/query/stale-times'

/**
 * TanStack Query hooks for the Bulk Upload wizard.
 *
 * Kept in their own file (like useGoogleAdsSyncProgress / useUrlVerification)
 * — the social publishing hooks in useDashboardQueries.js are pure query
 * hooks, while this feature is mostly mutations plus two short-lived
 * queries scoped to one batch.
 *
 * No polling: the backend validate and import calls are synchronous and
 * bounded to 200 rows. Queries only refetch when a mutation explicitly
 * invalidates them.
 */

const bulkKeys = {
  batch: (projectId, batchId) => ['social', 'bulk-upload', 'batch', projectId, batchId],
  rows: (projectId, batchId, params) => ['social', 'bulk-upload', 'rows', projectId, batchId, params],
  rowsForBatch: (projectId, batchId) => ['social', 'bulk-upload', 'rows', projectId, batchId],
}

function invalidateBatch(queryClient, projectId, batchId) {
  queryClient.invalidateQueries({ queryKey: bulkKeys.batch(projectId, batchId) })
  queryClient.invalidateQueries({ queryKey: bulkKeys.rowsForBatch(projectId, batchId) })
}

/** Step 1 → 2: upload a CSV/XLSX for parsing + server-side validation. */
export function useValidateBulkUpload(projectId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file) => apiService.validateBulkUpload(projectId, file),
    onSuccess: (res) => {
      const batchId = res?.data?.batch?.id
      if (batchId) invalidateBatch(queryClient, projectId, batchId)
    },
  })
}

/** Batch status + counts. Enabled once a batchId exists. */
export function useBulkUploadBatch(projectId, batchId, { enabled = true } = {}) {
  return useQuery({
    queryKey: bulkKeys.batch(projectId, batchId),
    queryFn: () => apiService.getBulkUploadBatch(projectId, batchId),
    enabled: !!projectId && !!batchId && enabled,
    staleTime: staleTimes.REALTIME,
    refetchOnWindowFocus: false,
  })
}

/**
 * Paginated rows for the preview / result tables. `params` is
 * { status, page, limit }; it is part of the query key so each
 * filter/page combination gets a stable cache entry. `placeholderData`
 * keeps the previous page on screen while the next one loads.
 */
export function useBulkUploadRows(projectId, batchId, params = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: bulkKeys.rows(projectId, batchId, params),
    queryFn: () => apiService.getBulkUploadRows(projectId, batchId, params),
    enabled: !!projectId && !!batchId && enabled,
    staleTime: staleTimes.REALTIME,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  })
}

/**
 * Step 2 → 3: create real SocialPublication records from the valid rows.
 * A completed batch replays its stored result (still a 200 — the wizard
 * treats it as success). Invalidates the batch/rows caches AND the shared
 * social publishing cache, since real posts were created.
 */
export function useImportBulkUpload(projectId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ batchId, mode }) => apiService.importBulkUpload(projectId, batchId, mode),
    onSuccess: (_res, { batchId }) => {
      invalidateBatch(queryClient, projectId, batchId)
      queryClient.invalidateQueries({ queryKey: ['social', 'publishing', projectId] })
    },
  })
}

/** Triggers the browser download of the server-owned CSV template. */
export function useDownloadBulkUploadTemplate(projectId) {
  return useMutation({ mutationFn: () => apiService.downloadBulkUploadTemplate(projectId) })
}

/** Triggers the browser download of the server-generated error report CSV. */
export function useDownloadBulkUploadErrors(projectId) {
  return useMutation({ mutationFn: (batchId) => apiService.downloadBulkUploadErrors(projectId, batchId) })
}

export { bulkKeys }
