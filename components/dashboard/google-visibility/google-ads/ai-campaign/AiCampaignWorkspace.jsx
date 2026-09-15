"use client"

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LayoutGrid, SlidersHorizontal, ListTree, ShieldCheck, Sparkles, Bot, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import DraftStatusBadge from './DraftStatusBadge'
import CampaignOverviewCard from './CampaignOverviewCard'
import CampaignSettingsForm from './CampaignSettingsForm'
import AdGroupEditor from './AdGroupEditor'
import CampaignSaveBar from './CampaignSaveBar'
import CampaignValidationSummary from './CampaignValidationSummary'
import CampaignReadinessPanel from './CampaignReadinessPanel'
import AiAssistantPanel from './assistant/AiAssistantPanel'
import OptimizationPanel from './optimization/OptimizationPanel'
import AutomationPanel from './automation/AutomationPanel'

import {
  initWorkspaceState,
  workspaceReducer,
  validateWorkspace,
  isWorkspaceDirty,
  toPatchPayload,
} from '@/lib/aiCampaignWorkspace'
import { adGroupSummary, PUBLISH_STAGE_STATUSES } from '@/lib/aiCampaignConstants'

const BASE_SECTIONS = [
  { id: 'overview', label: 'Overview', Icon: LayoutGrid },
  { id: 'settings', label: 'Campaign settings', Icon: SlidersHorizontal },
  { id: 'adgroups', label: 'Ad groups', Icon: ListTree },
  { id: 'readiness', label: 'Campaign readiness', Icon: ShieldCheck },
]
// Phase 7 only has meaning for a campaign Odito has actually published —
// there is no Google Ads performance to read for a draft that never went
// live (spec §48/§49), so this tab only appears once published.
const OPTIMIZATION_SECTION = { id: 'optimization', label: 'Optimization', Icon: Sparkles }
// Phase 8 automation policies are scoped to a published campaign's real
// Google Ads resources too (see automationPolicyService.js's own
// "draft must be published" check) — same gating as Optimization above.
const AUTOMATION_SECTION = { id: 'automation', label: 'Automation', Icon: Bot }

/** Stable per-ad-group error subset + hash so AdGroupEditor's memo holds. */
function useGroupErrors(errors, adGroups) {
  return useMemo(() => {
    return adGroups.map((_, i) => {
      const prefix = `adGroups[${i}]`
      const subset = {}
      for (const [k, v] of Object.entries(errors)) {
        if (k === prefix || k.startsWith(`${prefix}.`)) subset[k] = v
      }
      return { subset, hash: JSON.stringify(subset) }
    })
  }, [errors, adGroups])
}

export default function AiCampaignWorkspace({ draft, onSave, isSaving, saveError, savedAt, backHref }) {
  const readOnly = PUBLISH_STAGE_STATUSES.includes(draft.status)
  const SECTIONS = draft.status === 'published' ? [...BASE_SECTIONS, OPTIMIZATION_SECTION, AUTOMATION_SECTION] : BASE_SECTIONS

  // Editable copy — initialised once from the server draft. Re-synced only
  // when the server version changes AND the user has no unsaved edits (see
  // the effect below), so a background refetch never discards local work.
  const [state, dispatch] = useReducer(workspaceReducer, draft, initWorkspaceState)
  const baselineRef = useRef(state)
  const [activeSection, setActiveSection] = useState('overview')
  const [selectedAdGroupId, setSelectedAdGroupId] = useState(draft.adGroups?.[0]?.id || null)
  const serverVersionRef = useRef(draft.version)

  useEffect(() => {
    const dirty = isWorkspaceDirty(state, baselineRef.current)
    if (draft.version !== serverVersionRef.current && !dirty) {
      const fresh = initWorkspaceState(draft)
      serverVersionRef.current = draft.version
      baselineRef.current = fresh
      dispatch({ type: 'reset', state: fresh })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  const isDirty = useMemo(() => isWorkspaceDirty(state, baselineRef.current), [state])
  const { errors, count: validationCount } = useMemo(() => validateWorkspace(state), [state])
  const groupErrors = useGroupErrors(errors, state.adGroups)

  // ── unsaved-changes guard (spec §21 — browser-native only) ────────────
  useEffect(() => {
    if (!isDirty) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const selectedAdGroup = state.adGroups.find((ag) => ag.id === selectedAdGroupId) || state.adGroups[0] || null
  const selectedIndex = state.adGroups.findIndex((ag) => ag.id === selectedAdGroup?.id)
  const defaultFinalUrl = state.adGroups?.[0]?.ads?.[0]?.finalUrl || ''

  const handleSave = useCallback(async () => {
    if (isSaving || !isDirty) return
    const payload = toPatchPayload(state)
    const ok = await onSave(payload)
    if (ok) {
      // adopt the just-saved state as the new baseline so the bar flips to
      // "Saved" without waiting for the refetch to round-trip.
      baselineRef.current = state
    }
  }, [isSaving, isDirty, state, onSave])

  // Keep a valid selection when ad groups change.
  useEffect(() => {
    if (state.adGroups.length === 0) {
      setSelectedAdGroupId(null)
      return
    }
    if (!state.adGroups.some((ag) => ag.id === selectedAdGroupId)) {
      setSelectedAdGroupId(state.adGroups[state.adGroups.length - 1].id)
    }
  }, [state.adGroups, selectedAdGroupId])

  function jumpToError(path) {
    // Sitelinks/callouts/structured snippets are shown read-only on the
    // Overview card (no dedicated editor yet) — route there, not Settings,
    // so "Go to this section" doesn't land somewhere the issue isn't visible.
    if (path.startsWith('campaign.sitelinks') || path.startsWith('campaign.callouts') || path.startsWith('campaign.structuredSnippets')) {
      setActiveSection('overview')
      return
    }
    if (path.startsWith('campaign.locations') || path.startsWith('campaign.')) {
      setActiveSection('settings')
      return
    }
    const m = path.match(/^adGroups\[(\d+)\]/)
    if (m) {
      const idx = Number(m[1])
      setActiveSection('adgroups')
      if (state.adGroups[idx]) setSelectedAdGroupId(state.adGroups[idx].id)
    }
  }

  return (
    <div className="flex-1 space-y-5 pb-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href={backHref} className="inline-flex items-center gap-1 hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              AI Campaigns
            </Link>
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Campaign Builder</h1>
          <p className="text-sm text-muted-foreground">
            AI-generated campaign · edit anything, then save your draft.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DraftStatusBadge status={draft.status} />
          {/* Ask AI is the canonical entry point for Phase 4 conversational
              editing, and it is now ALWAYS rendered here — never hidden for
              a published/publishing campaign. Its own status-aware logic
              (generating/publishing disabled with a reason; published shows
              an informational notice + "Open Optimization" instead of the
              edit form) lives inside the component, since only it knows
              which draft statuses the Phase 4 backend actually accepts
              (EDITABLE_STATUSES) — see AiAssistantPanel.jsx. */}
          <AiAssistantPanel
            draftId={draft._id || draft.id}
            draftStatus={draft.status}
            isWorkspaceDirty={isDirty}
            onOpenOptimization={() => setActiveSection('optimization')}
          />
        </div>
      </div>

      {readOnly && (
        <Card className="border-amber-300/60 bg-amber-50/60 p-4 text-sm dark:border-amber-700/50 dark:bg-amber-950/20">
          This campaign is now handled by a later publishing step and can no longer be edited here.
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-[200px_1fr]">
        {/* Section rail */}
        <nav aria-label="Campaign sections" className="lg:sticky lg:top-4 lg:self-start">
          <ul className="flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
            {SECTIONS.map(({ id, label, Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setActiveSection(id)}
                  aria-current={activeSection === id ? 'true' : undefined}
                  className={`flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
                    activeSection === id
                      ? 'bg-primary/10 font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="min-w-0 space-y-5">
          {validationCount > 0 && (
            <CampaignValidationSummary errors={errors} onJump={jumpToError} />
          )}

          {activeSection === 'overview' && (
            <CampaignOverviewCard campaign={state.campaign} adGroups={state.adGroups} status={draft.status} />
          )}

          {activeSection === 'settings' && (
            <fieldset disabled={readOnly} className="contents">
              <CampaignSettingsForm campaign={state.campaign} errors={errors} dispatch={dispatch} />
            </fieldset>
          )}

          {activeSection === 'adgroups' && (
            <div className="space-y-4">
              <Card className="gap-3 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    Ad groups <span className="ml-1 font-mono text-xs text-muted-foreground">{state.adGroups.length}</span>
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-xs"
                    disabled={readOnly}
                    onClick={() => {
                      dispatch({ type: 'adGroup/add' })
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add ad group
                  </Button>
                </div>
                <Separator />
                <ul className="flex flex-wrap gap-2">
                  {state.adGroups.map((ag) => {
                    const idx = state.adGroups.indexOf(ag)
                    const hasError = groupErrors[idx]?.hash !== '{}'
                    return (
                      <li key={ag.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedAdGroupId(ag.id)}
                          className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                            selectedAdGroup?.id === ag.id
                              ? 'border-primary/50 bg-primary/10'
                              : 'border-border/60 bg-muted/30 hover:bg-muted/60'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            {ag.name || 'Untitled ad group'}
                            {hasError && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-label="has issues" />}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{adGroupSummary(ag)}</span>
                        </button>
                      </li>
                    )
                  })}
                  {state.adGroups.length === 0 && (
                    <li className="text-xs text-muted-foreground">No ad groups yet. Add one to get started.</li>
                  )}
                </ul>
              </Card>

              {selectedAdGroup && selectedIndex >= 0 && (
                <fieldset disabled={readOnly} className="contents">
                  <AdGroupEditor
                    key={selectedAdGroup.id}
                    adGroup={selectedAdGroup}
                    adGroupIndex={selectedIndex}
                    errors={groupErrors[selectedIndex]?.subset || {}}
                    errorsHash={groupErrors[selectedIndex]?.hash || '{}'}
                    defaultFinalUrl={defaultFinalUrl}
                    dispatch={dispatch}
                  />
                </fieldset>
              )}
            </div>
          )}

          {activeSection === 'readiness' && (
            <CampaignReadinessPanel draftId={draft._id || draft.id} draft={draft} onJump={jumpToError} readOnly={readOnly} />
          )}

          {activeSection === 'optimization' && draft.status === 'published' && (
            <OptimizationPanel draftId={draft._id || draft.id} />
          )}

          {activeSection === 'automation' && draft.status === 'published' && (
            <AutomationPanel draftId={draft._id || draft.id} />
          )}
        </div>
      </div>

      {!readOnly && (
        <CampaignSaveBar
          isDirty={isDirty}
          isSaving={isSaving}
          savedAt={savedAt}
          errorMessage={saveError}
          validationCount={validationCount}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
