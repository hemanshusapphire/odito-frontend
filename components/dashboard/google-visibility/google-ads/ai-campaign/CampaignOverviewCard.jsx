"use client"

import { Card } from '@/components/ui/card'
import { Link2, MessageSquareQuote, ListTree } from 'lucide-react'
import { OditoDraftMarker } from './DraftStatusBadge'
import {
  objectiveLabel,
  biddingStrategyLabel,
  locationTypeLabel,
  formatBudgetAmount,
  campaignTotals,
  campaignAssetTotals,
  RSA_QUALITY_TARGETS,
} from '@/lib/aiCampaignConstants'

function Row({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{children || '—'}</span>
    </div>
  )
}

/**
 * A quick, honest read on RSA creative depth — NEVER a claim about Google's
 * own Ad Strength meter (Odito cannot see or guarantee that; see
 * CampaignReadinessPanel / the Phase 9 report). "Strong" means this
 * campaign's average headlines/descriptions per ad meet Odito's own quality
 * targets; "Below target" means a fresh AI generation would have been
 * blocked here (see creativeQualityValidator.js) but a manually-edited
 * draft is never retroactively blocked for it.
 */
function rsaQualityLabel(totals) {
  const strong = totals.avgHeadlinesPerAd >= RSA_QUALITY_TARGETS.headlinesQualityMin
    && totals.avgDescriptionsPerAd >= RSA_QUALITY_TARGETS.descriptionsQualityMin
  return strong ? 'Strong' : 'Below target'
}

function AssetPill({ Icon, count, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium text-foreground">{count}</span> {label}
    </span>
  )
}

/**
 * Read-only campaign summary shown at the top of the workspace. Reflects
 * the live editable state (so it updates as the user edits) but is not
 * itself editable — the settings card below is where changes happen.
 */
export default function CampaignOverviewCard({ campaign, adGroups, status }) {
  const totals = campaignTotals(adGroups)
  const assetTotals = campaignAssetTotals(campaign)
  const loc = campaign.locations?.[0]
  const hasAnyAds = totals.ads > 0

  return (
    <Card className="gap-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold leading-tight">{campaign.name || 'Untitled campaign'}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{objectiveLabel(campaign.objective)}</p>
        </div>
        <OditoDraftMarker status={status} />
      </div>

      <div className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
        <div className="divide-y divide-border/50">
          <Row label="Daily budget">
            {campaign.currency} {formatBudgetAmount(campaign.dailyBudget)} <span className="text-xs text-muted-foreground">/ day</span>
          </Row>
          <Row label="Bidding">{biddingStrategyLabel(campaign.biddingStrategy)}</Row>
          <Row label="Language">{campaign.languages?.[0]?.name || 'Not set'}</Row>
        </div>
        <div className="divide-y divide-border/50">
          <Row label="Location">
            {loc ? `${loc.name}${loc.countryCode ? `, ${loc.countryCode}` : ''}` : 'Not set'}
          </Row>
          <Row label="Location type">{loc ? locationTypeLabel(loc.type) : '—'}</Row>
          <Row label="Structure">
            {totals.adGroups} ad group{totals.adGroups === 1 ? '' : 's'} · {totals.keywords} keyword{totals.keywords === 1 ? '' : 's'} · {totals.ads} ad{totals.ads === 1 ? '' : 's'}
          </Row>
        </div>
      </div>

      {hasAnyAds && (
        <div className="border-t border-border/50 pt-3">
          <Row label="Pre-publish creative quality">
            <span className={totals.avgHeadlinesPerAd >= 12 && totals.avgDescriptionsPerAd >= 4 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
              {rsaQualityLabel(totals)}
            </span>
          </Row>
          <p className="pb-1 text-xs text-muted-foreground">
            Average {totals.avgHeadlinesPerAd.toFixed(1)} headlines and {totals.avgDescriptionsPerAd.toFixed(1)} descriptions per ad, across {totals.ads} ad{totals.ads === 1 ? '' : 's'}.
            This reflects Odito&apos;s own creative checks, not Google Ads&apos; Ad Strength meter — Google is the only source for that rating.
          </p>
        </div>
      )}

      {(assetTotals.sitelinks > 0 || assetTotals.callouts > 0 || assetTotals.structuredSnippets > 0) && (
        <div className="border-t border-border/50 pt-3">
          <span className="mb-2 block text-xs text-muted-foreground">Campaign assets</span>
          <div className="flex flex-wrap gap-2">
            {assetTotals.sitelinks > 0 && <AssetPill Icon={Link2} count={assetTotals.sitelinks} label={`sitelink${assetTotals.sitelinks === 1 ? '' : 's'}`} />}
            {assetTotals.callouts > 0 && <AssetPill Icon={MessageSquareQuote} count={assetTotals.callouts} label={`callout${assetTotals.callouts === 1 ? '' : 's'}`} />}
            {assetTotals.structuredSnippets > 0 && <AssetPill Icon={ListTree} count={assetTotals.structuredSnippets} label={`structured snippet${assetTotals.structuredSnippets === 1 ? '' : 's'}`} />}
          </div>
        </div>
      )}
    </Card>
  )
}
