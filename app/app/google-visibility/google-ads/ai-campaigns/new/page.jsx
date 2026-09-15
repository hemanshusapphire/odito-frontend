"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useProject } from '@/contexts/ProjectContext'
import { useGoogleAdsConnection } from '@/hooks/useDashboardQueries'
import { useGenerateAiCampaign } from '@/hooks/useAiCampaign'
import { briefFromForm } from '@/lib/aiCampaignWorkspace'
import { friendlyErrorMessage } from '@/lib/aiCampaignConstants'

import AiCampaignSetupForm from '@/components/dashboard/google-visibility/google-ads/ai-campaign/AiCampaignSetupForm'
import AiCampaignGenerationState from '@/components/dashboard/google-visibility/google-ads/ai-campaign/AiCampaignGenerationState'
import AiCampaignErrorState from '@/components/dashboard/google-visibility/google-ads/ai-campaign/AiCampaignErrorState'

const BASE = '/app/google-visibility/google-ads/ai-campaigns'

/**
 * AI Campaign — setup + generation (spec §5-§11).
 *
 * Controlled state machine: setup → generating → (workspace | error).
 * On success we navigate to the workspace route for the new draft. On
 * failure the form is preserved and the classified backend error is shown
 * as a friendly message (raw provider/Claude errors are never displayed).
 */
export default function NewAiCampaignPage() {
  const router = useRouter()
  const { activeProjectId, activeProject } = useProject()
  const connection = useGoogleAdsConnection(activeProjectId)
  const generate = useGenerateAiCampaign(activeProjectId)

  const [phase, setPhase] = useState('setup') // 'setup' | 'generating' | 'error'
  const [errorInfo, setErrorInfo] = useState(null) // { message, draftId }
  const lastFormRef = useRef(null)

  // Guard against navigating away mid-generation losing the request result.
  useEffect(() => {
    if (phase !== 'generating') return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [phase])

  async function runGeneration(form) {
    lastFormRef.current = form
    setPhase('generating')
    setErrorInfo(null)
    try {
      const res = await generate.mutateAsync({ brief: briefFromForm(form) })
      const draft = res?.data?.draft
      const draftId = draft?._id || draft?.id
      if (!draftId) {
        setErrorInfo({ message: 'The campaign was generated but could not be opened. Please check your drafts.' })
        setPhase('error')
        return
      }
      router.push(`${BASE}/${draftId}`)
    } catch (err) {
      // A failed generation that still persisted a draft returns
      // { data: { draftId, status: 'failed' } } — preserved by apiService
      // as err.data.
      setErrorInfo({
        message: friendlyErrorMessage(err),
        draftId: err?.data?.draftId,
      })
      setPhase('error')
    }
  }

  if (!activeProjectId) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 text-sm text-muted-foreground">
        Select or create a project to build a campaign.
      </div>
    )
  }

  // The AI builder needs a connected Google Ads account (the backend
  // resolves the customer id from it). Surface that clearly instead of
  // letting generation fail.
  const notReady = !connection.isLoading && !connection.selected
  if (notReady && phase === 'setup') {
    return (
      <div className="flex-1">
        <AiCampaignErrorState
          title="Connect a Google Ads account first"
          message="AI Campaign drafts are linked to your connected Google Ads account. Connect and select an account on the Google Ads page, then come back."
          onBack={() => router.push('/app/google-visibility/google-ads')}
        />
      </div>
    )
  }

  if (phase === 'generating') {
    return <div className="flex-1"><AiCampaignGenerationState brief={lastFormRef.current} /></div>
  }

  if (phase === 'error') {
    return (
      <div className="flex-1">
        <AiCampaignErrorState
          message={errorInfo?.message}
          onBack={() => setPhase('setup')}
          onRetry={() => lastFormRef.current && runGeneration(lastFormRef.current)}
          draftId={errorInfo?.draftId}
          onOpenDraft={(id) => router.push(`${BASE}/${id}`)}
        />
      </div>
    )
  }

  return (
    <div className="flex-1">
      <AiCampaignSetupForm
        onGenerate={runGeneration}
        isGenerating={generate.isPending}
        backHref={BASE}
        prefill={{
          businessName: activeProject?.verified_business?.name || activeProject?.project_name || '',
          landingPageUrl: activeProject?.main_url || '',
        }}
        accountCurrency={connection.data?.currencyCode || null}
      />
    </div>
  )
}
