"use client"

import { useCallback, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { useProject } from '@/contexts/ProjectContext'
import { useAiCampaignDraft, useUpdateAiCampaignDraft } from '@/hooks/useAiCampaign'
import { friendlyErrorMessage, EDITABLE_STATUSES } from '@/lib/aiCampaignConstants'

import AiCampaignWorkspace from '@/components/dashboard/google-visibility/google-ads/ai-campaign/AiCampaignWorkspace'
import AiCampaignErrorState from '@/components/dashboard/google-visibility/google-ads/ai-campaign/AiCampaignErrorState'

const BASE = '/app/google-visibility/google-ads/ai-campaigns'

/**
 * AI Campaign workspace (spec §12-§22).
 *
 * Server state: the draft (useAiCampaignDraft). Local UI state lives in
 * AiCampaignWorkspace's reducer. Save is an explicit whole-draft PATCH via
 * useUpdateAiCampaignDraft; the mutation primes the draft's cache entry so
 * the workspace does not unmount/remount on save (spec §24).
 */
export default function AiCampaignWorkspacePage() {
  const router = useRouter()
  const { draftId } = useParams()
  const { activeProjectId } = useProject()

  const { data, isLoading, isError, error, refetch } = useAiCampaignDraft(draftId)
  const updateMutation = useUpdateAiCampaignDraft(activeProjectId)

  const [saveError, setSaveError] = useState(null)
  const [savedAt, setSavedAt] = useState(null)
  const savedTimer = useRef(null)

  const handleSave = useCallback(
    async (payload) => {
      setSaveError(null)
      try {
        await updateMutation.mutateAsync({ draftId, updates: payload })
        setSavedAt(Date.now())
        clearTimeout(savedTimer.current)
        savedTimer.current = setTimeout(() => setSavedAt(null), 4000)
        return true
      } catch (err) {
        setSaveError(friendlyErrorMessage(err, 'Could not save your changes. Please try again.'))
        return false
      }
    },
    [draftId, updateMutation],
  )

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading campaign…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex-1">
        <AiCampaignErrorState
          title="Couldn't load this campaign"
          message={friendlyErrorMessage(error)}
          onRetry={() => refetch()}
          onBack={() => router.push(BASE)}
        />
      </div>
    )
  }

  const draft = data?.data
  if (!draft) {
    return (
      <div className="flex-1">
        <AiCampaignErrorState
          title="Campaign not found"
          message="This campaign draft could not be found. It may have been deleted."
          onBack={() => router.push(BASE)}
        />
      </div>
    )
  }

  // A draft still generating (or that failed) can't be edited yet.
  if (draft.status === 'generating') {
    return (
      <div className="flex-1 flex items-center justify-center py-24 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> This campaign is still being generated…
      </div>
    )
  }
  if (draft.status === 'failed') {
    return (
      <div className="flex-1">
        <AiCampaignErrorState
          title="This campaign didn't generate"
          message="Generation failed for this draft. Start a new AI campaign to try again."
          onBack={() => router.push(BASE)}
          onRetry={() => router.push(`${BASE}/new`)}
        />
      </div>
    )
  }

  return (
    <AiCampaignWorkspace
      draft={draft}
      onSave={handleSave}
      isSaving={updateMutation.isPending}
      saveError={saveError}
      savedAt={savedAt}
      backHref={BASE}
    />
  )
}
