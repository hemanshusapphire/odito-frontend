"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Bot } from 'lucide-react'
import { useAiCampaignAutomationPolicies } from '@/hooks/useAiCampaign'
import { friendlyErrorMessage } from '@/lib/aiCampaignConstants'
import AutomationPolicyCard from './AutomationPolicyCard'
import AutomationPolicyForm from './AutomationPolicyForm'

/**
 * Phase 8 — "Automation" section of the workspace (spec §55/§59).
 *
 * Only ever mounted for a PUBLISHED campaign (same gating as
 * OptimizationPanel — Phase 8 automation has no meaning for a draft that
 * was never published). Nothing here runs on mount: creating a policy
 * never enables it, and no policy runs anything until a user explicitly
 * turns it on (default: disabled + observe) — see AutomationPolicyCard for
 * the enable/mode confirmation dialogs that gate the two consequential
 * actions.
 */
export default function AutomationPanel({ draftId }) {
  const [createOpen, setCreateOpen] = useState(false)
  const { data, isLoading, isError, error } = useAiCampaignAutomationPolicies(draftId)
  const policies = data?.data || []

  return (
    <div className="space-y-4">
      <Card className="gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4" />
              Automation
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Define rules Odito checks on a schedule. Each policy starts disabled and in observe-only mode — you decide when, and how much, it's allowed to do.
            </p>
          </div>
          <Button type="button" size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)} data-testid="create-policy">
            <Plus className="h-3.5 w-3.5" />
            New policy
          </Button>
        </div>
      </Card>

      {isLoading && (
        <Card className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading automation policies…
        </Card>
      )}

      {isError && (
        <Card className="p-6">
          <p className="text-sm text-destructive">{friendlyErrorMessage(error, 'Could not load automation policies.')}</p>
        </Card>
      )}

      {!isLoading && !isError && policies.length === 0 && (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          No automation policies yet. Create one to have Odito watch this campaign for you.
        </Card>
      )}

      <div className="space-y-3">
        {policies.map((policy) => (
          <AutomationPolicyCard key={policy._id} draftId={draftId} policy={policy} />
        ))}
      </div>

      {createOpen && <AutomationPolicyForm draftId={draftId} onClose={() => setCreateOpen(false)} />}
    </div>
  )
}
