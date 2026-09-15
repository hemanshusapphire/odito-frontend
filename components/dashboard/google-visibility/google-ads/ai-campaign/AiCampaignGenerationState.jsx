"use client"

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, CheckCircle2, Circle, XCircle, Target, MapPin, Wallet, Link2 } from 'lucide-react'
import { objectiveLabel, formatBudgetAmount } from '@/lib/aiCampaignConstants'

/**
 * AI Campaign generation loading screen — spec: "feel like a real enterprise
 * SaaS AI workflow", not a small centered fake-progress modal.
 *
 * HONESTY CONSTRAINT (the whole point of this rewrite): the backend
 * generation call is a SINGLE opaque request/response — there is no
 * intermediate progress event between "sent" and "Claude replied, mapped,
 * validated, and persisted, or failed". So this component does NOT run a
 * timer that walks through steps as if they were separately observed. What
 * it DOES know, truthfully, for the entire time this component is mounted:
 *
 *   1. "Preparing campaign brief" already happened — synchronously, in the
 *      parent page, before this component was ever rendered (the brief is
 *      built and the mutation is dispatched in the same tick that flips the
 *      page into the 'generating' phase). Showing it as `completed` on
 *      mount reflects something that is already true, not a future promise.
 *   2. Everything else Claude/Odito does (strategy generation, structure
 *      validation, workspace persistence) happens inside that one opaque
 *      request. It genuinely cannot be subdivided from here, so it is
 *      represented as ONE active step for the request's whole duration —
 *      never advanced further until a real success/failure response exists.
 *      On success the parent immediately navigates to the workspace (see
 *      the "new" page) — this component simply never gets to render a
 *      false "later step complete" state, because none is ever fabricated.
 *
 * No `setTimeout`, no fake percentage, no auto-advancing stage list.
 */

const STEPS = [
  { key: 'brief', label: 'Preparing campaign brief' },
  { key: 'strategy', label: 'Generating campaign strategy' },
  { key: 'validation', label: 'Validating campaign structure' },
  { key: 'workspace', label: 'Preparing campaign workspace' },
]

// Always 1 while this screen is showing: step 0 already happened (see file
// header), and nothing past step 1 is ever independently observable before
// the whole request resolves — at which point this component is unmounted
// (success navigates away; failure swaps in AiCampaignErrorState).
const ACTIVE_STEP_INDEX = 1

function stepStatus(index) {
  if (index < ACTIVE_STEP_INDEX) return 'completed'
  if (index === ACTIVE_STEP_INDEX) return 'active'
  return 'pending'
}

const STATUS_TEXT = { completed: 'Completed', active: 'In progress', pending: 'Not started yet', failed: 'Failed' }

function StepIcon({ status }) {
  if (status === 'completed') return <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
  if (status === 'failed') return <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
  if (status === 'active') {
    return (
      <span className="relative flex h-5 w-5 items-center justify-center" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/25" />
        <Loader2 className="relative h-4 w-4 animate-spin text-primary" />
      </span>
    )
  }
  return <Circle className="h-5 w-5 text-muted-foreground/30" aria-hidden="true" />
}

function StepList() {
  return (
    <ol className="space-y-0" aria-label="Campaign generation progress">
      {STEPS.map((step, i) => {
        const status = stepStatus(i)
        const isLast = i === STEPS.length - 1
        return (
          <li key={step.key} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && <span className="absolute left-[9px] top-6 bottom-0 w-px bg-border" aria-hidden="true" />}
            <span className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-card">
              <StepIcon status={status} />
            </span>
            <p className={`pt-0.5 text-sm ${status === 'active' ? 'font-medium text-foreground' : status === 'completed' ? 'text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
              <span className="sr-only"> — {STATUS_TEXT[status]}</span>
            </p>
          </li>
        )
      })}
    </ol>
  )
}

function hostnameOnly(url) {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Compact "what we're building" summary, sourced entirely from the actually-submitted brief — never hardcoded example values. */
function CampaignContext({ brief }) {
  if (!brief) return null

  const items = [
    { icon: Target, label: 'Campaign objective', value: objectiveLabel(brief.campaignGoal) },
    { icon: MapPin, label: 'Location', value: brief.locationName ? `${brief.locationName}${brief.locationCountryCode ? `, ${brief.locationCountryCode}` : ''}` : null },
    { icon: Wallet, label: 'Daily budget', value: brief.dailyBudget ? `${formatBudgetAmount(brief.dailyBudget)}${brief.currency ? ` ${brief.currency}` : ''}/day` : null },
    { icon: Link2, label: 'Landing page', value: hostnameOnly(brief.landingPageUrl) },
  ].filter((i) => i.value)

  if (items.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-3 border-t border-border/60 pt-5 sm:grid-cols-2">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-start gap-2.5">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="truncate text-sm font-medium text-foreground">{value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * @param {object} [brief] - the raw setup-form values actually submitted for this generation (not hardcoded — see the "new" page's `lastFormRef`).
 */
export default function AiCampaignGenerationState({ brief }) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 px-1">
      <div className="space-y-1.5">
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          AI Campaign Builder
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="text-sm text-muted-foreground">Creating your Google Ads campaign</p>
          <Badge variant="secondary" className="gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            AI generation in progress
          </Badge>
        </div>
      </div>

      <Card className="gap-6 p-6 sm:p-8" role="status" aria-live="polite">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1 pt-0.5">
            <h2 className="text-base font-semibold text-foreground">Building your campaign</h2>
            <p className="text-sm text-muted-foreground">Odito is generating your campaign structure, keywords, and ad copy.</p>
            <p className="text-xs text-muted-foreground">This may take a moment while we generate and validate your campaign.</p>
          </div>
        </div>

        <StepList />

        <CampaignContext brief={brief} />

        <p className="text-center text-[11px] text-muted-foreground">Please keep this tab open.</p>
      </Card>
    </div>
  )
}
