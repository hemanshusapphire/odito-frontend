import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useGenerateAiCampaign,
  useUpdateAiCampaignDraft,
  useDeleteAiCampaignDraft,
  useGenerateProposal,
  useAcceptProposal,
  useRejectProposal,
} from './useAiCampaign'
import { queryKeys } from '@/lib/query/keys'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@/lib/apiService', () => ({
  default: {
    generateAiCampaign: vi.fn().mockResolvedValue({ success: true, data: { draft: { _id: 'draft-9', status: 'ready', campaign: {}, adGroups: [] }, generation: { generationId: 'gen-1' } } }),
    updateAiCampaignDraft: vi.fn().mockResolvedValue({ success: true, data: { _id: 'draft-9', status: 'ready', version: 2, campaign: {}, adGroups: [] } }),
    deleteAiCampaignDraft: vi.fn().mockResolvedValue({ success: true }),
    generateAiCampaignProposal: vi.fn().mockResolvedValue({ success: true, data: { proposal: { _id: 'prop-1', status: 'ready', changes: [] }, generationId: 'edit-1' } }),
    acceptAiCampaignProposal: vi.fn().mockResolvedValue({ success: true, data: { draft: { _id: 'draft-9', version: 3, campaign: {}, adGroups: [] }, proposal: { _id: 'prop-1', status: 'accepted' } } }),
    rejectAiCampaignProposal: vi.fn().mockResolvedValue({ success: true, data: { _id: 'prop-1', status: 'rejected' } }),
  },
}))

import apiService from '@/lib/apiService'

let container
let root
let queryClient
let hookApi

function Harness({ projectId, draftId }) {
  const gen = useGenerateAiCampaign(projectId)
  const upd = useUpdateAiCampaignDraft(projectId)
  const del = useDeleteAiCampaignDraft(projectId)
  const genProposal = useGenerateProposal(draftId)
  const acceptProposal = useAcceptProposal(draftId)
  const rejectProposal = useRejectProposal(draftId)
  hookApi = { gen, upd, del, genProposal, acceptProposal, rejectProposal }
  return null
}

function render(projectId = 'proj-1', draftId = 'draft-9') {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(
      React.createElement(QueryClientProvider, { client: queryClient }, React.createElement(Harness, { projectId, draftId })),
    )
  })
}

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  vi.clearAllMocks()
})
afterEach(() => {
  act(() => root?.unmount())
  container?.remove()
})

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('useGenerateAiCampaign', () => {
  it('calls apiService.generateAiCampaign and primes the new draft cache entry', async () => {
    render('proj-1')
    await act(async () => {
      await hookApi.gen.mutateAsync({ brief: { businessDescription: 'x', campaignGoal: 'LEADS', dailyBudget: 1000, currency: 'INR', location: { name: 'N', countryCode: 'IN', type: 'CITY' } } })
      await flush()
    })
    expect(apiService.generateAiCampaign).toHaveBeenCalledWith('proj-1', expect.objectContaining({ campaignGoal: 'LEADS' }), undefined)
    const cached = queryClient.getQueryData(queryKeys.aiCampaign.draft('draft-9'))
    expect(cached?.data?._id).toBe('draft-9')
  })
})

describe('useUpdateAiCampaignDraft', () => {
  it('calls PATCH and updates the draft cache from the response', async () => {
    render('proj-1')
    await act(async () => {
      await hookApi.upd.mutateAsync({ draftId: 'draft-9', updates: { campaign: { name: 'Renamed' }, adGroups: [] } })
      await flush()
    })
    expect(apiService.updateAiCampaignDraft).toHaveBeenCalledWith('draft-9', { campaign: { name: 'Renamed' }, adGroups: [] })
    expect(queryClient.getQueryData(queryKeys.aiCampaign.draft('draft-9'))?.data?.version).toBe(2)
  })
})

describe('useDeleteAiCampaignDraft', () => {
  it('calls DELETE and removes the draft cache entry', async () => {
    render('proj-1')
    queryClient.setQueryData(queryKeys.aiCampaign.draft('draft-9'), { data: { _id: 'draft-9' } })
    await act(async () => {
      await hookApi.del.mutateAsync('draft-9')
      await flush()
    })
    expect(apiService.deleteAiCampaignDraft).toHaveBeenCalledWith('draft-9')
    expect(queryClient.getQueryData(queryKeys.aiCampaign.draft('draft-9'))).toBeUndefined()
  })
})

// ── Phase 4 — conversational editing ────────────────────────────────────

describe('useGenerateProposal', () => {
  it('calls the assistant endpoint and primes the proposal cache entry', async () => {
    render('proj-1', 'draft-9')
    await act(async () => {
      await hookApi.genProposal.mutateAsync('Make the ads more premium')
      await flush()
    })
    expect(apiService.generateAiCampaignProposal).toHaveBeenCalledWith('draft-9', 'Make the ads more premium')
    const cached = queryClient.getQueryData(queryKeys.aiCampaign.proposal('draft-9', 'prop-1'))
    expect(cached?.data?.status).toBe('ready')
  })
})

describe('useAcceptProposal', () => {
  it('writes the returned draft straight into the draft cache (no refetch needed) and updates the proposal cache', async () => {
    render('proj-1', 'draft-9')
    await act(async () => {
      await hookApi.acceptProposal.mutateAsync('prop-1')
      await flush()
    })
    expect(apiService.acceptAiCampaignProposal).toHaveBeenCalledWith('draft-9', 'prop-1')
    expect(queryClient.getQueryData(queryKeys.aiCampaign.draft('draft-9'))?.data?.version).toBe(3)
    expect(queryClient.getQueryData(queryKeys.aiCampaign.proposal('draft-9', 'prop-1'))?.data?.status).toBe('accepted')
  })
})

describe('useRejectProposal', () => {
  it('calls reject and updates the proposal cache; never touches the draft cache', async () => {
    render('proj-1', 'draft-9')
    queryClient.setQueryData(queryKeys.aiCampaign.draft('draft-9'), { data: { _id: 'draft-9', version: 1 } })
    await act(async () => {
      await hookApi.rejectProposal.mutateAsync('prop-1')
      await flush()
    })
    expect(apiService.rejectAiCampaignProposal).toHaveBeenCalledWith('draft-9', 'prop-1')
    expect(queryClient.getQueryData(queryKeys.aiCampaign.proposal('draft-9', 'prop-1'))?.data?.status).toBe('rejected')
    expect(queryClient.getQueryData(queryKeys.aiCampaign.draft('draft-9'))?.data?.version).toBe(1) // untouched
  })
})
