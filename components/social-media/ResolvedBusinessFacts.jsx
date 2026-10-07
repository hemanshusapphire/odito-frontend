import { SourceBadge } from './SourceBadge'
import { SocialMediaImage } from './SocialMediaImage'
import { hasValue, formatDateTime, underlyingOf, businessModelLabel } from '@/lib/socialMedia/businessProfile'

function Row({ label, fact, testId, render, emptyText = 'Not available' }) {
  const present = hasValue(fact)
  const updated = present ? formatDateTime(fact.lastUpdated) : null
  const under = present ? underlyingOf(fact) : null
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4" data-testid={testId}>
      <div className="min-w-0 sm:w-40 sm:shrink-0">
        <p className="text-sm font-medium text-slate-700">{label}</p>
      </div>
      <div className="min-w-0 flex-1">
        {present ? (
          <p className="break-words text-sm text-slate-800" data-testid={testId ? `${testId}-value` : undefined}>{render ? render(fact.value) : String(fact.value)}</p>
        ) : (
          <p className="text-sm text-slate-400" data-testid={testId ? `${testId}-value` : undefined}>{emptyText}</p>
        )}
        {updated && <p className="mt-0.5 text-xs text-slate-400">Updated {updated}</p>}
        {under && (
          <p className="mt-0.5 text-xs text-slate-500" data-testid={testId ? `${testId}-underlying` : undefined}>
            Your value is being used instead of <span className="font-medium text-slate-700">{under.text}</span> ({under.label}).
          </p>
        )}
      </div>
      <SourceBadge source={fact?.source || 'unavailable'} detail={fact?.detail} />
    </div>
  )
}

const asText = (v) => (Array.isArray(v) ? v.join(', ') : String(v))

/** Something the user typed in Business Profile (brand, audience, catalog), shown as a fact so it carries its source. */
const userFact = (value) => {
  const filled = Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? value.trim().length > 0 : value !== null && value !== undefined
  return filled ? { value, source: 'social_override', lastUpdated: null } : null
}

const names = (items) => items.map((i) => i.name)

/**
 * "How Social AI sees your business" — the final, resolved profile Social AI reads, READ-ONLY, each value with its
 * source. This is a PREVIEW: it appears only on Business Profile, and the only way to change anything in it is to
 * edit the section above that owns it (or, for Google-managed facts, to set your own value in Business information —
 * Odito never writes to Google).
 */
export function ResolvedBusinessFacts({ resolvedProfile }) {
  const { business, media } = resolvedProfile
  const strategy = resolvedProfile.strategy || {}
  const brand = resolvedProfile.brand || {}
  const services = resolvedProfile.services || []
  const products = resolvedProfile.products || []
  const loc = business.location
  const place = [loc.city, loc.region, loc.country].filter(hasValue).map((f) => f.value).join(', ')
  const placeSource = [loc.city, loc.region, loc.country].find(hasValue)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="resolved-facts">
      <h3 className="text-base font-bold text-slate-900">How Social AI sees your business</h3>
      <p className="mt-1 text-sm text-slate-500">
        This is the final profile Social AI uses for your strategy and posts, with where each value comes from. It is read-only: change a value in the section that owns it above.
      </p>

      <div className="mt-3">
        <div className="flex items-center gap-4 border-b border-slate-100 py-3" data-testid="fact-logo">
          {hasValue(media.logo) ? (
            <SocialMediaImage src={media.logo.value} alt="Business logo" className="h-14 w-14 shrink-0 rounded-xl border border-slate-200" />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-500" aria-hidden>
              {(business.name.value || '?').trim().charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-700">Logo</p>
            <p className="text-sm text-slate-400" data-testid="fact-logo-value">{hasValue(media.logo) ? 'Found' : 'No logo found'}</p>
          </div>
          <SourceBadge source={media.logo.source} detail={media.logo.detail} />
        </div>

        <Row label="Business type" fact={business.businessModel} testId="fact-model" render={(v) => businessModelLabel(v) || String(v)} />
        <Row label="Business name" fact={business.name} testId="fact-name" />
        <Row label="Description" fact={business.description} testId="fact-description" />
        <Row label="Category" fact={business.category} testId="fact-category" />
        <Row label="Secondary categories" fact={business.secondaryCategories} testId="fact-secondary" render={asText} />
        <Row label="Phone" fact={business.phone} testId="fact-phone" />
        <Row label="Website" fact={business.website} testId="fact-website" />
        <Row label="Address" fact={loc.address} testId="fact-address" />
        <Row label="City / country" fact={place ? { value: place, source: placeSource.source, lastUpdated: placeSource.lastUpdated } : null} testId="fact-place" />
        <Row label="Service area" fact={business.serviceArea} testId="fact-service-area" render={asText} />
        <Row label="Opening hours" fact={business.hours.regular} testId="fact-hours" render={(v) => (Array.isArray(v) ? `${v.length} weekly opening period${v.length === 1 ? '' : 's'} on Google` : 'Set on Google')} />
        <Row
          label="Rating"
          fact={business.rating}
          testId="fact-rating"
          render={(v) => `${v} / 5${hasValue(business.reviewCount) ? ` · ${business.reviewCount.value} reviews` : ''}`}
        />

        <p className="mt-4 border-b border-slate-100 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Brand and strategy</p>
        <Row label="Brand name" fact={userFact(brand.name)} testId="fact-brand-name" emptyText="Not set — your business name is used" />
        <Row label="Brand voice" fact={userFact(brand.voice)} testId="fact-brand-voice" emptyText="Not set" />
        <Row label="Tone of voice" fact={userFact(strategy.toneOfVoice?.primary)} testId="fact-tone" emptyText="Not set" />
        <Row label="Tagline" fact={userFact(brand.tagline)} testId="fact-tagline" emptyText="Not set" />
        <Row label="Audience" fact={userFact(strategy.audience?.primary)} testId="fact-audience" emptyText="Not set" />
        <Row label="Goals" fact={userFact(strategy.goals)} testId="fact-goals" render={asText} emptyText="Not set" />
        <Row label="Unique selling points" fact={userFact(strategy.uniqueSellingPoints)} testId="fact-usps" render={asText} emptyText="Not set" />
        <Row label="Content pillars" fact={userFact(strategy.contentPillars)} testId="fact-pillars" render={asText} emptyText="Not set" />
        <Row label="Phrases to avoid" fact={userFact(strategy.prohibitedPhrases)} testId="fact-avoid" render={asText} emptyText="Not set" />

        <p className="mt-4 border-b border-slate-100 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">What you offer</p>
        {business.businessModel?.value !== 'product' && (
          <Row label="Services" fact={userFact(names(services))} testId="fact-services" render={(v) => `${v.length} active: ${asText(v)}`} emptyText="None added" />
        )}
        {business.businessModel?.value !== 'service' && (
          <Row label="Products" fact={userFact(names(products))} testId="fact-products" render={(v) => `${v.length} active: ${asText(v)}`} emptyText="None added" />
        )}
      </div>
    </div>
  )
}

export default ResolvedBusinessFacts
