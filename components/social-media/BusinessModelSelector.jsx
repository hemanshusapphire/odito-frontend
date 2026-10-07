"use client"

import { Briefcase, Loader2, Package } from 'lucide-react'
import { ErrorNote } from './FormField'
import { SourceBadge } from './SourceBadge'
import { useUpdateSocialBusinessProfile } from '@/hooks/useSocialMediaAI'
import { describeApiError } from '@/lib/socialMedia/failureMessages'
import { BUSINESS_MODELS } from '@/lib/socialMedia/businessProfile'

const ICONS = { service: Briefcase, product: Package }

/**
 * "What type of business do you run?" — the user's own answer, never inferred (not from Google, the website or the
 * category). It only decides whether the Services or the Product Catalog is offered below and what the AI is told;
 * it does not stop a service business from mentioning products or vice versa. A choice is saved straight away
 * through the profile PUT and shown from the server's response.
 */
export function BusinessModelSelector({ projectId, value, fact = null }) {
  const mutation = useUpdateSocialBusinessProfile(projectId)
  // while a save is in flight show the choice the user just made, not the stale server value
  const shown = mutation.isPending ? mutation.variables?.businessModel : value
  const error = mutation.isError ? describeApiError(mutation.error, 'Could not save your choice.').message : null

  function choose(model) {
    if (mutation.isPending || model === value) return
    mutation.mutate({ businessModel: model })
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="business-model" aria-labelledby="business-model-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id="business-model-title" className="text-base font-bold text-slate-900">What type of business do you run?</h3>
          <p className="mt-1 text-sm text-slate-500">
            This decides whether you add Services or a Product Catalog below, and what Social AI is told about your business. You can still talk about both.
          </p>
        </div>
        {fact && value && <SourceBadge source={fact.source} />}
      </div>

      <div role="radiogroup" aria-label="Business type" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BUSINESS_MODELS.map((model) => {
          const Icon = ICONS[model.value]
          const selected = shown === model.value
          const saving = mutation.isPending && selected
          return (
            <label
              key={model.value}
              data-testid={`business-model-${model.value}`}
              className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-violet-200 ${
                selected ? 'border-violet-400 bg-violet-50/60' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              } ${mutation.isPending ? 'cursor-wait' : ''}`}
            >
              <input
                type="radio"
                name="business-model"
                value={model.value}
                checked={selected}
                disabled={mutation.isPending}
                onChange={() => choose(model.value)}
                className="sr-only"
              />
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${selected ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">{model.label}</span>
                <span className="mt-0.5 block text-sm text-slate-500">{model.description}</span>
              </span>
              <span aria-hidden className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-violet-600' : 'border-slate-300'}`}>
                {saving ? <Loader2 className="h-3 w-3 animate-spin text-violet-600" /> : selected && <span className="h-2 w-2 rounded-full bg-violet-600" />}
              </span>
            </label>
          )
        })}
      </div>

      {!shown && <p className="mt-3 text-xs text-slate-400" data-testid="business-model-unset">Not chosen yet. Odito never guesses this for you.</p>}
      <ErrorNote className="mt-3">{error}</ErrorNote>
    </section>
  )
}

export default BusinessModelSelector
