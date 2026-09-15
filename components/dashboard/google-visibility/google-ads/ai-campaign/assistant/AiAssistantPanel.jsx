"use client"

import { useState } from 'react'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, Send, AlertTriangle, History } from 'lucide-react'

import ProposalReviewCard from './ProposalReviewCard'
import {
  useGenerateProposal,
  useAcceptProposal,
  useRejectProposal,
  useAiCampaignProposals,
} from '@/hooks/useAiCampaign'
import { friendlyErrorMessage, EDITABLE_STATUSES } from '@/lib/aiCampaignConstants'

const INSTRUCTION_MAX = 2000

// Statuses where the Phase 4 backend refuses to generate a proposal at all
// (campaignProposalService.generateProposal checks the SAME
// EDITABLE_STATUSES list) but the reason is transient — the button is
// disabled with an explanation rather than hidden, so the user isn't left
// wondering where Ask AI went.
const TRANSIENT_BLOCK_MESSAGES = {
  generating: 'Campaign generation is still in progress.',
  publishing: 'Campaign publishing is in progress.',
}

const SUGGESTED_PROMPTS = [
  'Improve my ad headlines',
  'Make the ads more conversion-focused',
  'Improve keyword relevance',
  'Review the campaign structure',
  'Find keyword overlap',
]

/**
 * Published campaigns are NOT in EDITABLE_STATUSES — campaignProposalService.js
 * rejects a proposal request outright ("A campaign in status \"published\"
 * cannot be edited by AI right now."). Rather than let that call fail (or
 * hide Ask AI entirely, which reads as a bug — see the driving screenshot),
 * the Sheet stays reachable and explains the real, current architecture:
 * further changes to a live campaign go through Phase 7 Optimization, not
 * a draft-edit proposal.
 */
function PublishedAssistantNotice({ onOpenOptimization }) {
  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm" data-testid="published-assistant-notice">
      <p className="text-foreground">
        This campaign is published. Ask AI can help analyze or recommend improvements, but changes must go through the optimization workflow.
      </p>
      <Button type="button" size="sm" className="gap-1.5" onClick={onOpenOptimization} data-testid="open-optimization-cta">
        <Sparkles className="h-3.5 w-3.5" />
        Open Optimization
      </Button>
    </div>
  )
}

/**
 * Loading state while Claude proposes changes. Deliberately ONE honest
 * message tied to real request state (`generateMutation.isPending`) —
 * no `setTimeout`, no simulated stages, no fake progress. The backend
 * proposal call is a single opaque request/response, exactly like Phase 2
 * generation; pretending to know intermediate stages here would be the
 * same fabrication already fixed for the campaign-generation loading
 * screen (see AiCampaignGenerationState.jsx).
 */
function GeneratingState() {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-3 text-sm text-muted-foreground" role="status" aria-live="polite">
      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
      AI is analyzing your campaign…
    </div>
  )
}

/**
 * Conversational AI editing assistant (Phase 4, spec §17-§26).
 *
 * Lives inside the existing Campaign Workspace (no separate page). A single
 * request produces ONE reviewable proposal — never applied automatically.
 * `isWorkspaceDirty` blocks new requests / acceptance while the user has
 * unsaved manual edits, so an AI-accepted change (an immediate server
 * write) can never be silently clobbered by a later Save of a stale local
 * copy, and a manual edit mid-review can't race an accept — the user is
 * asked to save (or discard) first.
 */
export default function AiAssistantPanel({ draftId, draftStatus, isWorkspaceDirty, disabled, onOpenOptimization }) {
  const [open, setOpen] = useState(false)
  const [instruction, setInstruction] = useState('')
  const [activeProposal, setActiveProposal] = useState(null)
  const [generateError, setGenerateError] = useState(null)
  const [acceptError, setAcceptError] = useState(null)

  // Mirrors campaignProposalService.generateProposal's own EDITABLE_STATUSES
  // check (spec §7) — the frontend never lets a request reach an endpoint
  // the backend is already known to reject for this status.
  const isPublished = draftStatus === 'published'
  const isEditableStatus = EDITABLE_STATUSES.includes(draftStatus)
  const transientBlockMessage = !isEditableStatus && !isPublished ? (TRANSIENT_BLOCK_MESSAGES[draftStatus] || null) : null
  const triggerDisabled = disabled || !!transientBlockMessage

  const generateMutation = useGenerateProposal(draftId)
  const acceptMutation = useAcceptProposal(draftId)
  const rejectMutation = useRejectProposal(draftId)
  // Published mode never shows the request form/history — skip the query entirely.
  const historyQuery = useAiCampaignProposals(draftId, { limit: 10 }, { enabled: open && !isPublished })

  const history = (historyQuery.data?.data || []).filter((p) => (p._id || p.id) !== (activeProposal?._id || activeProposal?.id))

  const dirtyBlockReason = isWorkspaceDirty
    ? 'Save your current changes first, then ask the AI assistant to make more.'
    : null

  async function handleSend(e) {
    e?.preventDefault()
    const trimmed = instruction.trim()
    if (!trimmed || generateMutation.isPending || isWorkspaceDirty) return
    setGenerateError(null)
    try {
      const res = await generateMutation.mutateAsync(trimmed)
      setActiveProposal(res?.data?.proposal || null)
      setInstruction('')
    } catch (err) {
      setGenerateError(friendlyErrorMessage(err))
    }
  }

  async function handleAccept() {
    if (!activeProposal) return
    setAcceptError(null)
    try {
      const res = await acceptMutation.mutateAsync(activeProposal._id || activeProposal.id)
      setActiveProposal(res?.data?.proposal || null)
    } catch (err) {
      setAcceptError(friendlyErrorMessage(err))
    }
  }

  async function handleReject() {
    if (!activeProposal) return
    try {
      const res = await rejectMutation.mutateAsync(activeProposal._id || activeProposal.id)
      setActiveProposal(res?.data || null)
    } catch (err) {
      setAcceptError(friendlyErrorMessage(err))
    }
  }

  function openPastProposal(p) {
    setActiveProposal(p)
    setGenerateError(null)
    setAcceptError(null)
  }

  function applySuggestedPrompt(text) {
    if (generateMutation.isPending || isWorkspaceDirty) return
    setInstruction(text)
  }

  const showReview = !!activeProposal && !generateMutation.isPending

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={triggerDisabled}
          title={transientBlockMessage || undefined}
          aria-label={transientBlockMessage ? `Ask AI — ${transientBlockMessage}` : 'Ask AI'}
          data-testid="ai-assistant-trigger"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          Ask AI
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Assistant
          </SheetTitle>
          <SheetDescription>
            {isPublished
              ? 'Ask me to improve this campaign.'
              : 'Describe a change in plain language. Claude proposes exact edits — nothing changes until you review and accept.'}
          </SheetDescription>
        </SheetHeader>

        {isPublished ? (
          <PublishedAssistantNotice onOpenOptimization={() => { setOpen(false); onOpenOptimization?.() }} />
        ) : (
          <>
            {dirtyBlockReason && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50/70 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-300">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {dirtyBlockReason}
              </div>
            )}

            {!activeProposal && !generateMutation.isPending && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suggested actions</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => applySuggestedPrompt(p)}
                      disabled={isWorkspaceDirty}
                      className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50"
                      data-testid="suggested-prompt"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-2">
              <label htmlFor="assistant-instruction" className="text-sm font-medium text-foreground">
                What would you like to change?
              </label>
              <Textarea
                id="assistant-instruction"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value.slice(0, INSTRUCTION_MAX))}
                placeholder="e.g. Make the ads more premium and add an ad group for local SEO."
                rows={3}
                disabled={generateMutation.isPending || isWorkspaceDirty}
                data-testid="assistant-instruction"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{instruction.length}/{INSTRUCTION_MAX}</span>
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1.5"
                  disabled={!instruction.trim() || generateMutation.isPending || isWorkspaceDirty}
                  data-testid="assistant-send"
                >
                  {generateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  {generateMutation.isPending ? 'Thinking…' : 'Send'}
                </Button>
              </div>
            </form>

            {generateMutation.isPending && <GeneratingState />}

            {generateError && !generateMutation.isPending && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive" role="alert">
                {generateError}
              </div>
            )}

            {showReview && (
              <ProposalReviewCard
                proposal={activeProposal}
                isAccepting={acceptMutation.isPending}
                isRejecting={rejectMutation.isPending}
                acceptError={acceptError}
                onAccept={handleAccept}
                onReject={handleReject}
                disabled={isWorkspaceDirty}
                disabledReason={dirtyBlockReason}
              />
            )}

            {history.length > 0 && (
              <div className="space-y-2 border-t border-border/60 pt-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <History className="h-3.5 w-3.5" />
                  Recent requests
                </div>
                <ul className="space-y-1.5">
                  {history.map((p) => (
                    <li key={p._id || p.id}>
                      <button
                        type="button"
                        onClick={() => openPastProposal(p)}
                        className="flex w-full items-start justify-between gap-2 rounded-lg border border-border/50 bg-muted/20 px-2.5 py-2 text-left text-xs hover:bg-muted/50"
                      >
                        <span className="line-clamp-2 flex-1 text-foreground">{p.instruction}</span>
                        <Badge variant={p.status === 'ready' ? 'info' : p.status === 'accepted' ? 'success' : 'secondary'} className="shrink-0 text-[10px]">
                          {p.status}
                        </Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
