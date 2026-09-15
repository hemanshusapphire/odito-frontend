"use client"

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import {
  CAMPAIGN_OBJECTIVES,
  OBJECTIVE_LABELS,
  BIDDING_STRATEGIES,
  BIDDING_STRATEGY_LABELS,
  LOCATION_TYPES,
  LOCATION_TYPE_LABELS,
  COMMON_CURRENCIES,
  COMMON_COUNTRIES,
} from '@/lib/aiCampaignConstants'

function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs">{label}</Label>
      {children}
      {error ? (
        <p className="text-[11px] text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

/**
 * Editable campaign-level settings. Only fields the Phase 1 draft schema
 * supports are exposed (spec §15). Budget is entered in major currency
 * units; the backend converts to integer micros — no money math here.
 */
export default function CampaignSettingsForm({ campaign, errors, dispatch }) {
  const set = (field, value) => dispatch({ type: 'campaign/setField', field, value })
  const setLoc = (index, field, value) => dispatch({ type: 'campaign/setLocationField', index, field, value })
  const primary = campaign.locations?.[0] || { name: '', countryCode: '', type: 'CITY' }
  const currencyOptions = [...COMMON_CURRENCIES]
  if (campaign.currency && !currencyOptions.some((c) => c.code === campaign.currency)) {
    currencyOptions.unshift({ code: campaign.currency, label: campaign.currency })
  }
  const countryOptions = [...COMMON_COUNTRIES]
  if (primary.countryCode && !countryOptions.some((c) => c.code === primary.countryCode)) {
    countryOptions.unshift({ code: primary.countryCode, label: primary.countryCode })
  }

  return (
    <Card className="gap-5 p-5">
      <div>
        <h3 className="text-sm font-semibold">Campaign settings</h3>
        <p className="text-xs text-muted-foreground">These apply to the whole campaign.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Campaign name" htmlFor="cs-name" error={errors?.['campaign.name']}>
          <Input id="cs-name" value={campaign.name} onChange={(e) => set('name', e.target.value)} />
        </Field>

        <Field label="Campaign goal" error={errors?.['campaign.objective']}>
          <Select value={campaign.objective} onValueChange={(v) => set('objective', v)}>
            <SelectTrigger id="cs-objective"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CAMPAIGN_OBJECTIVES.map((o) => (
                <SelectItem key={o} value={o}>{OBJECTIVE_LABELS[o]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Daily budget" htmlFor="cs-budget" error={errors?.['campaign.dailyBudget']} hint="Amount per day in the currency below.">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">{campaign.currency || '—'}</span>
            <Input
              id="cs-budget"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={campaign.dailyBudget}
              onChange={(e) => set('dailyBudget', e.target.value)}
              className="max-w-[160px]"
            />
            <span className="text-xs text-muted-foreground">/ day</span>
          </div>
        </Field>

        <Field label="Currency" error={errors?.['campaign.currency']}>
          <Select value={campaign.currency} onValueChange={(v) => set('currency', v)}>
            <SelectTrigger id="cs-currency"><SelectValue placeholder="Select currency" /></SelectTrigger>
            <SelectContent>
              {currencyOptions.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Bidding strategy" error={errors?.['campaign.biddingStrategy']}>
          <Select value={campaign.biddingStrategy} onValueChange={(v) => set('biddingStrategy', v)}>
            <SelectTrigger id="cs-bidding"><SelectValue /></SelectTrigger>
            <SelectContent>
              {BIDDING_STRATEGIES.map((b) => (
                <SelectItem key={b} value={b}>{BIDDING_STRATEGY_LABELS[b]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Language"
          htmlFor="cs-language"
          hint="Optional — the language of your ads."
        >
          <Input
            id="cs-language"
            value={campaign.languages?.[0]?.name || ''}
            placeholder="e.g. English"
            onChange={(e) => dispatch({ type: 'campaign/setLanguageField', index: 0, field: 'name', value: e.target.value })}
          />
        </Field>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Primary location</div>
        {errors?.['campaign.locations'] && (
          <p className="mb-2 text-[11px] text-destructive">{errors['campaign.locations']}</p>
        )}
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Location name" htmlFor="cs-loc-name" error={errors?.['campaign.locations[0].name']}>
            <Input id="cs-loc-name" value={primary.name} placeholder="e.g. Nashik" onChange={(e) => setLoc(0, 'name', e.target.value)} />
          </Field>
          <Field label="Country" error={errors?.['campaign.locations[0].countryCode']}>
            <Select value={primary.countryCode} onValueChange={(v) => setLoc(0, 'countryCode', v)}>
              <SelectTrigger id="cs-loc-country"><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>
                {countryOptions.map((c) => (
                  <SelectItem key={`${c.code}-${c.label}`} value={c.code}>{c.label} ({c.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Type" error={errors?.['campaign.locations[0].type']}>
            <Select value={primary.type} onValueChange={(v) => setLoc(0, 'type', v)}>
              <SelectTrigger id="cs-loc-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{LOCATION_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Odito resolves this to Google Ads locations when the campaign is published in a later step.
        </p>
      </div>
    </Card>
  )
}
