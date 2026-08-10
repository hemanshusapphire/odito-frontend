"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiService from '@/lib/apiService'
import { queryKeys } from '@/lib/query/keys'
import { staleTimes, gcTimes } from '@/lib/query/stale-times'

/**
 * Tracked keywords for a project — replaces KeywordDashboard.jsx's manual
 * useState/useEffect + apiService.getProjectRankings() call. Response shape
 * is unchanged (the existing GET /rankings endpoint), so UserAddedKeywords.jsx
 * needs no changes to how it reads `data`.
 */
export function useKeywords(projectId) {
  return useQuery({
    queryKey: queryKeys.keywords.list(projectId),
    queryFn: () => apiService.getProjectRankings(projectId),
    enabled: !!projectId,
    staleTime: staleTimes.DYNAMIC,
    gcTime: gcTimes.DYNAMIC,
  })
}

/**
 * Not optimistic — Add triggers a real DataForSEO lookup with a result the
 * client can't predict (see the Phase 1.75 blueprint's reasoning: claiming
 * a specific rank before the server responds would be actively misleading,
 * unlike Delete which has no such unpredictable side effect).
 */
export function useAddKeyword(projectId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (keyword) => apiService.addKeyword(projectId, keyword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.keywords.list(projectId) })
    },
  })
}

/**
 * Optimistic: removes the row and decrements usage immediately, rolls back
 * on error. Safe because delete has no external side effect to undo — the
 * worst case is a brief visual flicker if the request fails, not stale data
 * pretending to be authoritative (onSettled always reconciles with the
 * server's real state regardless of the optimistic guess).
 */
export function useDeleteKeyword(projectId) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.keywords.list(projectId)

  return useMutation({
    mutationFn: (keyword) => apiService.deleteKeyword(projectId, keyword),

    onMutate: async (keyword) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (old) => {
        if (!old?.data?.[0]?.keywords) return old
        const normalized = keyword.toLowerCase().trim()
        return {
          ...old,
          data: [{
            ...old.data[0],
            keywords: old.data[0].keywords.filter(
              (k) => k.keyword.toLowerCase().trim() !== normalized
            ),
          }],
        }
      })

      return { previous }
    },

    onError: (_err, _keyword, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}
