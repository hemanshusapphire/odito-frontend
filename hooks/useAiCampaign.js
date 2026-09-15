"use client"

/**
 * AI Campaign Builder — TanStack Query hooks (Phase 3).
 *
 * Server state only (the draft, the drafts list, the generation call). All
 * local UI state (selected ad group, dirty flag, editable copy, dialogs)
 * lives in component state, never here — see the workspace page.
 *
 * Query keys come from lib/query/keys.js (`queryKeys.aiCampaign`) and are
 * deliberately NOT under the ['google-ads', projectId] namespace, so a
 * Google Ads dashboard sync never touches a draft being edited and a draft
 * save never refetches the dashboard.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiService from '@/lib/apiService'
import { queryKeys } from '@/lib/query/keys'
import { staleTimes } from '@/lib/query/stale-times'

/** The project's campaign drafts (list view / "continue editing later"). */
export function useAiCampaignDrafts(projectId, params = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.aiCampaign.list(projectId, params),
    queryFn: () => apiService.getAiCampaignDrafts(projectId, params),
    enabled: !!projectId && enabled,
    staleTime: staleTimes.STANDARD,
    placeholderData: (prev) => prev,
  })
}

/** A single draft — the source of truth for the workspace. */
export function useAiCampaignDraft(draftId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.aiCampaign.draft(draftId),
    queryFn: () => apiService.getAiCampaignDraft(draftId),
    enabled: !!draftId && enabled,
    // A ready draft only changes when this user saves it — no need to
    // re-fetch aggressively and risk stomping an in-progress edit.
    staleTime: staleTimes.STATIC,
  })
}

/**
 * Generate a campaign from a brief. On success the backend has persisted a
 * new draft; we prime its cache entry and invalidate the list so the
 * workspace can open instantly without a second round-trip.
 */
export function useGenerateAiCampaign(projectId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ brief, googleAdsCustomerId }) =>
      apiService.generateAiCampaign(projectId, brief, googleAdsCustomerId),
    onSuccess: (res) => {
      const draft = res?.data?.draft
      const draftId = draft?._id || draft?.id
      if (draftId) {
        queryClient.setQueryData(queryKeys.aiCampaign.draft(draftId), { success: true, data: draft })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.aiCampaign.all(projectId) })
    },
  })
}

/**
 * Save (whole-draft PATCH). Invalidates the single draft + the list only —
 * never the Google Ads dashboard queries.
 */
export function useUpdateAiCampaignDraft(projectId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ draftId, updates }) => apiService.updateAiCampaignDraft(draftId, updates),
    onSuccess: (res, { draftId }) => {
      const draft = res?.data
      if (draft) {
        queryClient.setQueryData(queryKeys.aiCampaign.draft(draftId), { success: true, data: draft })
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.aiCampaign.draft(draftId) })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.aiCampaign.list(projectId, undefined), exact: false })
      queryClient.invalidateQueries({ queryKey: queryKeys.aiCampaign.all(projectId) })
      // A save bumps AiCampaignDraft.version, so any previously-fetched
      // readiness result is now stale (spec §24/§25) — refetch on next read
      // rather than showing a cached isCurrent:true from before the edit.
      queryClient.invalidateQueries({ queryKey: queryKeys.aiCampaign.validation(draftId) })
    },
  })
}

/** Delete (soft) a draft — backend allows only `draft` / `failed` status. */
export function useDeleteAiCampaignDraft(projectId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (draftId) => apiService.deleteAiCampaignDraft(draftId),
    onSuccess: (_res, draftId) => {
      queryClient.removeQueries({ queryKey: queryKeys.aiCampaign.draft(draftId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.aiCampaign.all(projectId) })
    },
  })
}

// ── Phase 4 — conversational AI editing ─────────────────────────────────
// Every mutation below is scoped to one draftId's own query keys — never
// the Google Ads dashboard namespace, never the whole project. Accepting a
// proposal writes the returned draft straight into the existing draft cache
// entry (setQueryData) so the workspace updates in place, exactly like a
// manual Save — no unmount/remount, no unrelated refetch (spec §24/§37).

/** Recent proposals for a draft, newest first — the assistant's history list. */
export function useAiCampaignProposals(draftId, { limit = 20 } = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.aiCampaign.proposals(draftId),
    queryFn: () => apiService.getAiCampaignProposals(draftId, { limit }),
    enabled: !!draftId && enabled,
    staleTime: staleTimes.DYNAMIC,
  })
}

/** One proposal — used while polling-free review of a just-generated proposal. */
export function useAiCampaignProposal(draftId, proposalId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.aiCampaign.proposal(draftId, proposalId),
    queryFn: () => apiService.getAiCampaignProposal(draftId, proposalId),
    enabled: !!draftId && !!proposalId && enabled,
    staleTime: staleTimes.DYNAMIC,
  })
}

/** Ask Claude to propose changes. Primes the proposal's own cache entry and refreshes the history list. */
export function useGenerateProposal(draftId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (instruction) => apiService.generateAiCampaignProposal(draftId, instruction),
    onSuccess: (res) => {
      const proposal = res?.data?.proposal
      const proposalId = proposal?._id || proposal?.id
      if (proposalId) {
        queryClient.setQueryData(queryKeys.aiCampaign.proposal(draftId, proposalId), { success: true, data: proposal })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.aiCampaign.proposals(draftId) })
    },
  })
}

/**
 * Accept a ready proposal — atomic + revision-checked on the backend. On
 * success, writes the updated draft straight into the draft cache (the
 * workspace picks it up via its existing version-watch effect) and marks
 * the proposal accepted in its own cache entry.
 */
export function useAcceptProposal(draftId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (proposalId) => apiService.acceptAiCampaignProposal(draftId, proposalId),
    onSuccess: (res) => {
      const { draft, proposal } = res?.data || {}
      if (draft) queryClient.setQueryData(queryKeys.aiCampaign.draft(draftId), { success: true, data: draft })
      const proposalId = proposal?._id || proposal?.id
      if (proposalId) {
        queryClient.setQueryData(queryKeys.aiCampaign.proposal(draftId, proposalId), { success: true, data: proposal })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.aiCampaign.proposals(draftId) })
      // Accepting also bumps AiCampaignDraft.version — same staleness rule
      // as a manual save applies to any cached readiness result.
      queryClient.invalidateQueries({ queryKey: queryKeys.aiCampaign.validation(draftId) })
    },
  })
}

/** Reject a ready proposal — draft is never touched. */
export function useRejectProposal(draftId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (proposalId) => apiService.rejectAiCampaignProposal(draftId, proposalId),
    onSuccess: (res) => {
      const proposal = res?.data
      const proposalId = proposal?._id || proposal?.id
      if (proposalId) {
        queryClient.setQueryData(queryKeys.aiCampaign.proposal(draftId, proposalId), { success: true, data: proposal })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.aiCampaign.proposals(draftId) })
    },
  })
}

// ── Phase 5 — pre-publish readiness validation ──────────────────────────
// Read-only from the workspace's point of view: running validation never
// mutates the draft or Google Ads, it only computes + persists a readiness
// report. The workspace re-invalidates this on save / after a proposal is
// accepted (both bump AiCampaignDraft.version) so a stale readiness badge
// never lingers silently — see AiCampaignWorkspace's version-watch effect.

/** The most recently computed validation result for a draft (null if never run). */
export function useAiCampaignValidation(draftId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.aiCampaign.validation(draftId),
    queryFn: () => apiService.getAiCampaignValidation(draftId),
    enabled: !!draftId && enabled,
    staleTime: staleTimes.DYNAMIC,
  })
}

/** Run readiness validation now. Writes the fresh result straight into the validation cache entry. */
export function useRunAiCampaignValidation(draftId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiService.runAiCampaignValidation(draftId),
    onSuccess: (res) => {
      queryClient.setQueryData(queryKeys.aiCampaign.validation(draftId), { success: true, data: res?.data })
    },
  })
}

// ── Phase 6 — Google Ads publish pipeline ────────────────────────────────
// The browser only ever calls these two endpoints; neither carries a
// Google Ads mutation payload — the server derives everything itself.

/** The latest publish attempt for a draft (null if never published/attempted). */
export function useAiCampaignPublishStatus(draftId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.aiCampaign.publish(draftId),
    queryFn: () => apiService.getAiCampaignPublishStatus(draftId),
    enabled: !!draftId && enabled,
    staleTime: staleTimes.DYNAMIC,
  })
}

/**
 * Publish this draft to the connected Google Ads account. On success, both
 * the publish-status cache entry AND the draft cache entry are updated
 * directly (no full refetch/flicker) — the draft now carries `status:
 * 'published'`, so the workspace's own read-only guard takes effect
 * immediately.
 */
export function usePublishAiCampaignDraft(draftId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiService.publishAiCampaignDraft(draftId),
    onSuccess: (res) => {
      const { draft, attempt } = res?.data || {}
      queryClient.setQueryData(queryKeys.aiCampaign.publish(draftId), { success: true, data: { draft, attempt } })
      if (draft) queryClient.setQueryData(queryKeys.aiCampaign.draft(draftId), { success: true, data: draft })
    },
  })
}

// ── Phase 7 — performance + AI optimization ──────────────────────────────
// Only meaningful for a published campaign. No polling/auto-refresh (spec
// §31 — explicit "Refresh performance" only); approve/reject write the
// mutated recommendation straight into the optimization cache entry so the
// list updates in place with no flicker/refetch.

/** The latest persisted opportunities/recommendations for a draft (no Claude call, no Google Ads read — just a Mongo read). */
export function useAiCampaignOptimizationAnalysis(draftId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.aiCampaign.optimization(draftId),
    queryFn: () => apiService.getAiCampaignOptimizationAnalysis(draftId),
    enabled: !!draftId && enabled,
    staleTime: staleTimes.DYNAMIC,
  })
}

/** Run a fresh performance read + opportunity detection + (conditional) AI recommendation pass. Explicit only — never auto-triggered. */
export function useAnalyzeAiCampaignOptimization(draftId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args) => apiService.analyzeAiCampaignOptimization(draftId, args),
    onSuccess: (res) => {
      queryClient.setQueryData(queryKeys.aiCampaign.optimization(draftId), { success: true, data: res?.data })
    },
  })
}

/** Approve (and atomically execute) one recommendation. Updates just that recommendation in the cached list — no full refetch. */
export function useApproveAiCampaignOptimizationRecommendation(draftId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (recommendationId) => apiService.approveAiCampaignOptimizationRecommendation(draftId, recommendationId),
    onSuccess: (res) => {
      const updated = res?.data?.recommendation
      if (!updated) return
      queryClient.setQueryData(queryKeys.aiCampaign.optimization(draftId), (prev) => {
        if (!prev?.data) return prev
        return { ...prev, data: { ...prev.data, recommendations: prev.data.recommendations.map((r) => (r._id === updated._id ? updated : r)) } }
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.aiCampaign.optimizationHistory(draftId) })
    },
  })
}

/** Reject one recommendation — nothing executes. */
export function useRejectAiCampaignOptimizationRecommendation(draftId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (recommendationId) => apiService.rejectAiCampaignOptimizationRecommendation(draftId, recommendationId),
    onSuccess: (res) => {
      const updated = res?.data
      if (!updated) return
      queryClient.setQueryData(queryKeys.aiCampaign.optimization(draftId), (prev) => {
        if (!prev?.data) return prev
        return { ...prev, data: { ...prev.data, recommendations: prev.data.recommendations.map((r) => (r._id === updated._id ? updated : r)) } }
      })
    },
  })
}

/** The executed-optimization audit trail. */
export function useAiCampaignOptimizationHistory(draftId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.aiCampaign.optimizationHistory(draftId),
    queryFn: () => apiService.getAiCampaignOptimizationHistory(draftId),
    enabled: !!draftId && enabled,
    staleTime: staleTimes.DYNAMIC,
  })
}

// ── Phase 8 — automation & autonomous optimization controls ──────────────
// A policy is a structured record the user builds through a form — the
// browser never assembles or sends raw JSON/code. Every write here mutates
// the SAME cached policies list in place, no full refetch, same convention
// as the optimization hooks above.

/** Every automation policy configured for this draft. */
export function useAiCampaignAutomationPolicies(draftId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.aiCampaign.automationPolicies(draftId),
    queryFn: () => apiService.listAiCampaignAutomationPolicies(draftId),
    enabled: !!draftId && enabled,
    staleTime: staleTimes.DYNAMIC,
  })
}

/** Create a new (always disabled, always observe-mode) policy — never enabled/executing at creation. */
export function useCreateAiCampaignAutomationPolicy(draftId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => apiService.createAiCampaignAutomationPolicy(draftId, payload),
    onSuccess: (res) => {
      const created = res?.data
      if (!created) return
      queryClient.setQueryData(queryKeys.aiCampaign.automationPolicies(draftId), (prev) => {
        if (!prev?.data) return prev
        return { ...prev, data: [created, ...prev.data] }
      })
    },
  })
}

/** Structural edit (rules/limits/schedule/name) — never touches enabled/mode. */
export function useUpdateAiCampaignAutomationPolicy(draftId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ policyId, patch }) => apiService.updateAiCampaignAutomationPolicy(draftId, policyId, patch),
    onSuccess: (res) => {
      const updated = res?.data
      if (!updated) return
      queryClient.setQueryData(queryKeys.aiCampaign.automationPolicies(draftId), (prev) => {
        if (!prev?.data) return prev
        return { ...prev, data: prev.data.map((p) => (p._id === updated._id ? updated : p)) }
      })
    },
  })
}

export function useDeleteAiCampaignAutomationPolicy(draftId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (policyId) => apiService.deleteAiCampaignAutomationPolicy(draftId, policyId),
    onSuccess: (_res, policyId) => {
      queryClient.setQueryData(queryKeys.aiCampaign.automationPolicies(draftId), (prev) => {
        if (!prev?.data) return prev
        return { ...prev, data: prev.data.filter((p) => p._id !== policyId) }
      })
    },
  })
}

/** The explicit "turn this policy on/off" action — always a separate, deliberate click from a structural edit. */
export function useSetAiCampaignAutomationPolicyEnabled(draftId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ policyId, enabled }) => apiService.setAiCampaignAutomationPolicyEnabled(draftId, policyId, enabled),
    onSuccess: (res) => {
      const updated = res?.data
      if (!updated) return
      queryClient.setQueryData(queryKeys.aiCampaign.automationPolicies(draftId), (prev) => {
        if (!prev?.data) return prev
        return { ...prev, data: prev.data.map((p) => (p._id === updated._id ? updated : p)) }
      })
    },
  })
}

/** The explicit "switch observe / recommend / execute" action — mode never changes as a side effect of anything else. */
export function useSetAiCampaignAutomationPolicyMode(draftId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ policyId, mode }) => apiService.setAiCampaignAutomationPolicyMode(draftId, policyId, mode),
    onSuccess: (res) => {
      const updated = res?.data
      if (!updated) return
      queryClient.setQueryData(queryKeys.aiCampaign.automationPolicies(draftId), (prev) => {
        if (!prev?.data) return prev
        return { ...prev, data: prev.data.map((p) => (p._id === updated._id ? updated : p)) }
      })
    },
  })
}

/** Read-only "what would this policy do right now" — never creates a run/recommendation/opportunity. Modeled as a mutation since it's an explicit, on-demand action, not cached background state. */
export function usePreviewAiCampaignAutomationPolicy(draftId) {
  return useMutation({
    mutationFn: (policyId) => apiService.previewAiCampaignAutomationPolicy(draftId, policyId),
  })
}

/** One policy's own run history. */
export function useAiCampaignAutomationPolicyHistory(draftId, policyId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.aiCampaign.automationPolicyHistory(draftId, policyId),
    queryFn: () => apiService.getAiCampaignAutomationPolicyHistory(draftId, policyId),
    enabled: !!draftId && !!policyId && enabled,
    staleTime: staleTimes.DYNAMIC,
  })
}

/** Every automation run for this draft, across all its policies. */
export function useAiCampaignAutomationHistory(draftId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.aiCampaign.automationHistory(draftId),
    queryFn: () => apiService.getAiCampaignAutomationHistory(draftId),
    enabled: !!draftId && enabled,
    staleTime: staleTimes.DYNAMIC,
  })
}
