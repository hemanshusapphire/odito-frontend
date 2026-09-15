"use client"

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import {
  CAMPAIGN_OBJECTIVES,
  OBJECTIVE_LABELS,
  OBJECTIVE_HINTS,
  LOCATION_TYPES,
  LOCATION_TYPE_LABELS,
  COMMON_CURRENCIES,
  COMMON_COUNTRIES,
  BRIEF_LIMITS,
} from '@/lib/aiCampaignConstants'
import { validateBrief } from '@/lib/aiCampaignWorkspace'

function defaultForm(prefill = {}) {
  return {
    businessName: prefill.businessName || '',
    businessDescription: prefill.businessDescription || '',
    campaignGoal: prefill.campaignGoal || 'LEADS',
    targetAudience: prefill.targetAudience || '',
    locationName: prefill.locationName || '',
    locationCountryCode: prefill.locationCountryCode || '',
    locationType: prefill.locationType || 'CITY',
    dailyBudget: prefill.dailyBudget || '',
    currency: prefill.currency || '',
    landingPageUrl: prefill.landingPageUrl || '',
    additionalInstructions: prefill.additionalInstructions || '',
  }
}

function FieldError({ children }) {
  return children ? <p className="text-[11px] text-destructive" role="alert">{children}</p> : null
}

/**
 * Campaign brief setup form (spec §5-§9). Controlled local state — the
 * house pattern (no react-hook-form in this project). Client validation is
 * a UX gate only; the backend re-validates the brief on generate.
 *
 * `onGenerate(form)` is called with the raw form; the parent maps it to the
 * Phase 2 `brief` body. `isGenerating` disables the whole form and the
 * submit button (duplicate-submit prevention).
 */
export default function AiCampaignSetupForm({
  onGenerate,
  isGenerating,
  backHref,
  prefill,
  accountCurrency,
}) {
  const [form, setForm] = useState(() => defaultForm({ ...prefill, currency: prefill?.currency || accountCurrency || '' }))
  const [touched, setTouched] = useState(false)

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }))

  const { errors, count } = useMemo(() => validateBrief(form), [form])

  const currencyOptions = useMemo(() => {
    const list = [...COMMON_CURRENCIES]
    if (accountCurrency && !list.some((c) => c.code === accountCurrency)) {
      list.unshift({ code: accountCurrency, label: `${accountCurrency} — connected account currency` })
    }
    return list
  }, [accountCurrency])

  function submit(e) {
    e.preventDefault()
    setTouched(true)
    if (count > 0 || isGenerating) return
    onGenerate(form)
  }

  const showErr = (key) => (touched ? errors[key] : undefined)

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-6xl space-y-5">
      <div className="space-y-1">
        <Link href={backHref} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> AI Campaigns
        </Link>
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
          <Sparkles className="h-5 w-5 text-primary" />
          New AI Campaign
        </h1>
        <p className="text-sm text-muted-foreground">
          Describe your business and campaign. Claude drafts the structure, keywords and ad copy — then you edit and save it as a draft. Nothing is published to Google Ads.
        </p>
      </div>

      <Card className="gap-5 p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Business</div>

        <div className="space-y-1.5">
          <Label htmlFor="sf-bizname">Business name <span className="text-muted-foreground">(optional)</span></Label>
          <Input id="sf-bizname" value={form.businessName} maxLength={BRIEF_LIMITS.businessNameMax + 10}
            disabled={isGenerating} onChange={(e) => set('businessName', e.target.value)} />
          <FieldError>{showErr('businessName')}</FieldError>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sf-bizdesc">Business description</Label>
          <Textarea id="sf-bizdesc" rows={3} value={form.businessDescription} disabled={isGenerating}
            placeholder="What your business does, the services or products you offer, and who you serve."
            onChange={(e) => set('businessDescription', e.target.value)}
            className={showErr('businessDescription') ? 'border-destructive' : undefined} />
          <div className="flex justify-between">
            <FieldError>{showErr('businessDescription')}</FieldError>
            <span className="text-[11px] text-muted-foreground">{form.businessDescription.length}/{BRIEF_LIMITS.businessDescriptionMax}</span>
          </div>
        </div>
      </Card>

      <Card className="gap-5 p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Campaign</div>

        <div className="space-y-1.5">
          <Label htmlFor="sf-goal">Campaign goal</Label>
          <Select value={form.campaignGoal} onValueChange={(v) => set('campaignGoal', v)} disabled={isGenerating}>
            <SelectTrigger id="sf-goal"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CAMPAIGN_OBJECTIVES.map((o) => (
                <SelectItem key={o} value={o}>{OBJECTIVE_LABELS[o]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">{OBJECTIVE_HINTS[form.campaignGoal]}</p>
          <FieldError>{showErr('campaignGoal')}</FieldError>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sf-audience">Target audience <span className="text-muted-foreground">(optional)</span></Label>
          <Input id="sf-audience" value={form.targetAudience} disabled={isGenerating}
            placeholder="e.g. Business owners looking for digital marketing services"
            onChange={(e) => set('targetAudience', e.target.value)} />
          <FieldError>{showErr('targetAudience')}</FieldError>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="sf-loc-name">Location</Label>
            <Input id="sf-loc-name" value={form.locationName} disabled={isGenerating}
              placeholder="e.g. Nashik"
              onChange={(e) => set('locationName', e.target.value)}
              className={showErr('locationName') ? 'border-destructive' : undefined} />
            <FieldError>{showErr('locationName')}</FieldError>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sf-loc-country">Country</Label>
            <Select value={form.locationCountryCode} onValueChange={(v) => set('locationCountryCode', v)} disabled={isGenerating}>
              <SelectTrigger id="sf-loc-country" className={showErr('locationCountryCode') ? 'border-destructive' : undefined}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_COUNTRIES.map((c) => (
                  <SelectItem key={`${c.code}-${c.label}`} value={c.code}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{showErr('locationCountryCode')}</FieldError>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sf-loc-type">Type</Label>
            <Select value={form.locationType} onValueChange={(v) => set('locationType', v)} disabled={isGenerating}>
              <SelectTrigger id="sf-loc-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{LOCATION_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{showErr('locationType')}</FieldError>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="sf-budget">Daily budget</Label>
            <div className="flex items-center gap-2">
              <Input id="sf-budget" type="number" inputMode="decimal" min="0" step="1" value={form.dailyBudget}
                disabled={isGenerating}
                onChange={(e) => set('dailyBudget', e.target.value)}
                className={`max-w-[160px] ${showErr('dailyBudget') ? 'border-destructive' : ''}`} />
              <span className="text-xs text-muted-foreground">/ day</span>
            </div>
            <FieldError>{showErr('dailyBudget')}</FieldError>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sf-currency">Currency</Label>
            <Select value={form.currency} onValueChange={(v) => set('currency', v)} disabled={isGenerating}>
              <SelectTrigger id="sf-currency" className={showErr('currency') ? 'border-destructive' : undefined}>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{showErr('currency')}</FieldError>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sf-url">Landing page URL <span className="text-muted-foreground">(optional)</span></Label>
          <Input id="sf-url" value={form.landingPageUrl} disabled={isGenerating}
            placeholder="https://example.com/services"
            onChange={(e) => set('landingPageUrl', e.target.value)}
            className={showErr('landingPageUrl') ? 'border-destructive' : undefined} />
          <FieldError>{showErr('landingPageUrl')}</FieldError>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sf-instructions">Additional instructions <span className="text-muted-foreground">(optional)</span></Label>
          <Textarea id="sf-instructions" rows={2} value={form.additionalInstructions} disabled={isGenerating}
            placeholder="e.g. Focus on qualified business leads. Avoid price-led messaging."
            onChange={(e) => set('additionalInstructions', e.target.value)} />
          <div className="flex justify-between">
            <FieldError>{showErr('additionalInstructions')}</FieldError>
            <span className="text-[11px] text-muted-foreground">{form.additionalInstructions.length}/{BRIEF_LIMITS.additionalInstructionsMax}</span>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" asChild disabled={isGenerating}>
          <Link href={backHref}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={isGenerating || (touched && count > 0)} className="gap-1.5" data-testid="generate-campaign">
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isGenerating ? 'Generating…' : 'Generate Campaign'}
        </Button>
      </div>
      {touched && count > 0 && (
        <p className="text-right text-[11px] text-destructive">
          {count} {count === 1 ? 'field needs' : 'fields need'} attention.
        </p>
      )}
    </form>
  )
}
