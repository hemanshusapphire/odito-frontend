/**
 * AI Campaign Builder — frontend constants + label maps (Phase 3).
 *
 * The backend is the single source of truth for every enum here:
 *   odito_backend/src/modules/aiCampaign/constants/aiCampaignEnums.js
 *   odito_backend/src/modules/aiCampaign/constants/generationConfig.js
 * These arrays mirror those values exactly. Display labels are kept
 * SEPARATE from the domain values — the UI shows the label, the API always
 * receives the raw value.
 *
 * Client-side validation limits below are for UX only. The backend
 * (campaignStructureValidator strict mode) remains the authoritative
 * validator on generate and on save.
 */

// ── Campaign objective ────────────────────────────────────────────────────
export const CAMPAIGN_OBJECTIVES = ['LEADS', 'SALES', 'WEBSITE_TRAFFIC', 'AWARENESS']

export const OBJECTIVE_LABELS = {
  LEADS: 'Generate Leads',
  SALES: 'Drive Sales',
  WEBSITE_TRAFFIC: 'Website Traffic',
  AWARENESS: 'Brand Awareness',
}

export const OBJECTIVE_HINTS = {
  LEADS: 'Form fills, calls and enquiries from potential customers.',
  SALES: 'Online or in-store purchases and transactions.',
  WEBSITE_TRAFFIC: 'Bring more of the right visitors to your site.',
  AWARENESS: 'Reach a broad, relevant audience.',
}

// ── Bidding strategy ──────────────────────────────────────────────────────
export const BIDDING_STRATEGIES = [
  'MAXIMIZE_CONVERSIONS',
  'MAXIMIZE_CONVERSION_VALUE',
  'MAXIMIZE_CLICKS',
  'TARGET_CPA',
  'TARGET_ROAS',
]

export const BIDDING_STRATEGY_LABELS = {
  MAXIMIZE_CONVERSIONS: 'Maximise Conversions',
  MAXIMIZE_CONVERSION_VALUE: 'Maximise Conversion Value',
  MAXIMIZE_CLICKS: 'Maximise Clicks',
  TARGET_CPA: 'Target CPA',
  TARGET_ROAS: 'Target ROAS',
}

// ── Keyword / negative-keyword match type ────────────────────────────────
export const MATCH_TYPES = ['BROAD', 'PHRASE', 'EXACT']

export const MATCH_TYPE_LABELS = {
  BROAD: 'Broad',
  PHRASE: 'Phrase',
  EXACT: 'Exact',
}

// ── Location targeting ───────────────────────────────────────────────────
export const LOCATION_TYPES = ['CITY', 'REGION', 'COUNTRY', 'POSTAL_CODE']

export const LOCATION_TYPE_LABELS = {
  CITY: 'City',
  REGION: 'Region / State',
  COUNTRY: 'Country',
  POSTAL_CODE: 'Postal Code',
}

// ── Ad type (foundation supports RSA only) ───────────────────────────────
export const AD_TYPES = ['RESPONSIVE_SEARCH_AD']
export const AD_TYPE_LABELS = {
  RESPONSIVE_SEARCH_AD: 'Responsive Search Ad',
}

// ── Draft lifecycle ─────────────────────────────────────────────────────
export const DRAFT_STATUSES = [
  'draft',
  'generating',
  'ready',
  'validated',
  'publishing',
  'published',
  'failed',
]

export const DRAFT_STATUS_LABELS = {
  draft: 'Draft',
  generating: 'Generating',
  ready: 'Draft',
  validated: 'Validated',
  publishing: 'Publishing',
  published: 'Published',
  failed: 'Generation failed',
}

/** Statuses this phase lets the user open in the editable workspace. */
export const EDITABLE_STATUSES = ['draft', 'ready', 'validated']
/** Statuses that mean "a later publishing step now owns this" — read-only here. */
export const PUBLISH_STAGE_STATUSES = ['publishing', 'published']

// ── Responsive Search Ad limits (Google Ads hard limits, mirrored) ───────
export const RSA_LIMITS = Object.freeze({
  HEADLINE_MAX_CHARS: 30,
  DESCRIPTION_MAX_CHARS: 90,
  PATH_MAX_CHARS: 15,
  HEADLINES_MIN: 3,
  HEADLINES_MAX: 15,
  DESCRIPTIONS_MIN: 2,
  DESCRIPTIONS_MAX: 4,
})

// ── RSA creative-quality targets (mirrors generationConfig.RSA_QUALITY_TARGETS)
// Odito's OWN stricter pre-publish bar, distinct from the Google-enforced
// RSA_LIMITS above — display-only here, used to render the "RSA Quality"
// summary (never to block a manual save; the backend is the sole authority
// on what a fresh AI generation must meet before it can reach `ready`).
export const RSA_QUALITY_TARGETS = Object.freeze({
  headlinesTarget: 15,
  headlinesQualityMin: 12,
  descriptionsTarget: 4,
  descriptionsQualityMin: 4,
})

// ── Generated-campaign size limits (mirrors generationConfig.CAMPAIGN_LIMITS) ─
export const CAMPAIGN_LIMITS = Object.freeze({
  adGroupsMin: 1,
  adGroupsMax: 20,
  keywordsPerGroupMax: 50,
  negativeKeywordsMax: 50,
  adsPerGroupMax: 3,
})

// ── Brief input limits (mirrors generationConfig.BRIEF_LIMITS) ───────────
export const BRIEF_LIMITS = Object.freeze({
  businessNameMax: 150,
  businessDescriptionMax: 1500,
  targetAudienceMax: 500,
  additionalInstructionsMax: 2000,
  dailyBudgetMajorMax: 100000,
})

// ── Currency options for the setup form ─────────────────────────────────
// A convenience shortlist only — the field accepts any ISO 4217 code and
// the backend validates it. The connected Google Ads account currency
// (when known) is always offered first.
export const COMMON_CURRENCIES = [
  { code: 'INR', label: 'INR — Indian Rupee' },
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'AUD', label: 'AUD — Australian Dollar' },
  { code: 'CAD', label: 'CAD — Canadian Dollar' },
  { code: 'AED', label: 'AED — UAE Dirham' },
  { code: 'SGD', label: 'SGD — Singapore Dollar' },
]

// A small ISO 3166-1 alpha-2 shortlist for the location country field —
// again just a convenience; the field accepts any 2-letter code.
export const COMMON_COUNTRIES = [
  { code: 'IN', label: 'India' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
  { code: 'CA', label: 'Canada' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'SG', label: 'Singapore' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
]

// ── Error-code → friendly message (spec §23) ────────────────────────────
// Backend classified codes (campaignGenerationController + Phase 4's
// campaignProposalController) → user copy. Never surface a raw
// provider/Claude error or internal code.
const AI_CAMPAIGN_ERROR_MESSAGES = {
  RATE_LIMITED: "You're generating campaigns too quickly. Please wait a moment and try again.",
  AI_RATE_LIMITED: "You're generating campaigns too quickly. Please wait a moment and try again.",
  AI_OVERLOADED: 'The AI service is busy right now. Please try again in a minute.',
  AI_UNAVAILABLE: 'AI editing is not available right now. Please try again later.',
  AI_TIMEOUT: "That took too long. Your campaign hasn't been changed — please try again.",
  AI_PROVIDER_ERROR: "We couldn't reach the AI provider. Your campaign hasn't been changed. Please try again.",
  AI_BAD_OUTPUT: 'The AI returned an unusable response. Please try again.',
  CAMPAIGN_STRUCTURE_INVALID: 'Some campaign details need attention before this campaign can be generated. Please adjust the brief and try again.',
  // Phase 9 — RSA/Ad-Strength creative-quality gate (spec §20/§21). Reached
  // only after Odito already retried generation automatically (the bounded
  // repair loop) and the result still fell short — never shown after just
  // one attempt.
  CREATIVE_QUALITY_INVALID: "We tried to strengthen this campaign's ad copy automatically but couldn't reach a strong result. Please try again.",
  GENERATION_FAILED: "We couldn't generate the campaign right now. Your draft has been preserved. Please try again.",
  // Phase 4 — conversational editing (spec §40)
  PROPOSAL_INVALID: "The AI suggestion couldn't be safely applied. Please try rephrasing your request.",
  PROPOSAL_STALE: 'This suggestion was created from an older version of your campaign. Please generate a new suggestion.',
  PROPOSAL_EXPIRED: 'This suggestion has expired. Please generate a new one.',
  PROPOSAL_FAILED: "We couldn't apply that suggestion. Your campaign hasn't been changed. Please try again.",
  // Phase 6 — Google Ads publish pipeline (spec §19/§21/§24). The backend's
  // own CampaignPublishError.message is already safe, specific copy for
  // most of these — this map only overrides the few that benefit from
  // slightly different wording in the publish-specific UI context.
  GOOGLE_QUOTA: 'Google Ads is temporarily rate-limiting this account. Please try publishing again in a few minutes.',
  GOOGLE_NETWORK: "We lost the connection to Google Ads partway through. Nothing new was created — it's safe to try publishing again.",
  GOOGLE_UNKNOWN: 'Publishing failed unexpectedly. Nothing was created in Google Ads. Please try again.',
  PARTIAL_PUBLISH: 'Publishing stopped partway through — some parts of this campaign were created in Google Ads. Please contact support before trying again.',
  // Phase 7 — performance + AI optimization (spec §35). GOOGLE_QUOTA/
  // GOOGLE_UNKNOWN above are reused as-is; these are the Phase-7-specific codes.
  PERFORMANCE_UNAVAILABLE: "No performance data is available yet. Sync your Google Ads dashboard, then check readiness again.",
  RECOMMENDATION_STALE: 'This recommendation is no longer current. Run a fresh analysis to see up-to-date suggestions.',
  RECOMMENDATION_ALREADY_DECIDED: 'This recommendation has already been decided.',
  TARGET_NOT_FOUND: 'This no longer exists in Google Ads — it may have been changed or removed outside Odito.',
  TARGET_STATE_CHANGED: "This has changed in Google Ads since this recommendation was made, so it wasn't applied. Run a fresh analysis to see the current state.",
  OPTIMIZATION_NOT_ALLOWED: 'This recommendation is informational only and cannot be applied automatically.',
  OPTIMIZATION_ALREADY_EXECUTED: 'This recommendation has already been applied.',
  OPTIMIZATION_ALREADY_IN_PROGRESS: 'This recommendation is already being applied.',
  DRAFT_NOT_PUBLISHED: 'Only a published campaign can be analyzed for optimization.',
  GOOGLE_AUTHORIZATION_FAILED: 'Google Ads denied access. Please reconnect Google Ads.',
  GOOGLE_VALIDATION_FAILED: 'Google Ads rejected this change. Please try again.',
  // Phase 8 — automation & autonomous optimization controls.
  POLICY_NOT_FOUND: 'This automation policy could not be found.',
  POLICY_DISABLED: 'This automation policy is currently disabled.',
  RUN_ALREADY_IN_PROGRESS: 'This automation is already running.',
  INVALID_SCHEDULE: 'That schedule is not valid. Please check the frequency, time, and timezone.',
  INVALID_RULE: "One of this policy's rules isn't valid. Please check the operation, metric, and threshold.",
  VERSION_CONFLICT: 'This policy was changed elsewhere. Please reload and try again.',
  ACCOUNT_UNAVAILABLE: 'No connected Google Ads account is available for this project.',
}

/**
 * Turn any thrown apiService error into a safe, human message.
 * @param {Error & { code?: string, status?: number }} err
 * @param {string} fallback
 */
export function friendlyErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (!err) return fallback
  if (err.status === 401) return 'Your session has expired. Please sign in again.'
  if (err.status === 403) return "You don't have access to this project."
  if (err.status === 404) return 'That could not be found. It may have been deleted or already handled.'
  if (err.status === 429 || err.code === 'RATE_LIMITED') return AI_CAMPAIGN_ERROR_MESSAGES.RATE_LIMITED
  if (err.code && AI_CAMPAIGN_ERROR_MESSAGES[err.code]) return AI_CAMPAIGN_ERROR_MESSAGES[err.code]
  // Network / fetch failure (no HTTP status at all)
  if (err.status === undefined && /fetch|network|Failed to fetch/i.test(err.message || '')) {
    return "We couldn't reach Odito. Check your connection and try again."
  }
  return err.message || fallback
}

// ── Phase 4 — conversational editing change-proposal vocabulary ─────────
// Mirrors odito_backend src/modules/aiCampaign/constants/proposalEnums.js
// exactly — never invented client-side. Used only for DISPLAY grouping;
// the backend remains the sole authority on which (operation, target)
// pairs are legal.
export const PROPOSAL_OPERATIONS = ['add', 'remove', 'replace']
export const PROPOSAL_TARGETS = [
  'CAMPAIGN_NAME', 'CAMPAIGN_DAILY_BUDGET', 'CAMPAIGN_BIDDING_STRATEGY', 'CAMPAIGN_LOCATION', 'CAMPAIGN_LANGUAGE',
  'AD_GROUP', 'AD_GROUP_NAME', 'KEYWORD', 'NEGATIVE_KEYWORD', 'AD',
  'AD_HEADLINE', 'AD_DESCRIPTION', 'AD_FINAL_URL',
]

/** Section a target belongs to, for grouping the diff view (spec §21). */
export const PROPOSAL_TARGET_SECTION = {
  CAMPAIGN_NAME: 'Campaign',
  CAMPAIGN_DAILY_BUDGET: 'Campaign',
  CAMPAIGN_BIDDING_STRATEGY: 'Campaign',
  CAMPAIGN_LOCATION: 'Campaign',
  CAMPAIGN_LANGUAGE: 'Campaign',
  AD_GROUP: 'Ad Groups',
  AD_GROUP_NAME: 'Ad Groups',
  KEYWORD: 'Keywords',
  NEGATIVE_KEYWORD: 'Negative Keywords',
  AD: 'Ads',
  AD_HEADLINE: 'Ads',
  AD_DESCRIPTION: 'Ads',
  AD_FINAL_URL: 'Ads',
}
// Fixed display order for the grouped sections — not alphabetical, matches
// the order a marketer thinks about a campaign top-down.
export const PROPOSAL_SECTION_ORDER = ['Campaign', 'Ad Groups', 'Keywords', 'Negative Keywords', 'Ads']

/** Friendly field name for a single change (used as the diff item's title). */
export const PROPOSAL_TARGET_LABEL = {
  CAMPAIGN_NAME: 'Campaign name',
  CAMPAIGN_DAILY_BUDGET: 'Daily budget',
  CAMPAIGN_BIDDING_STRATEGY: 'Bidding strategy',
  CAMPAIGN_LOCATION: 'Location',
  CAMPAIGN_LANGUAGE: 'Language',
  AD_GROUP: 'Ad group',
  AD_GROUP_NAME: 'Ad group name',
  KEYWORD: 'Keyword',
  NEGATIVE_KEYWORD: 'Negative keyword',
  AD: 'Ad',
  AD_HEADLINE: 'Headline',
  AD_DESCRIPTION: 'Description',
  AD_FINAL_URL: 'Final URL',
}

export const proposalTargetLabel = (t) => PROPOSAL_TARGET_LABEL[t] || t || '—'
export const proposalSection = (t) => PROPOSAL_TARGET_SECTION[t] || 'Campaign'

// ── Display helpers ────────────────────────────────────────────────────
export const objectiveLabel = (v) => OBJECTIVE_LABELS[v] || v || '—'
export const biddingStrategyLabel = (v) => BIDDING_STRATEGY_LABELS[v] || v || '—'
export const matchTypeLabel = (v) => MATCH_TYPE_LABELS[v] || v || '—'
export const locationTypeLabel = (v) => LOCATION_TYPE_LABELS[v] || v || '—'
export const draftStatusLabel = (v) => DRAFT_STATUS_LABELS[v] || v || '—'

/** Compact "12 keywords · 2 ads" style summary for an ad group. */
export function adGroupSummary(adGroup) {
  const kw = adGroup?.keywords?.length || 0
  const neg = adGroup?.negativeKeywords?.length || 0
  const ads = adGroup?.ads?.length || 0
  const parts = [`${kw} keyword${kw === 1 ? '' : 's'}`]
  if (neg) parts.push(`${neg} negative${neg === 1 ? '' : 's'}`)
  parts.push(`${ads} ad${ads === 1 ? '' : 's'}`)
  return parts.join(' · ')
}

/** Whole-campaign totals for the overview header. */
export function campaignTotals(adGroups = []) {
  const totals = adGroups.reduce(
    (acc, ag) => {
      const ads = ag.ads || []
      return {
        adGroups: acc.adGroups + 1,
        keywords: acc.keywords + (ag.keywords?.length || 0),
        negativeKeywords: acc.negativeKeywords + (ag.negativeKeywords?.length || 0),
        ads: acc.ads + ads.length,
        headlines: acc.headlines + ads.reduce((n, ad) => n + (ad.headlines?.filter((h) => h.text?.trim())?.length || 0), 0),
        descriptions: acc.descriptions + ads.reduce((n, ad) => n + (ad.descriptions?.filter((d) => d.text?.trim())?.length || 0), 0),
      }
    },
    { adGroups: 0, keywords: 0, negativeKeywords: 0, ads: 0, headlines: 0, descriptions: 0 },
  )
  // Average per-ad counts — the metric that actually drives Ad Strength
  // (a campaign's total headline count grows with ad-group count, which
  // says nothing about any single RSA's own diversity).
  totals.avgHeadlinesPerAd = totals.ads > 0 ? totals.headlines / totals.ads : 0
  totals.avgDescriptionsPerAd = totals.ads > 0 ? totals.descriptions / totals.ads : 0
  return totals
}

/** Sitelink/callout/structured-snippet counts for the read-only assets summary. */
export function campaignAssetTotals(campaign = {}) {
  return {
    sitelinks: campaign.sitelinks?.length || 0,
    callouts: campaign.callouts?.length || 0,
    structuredSnippets: campaign.structuredSnippets?.length || 0,
  }
}

/** Format a major-unit daily budget for display, e.g. "1,000". No math on persisted values. */
export function formatBudgetAmount(amount) {
  const n = Number(amount)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)
}

// ── Phase 5 — pre-publish readiness validation vocabulary ───────────────
// Mirrors odito_backend src/modules/aiCampaign/constants/validationEnums.js
// exactly. Display-only — the backend is the sole authority on categories,
// severities, and what counts as READY vs BLOCKED.
export const READINESS_CATEGORY_ORDER = [
  'structure', 'campaign', 'budget', 'bidding', 'location', 'language',
  'ad_groups', 'keywords', 'negative_keywords', 'ads', 'assets', 'landing_page',
  'duplicates', 'business_consistency', 'policy', 'google_ads',
]

export const READINESS_CATEGORY_LABELS = {
  structure: 'Campaign structure',
  campaign: 'Campaign settings',
  budget: 'Budget',
  bidding: 'Bidding strategy',
  location: 'Target location',
  language: 'Language',
  ad_groups: 'Ad groups',
  keywords: 'Keywords',
  negative_keywords: 'Negative keywords',
  ads: 'Ads',
  assets: 'Sitelinks, callouts & snippets',
  landing_page: 'Landing page',
  business_consistency: 'Business consistency',
  duplicates: 'Duplicate content',
  policy: 'Policy concerns',
  google_ads: 'Google Ads account',
}

export const readinessCategoryLabel = (c) => READINESS_CATEGORY_LABELS[c] || c || '—'

// ── Phase 7 — performance + AI optimization vocabulary ───────────────────
// Mirrors odito_backend src/modules/aiCampaign/constants/optimizationEnums.js
// exactly. Display-only — the backend is the sole authority.
export const OPPORTUNITY_TYPE_LABELS = {
  HIGH_SPEND_NO_CONVERSIONS: 'High spend, no conversions',
  HIGH_CPA: 'High cost per conversion',
  LOW_CTR: 'Low click-through rate',
  STRONG_PERFORMER: 'Strong performer',
  LOW_IMPRESSION_SHARE: 'Low impression share',
  WEAK_KEYWORD: 'Weak keyword',
  STRONG_KEYWORD: 'Strong keyword',
  NEGATIVE_KEYWORD_CANDIDATE: 'Negative keyword candidate',
  UNDERPERFORMING_AD: 'Underperforming ad',
}
export const opportunityTypeLabel = (t) => OPPORTUNITY_TYPE_LABELS[t] || t || '—'

export const OPTIMIZATION_OPERATION_LABELS = {
  PAUSE_KEYWORD: 'Pause keyword',
  ENABLE_KEYWORD: 'Enable keyword',
  ADD_NEGATIVE_KEYWORD: 'Add negative keyword',
  PAUSE_AD: 'Pause ad',
  ENABLE_AD: 'Enable ad',
  UPDATE_CAMPAIGN_BUDGET: 'Update daily budget',
}
export const optimizationOperationLabel = (op) => OPTIMIZATION_OPERATION_LABELS[op] || op || '—'

export const CONFIDENCE_LABELS = {
  insufficient_data: 'Not enough data yet',
  low_confidence: 'Low confidence',
  moderate_confidence: 'Moderate confidence',
  high_confidence: 'High confidence',
}
export const confidenceLabel = (c) => CONFIDENCE_LABELS[c] || c || '—'

export const RECOMMENDATION_STATUS_LABELS = {
  pending: 'Awaiting review',
  approved: 'Approving…',
  rejected: 'Rejected',
  stale: 'No longer current',
  executed: 'Applied',
  failed: 'Failed to apply',
}
export const recommendationStatusLabel = (s) => RECOMMENDATION_STATUS_LABELS[s] || s || '—'

/** Format a metric value for display — never renders a bare "0" where the underlying value is null (spec §6: null means unavailable, not zero). */
export function formatMetricValue(value, { suffix = '', decimals = 2 } = {}) {
  if (value === null || value === undefined) return 'N/A'
  const n = Number(value)
  if (!Number.isFinite(n)) return 'N/A'
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: decimals }).format(n)}${suffix}`
}

// ── Phase 8 — automation & autonomous optimization controls vocabulary ───
// Mirrors odito_backend src/modules/aiCampaign/constants/automationEnums.js
// exactly. Display-only — the backend is the sole authority on what a
// policy may contain and what it's allowed to do.

export const AUTOMATION_MODES = ['observe', 'recommend', 'execute']
export const AUTOMATION_MODE_LABELS = { observe: 'Observe only', recommend: 'Recommend', execute: 'Auto-execute' }
export const automationModeLabel = (m) => AUTOMATION_MODE_LABELS[m] || m || '—'

export const AUTOMATION_MODE_DESCRIPTIONS = {
  observe: 'Watches for matching conditions and records what it finds. Nothing is ever created or changed.',
  recommend: 'Creates a recommendation for your review, exactly like a manual analysis — you approve or reject it yourself.',
  execute: 'Creates a recommendation and automatically applies it, within the limits you set below. Nothing runs outside those limits.',
}
export const automationModeDescription = (m) => AUTOMATION_MODE_DESCRIPTIONS[m] || ''

export const RULE_METRICS = ['impressions', 'clicks', 'cost', 'conversions', 'conversionsValue', 'ctr', 'avgCpc', 'conversionRate', 'cpa', 'roas']
export const RULE_METRIC_LABELS = {
  impressions: 'Impressions', clicks: 'Clicks', cost: 'Spend', conversions: 'Conversions', conversionsValue: 'Conversion value',
  ctr: 'CTR', avgCpc: 'Avg. CPC', conversionRate: 'Conversion rate', cpa: 'Cost / conversion', roas: 'ROAS',
}
export const ruleMetricLabel = (m) => RULE_METRIC_LABELS[m] || m || '—'

export const RULE_OPERATORS = ['lt', 'lte', 'gt', 'gte', 'eq']
export const RULE_OPERATOR_LABELS = { lt: 'is below', lte: 'is at or below', gt: 'is above', gte: 'is at or above', eq: 'equals' }
export const ruleOperatorLabel = (op) => RULE_OPERATOR_LABELS[op] || op || '—'

// Same closed operation vocabulary as Phase 7's OPTIMIZATION_OPERATION_LABELS
// above — automation never introduces a new mutation kind, only a
// risk-tiered subset of it.
export const AUTOMATION_OPERATIONS = ['PAUSE_KEYWORD', 'ENABLE_KEYWORD', 'ADD_NEGATIVE_KEYWORD', 'PAUSE_AD', 'ENABLE_AD', 'UPDATE_CAMPAIGN_BUDGET']
export const AUTOMATION_HIGH_RISK_OPERATIONS = ['ENABLE_KEYWORD', 'ENABLE_AD', 'UPDATE_CAMPAIGN_BUDGET']
export const isHighRiskAutomationOperation = (op) => AUTOMATION_HIGH_RISK_OPERATIONS.includes(op)

export const AUTOMATION_FREQUENCIES = ['every_6_hours', 'every_12_hours', 'daily', 'weekly']
export const AUTOMATION_FREQUENCY_LABELS = {
  every_6_hours: 'Every 6 hours', every_12_hours: 'Every 12 hours', daily: 'Daily', weekly: 'Weekly',
}
export const automationFrequencyLabel = (f) => AUTOMATION_FREQUENCY_LABELS[f] || f || '—'
export const AUTOMATION_WALL_CLOCK_FREQUENCIES = ['daily', 'weekly']

export const AUTOMATION_DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' }, { value: 1, label: 'Monday' }, { value: 2, label: 'Tuesday' }, { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' }, { value: 5, label: 'Friday' }, { value: 6, label: 'Saturday' },
]

/** A short, curated list — not exhaustive. Covers the timezones an Odito account is realistically run from; anything else can still be reached by typing a valid IANA name into the same field client-side validation accepts. */
export const COMMON_TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Jakarta',
  'Australia/Sydney', 'Pacific/Auckland',
]

export const AUTOMATION_DATE_RANGE_PRESETS = ['7d', '30d', '90d']

export const AUTOMATION_RUN_STATUS_LABELS = {
  pending: 'Pending', running: 'Running', completed: 'Completed', failed: 'Failed', partially_completed: 'Partially completed',
}
export const automationRunStatusLabel = (s) => AUTOMATION_RUN_STATUS_LABELS[s] || s || '—'

export const AUTOMATION_ACTION_STATUS_LABELS = { executed: 'Executed', recommended: 'Recommended', skipped: 'Skipped', failed: 'Failed' }
export const automationActionStatusLabel = (s) => AUTOMATION_ACTION_STATUS_LABELS[s] || s || '—'

export const AUTOMATION_SKIP_REASON_LABELS = {
  INSUFFICIENT_DATA: 'Not enough data yet',
  COOLDOWN_ACTIVE: 'Recently acted on this — cooling down',
  LIMIT_REACHED: "This run's action limit was reached",
  CONFLICT_EXISTING_RECOMMENDATION: 'Already has a pending recommendation',
  OPERATION_NOT_ALLOWED: 'Operation not allowed by this policy',
  HIGH_RISK_NOT_ENABLED: 'High-risk actions are not enabled for this policy',
  BUDGET_CHANGE_EXCEEDS_LIMIT: "Budget change exceeds this policy's limit",
  ALREADY_IN_DESIRED_STATE: 'Already in the desired state',
  MODE_OBSERVE_ONLY: "Observe mode — logged only, nothing changed",
}
export const automationSkipReasonLabel = (r) => AUTOMATION_SKIP_REASON_LABELS[r] || r || '—'

/** Compact, plain-language description of one rule — used everywhere a rule is shown instead of raw field names. */
export function describeAutomationRule(rule) {
  if (!rule) return '—'
  return `${ruleMetricLabel(rule.metric)} ${ruleOperatorLabel(rule.operator)} ${rule.threshold} → ${optimizationOperationLabel(rule.operation)}`
}

/** Plain-language summary of a policy's schedule, e.g. "Daily at 09:00 (Asia/Kolkata)" or "Every 6 hours". */
export function describeAutomationSchedule(schedule) {
  if (!schedule) return '—'
  if (!AUTOMATION_WALL_CLOCK_FREQUENCIES.includes(schedule.frequency)) {
    return automationFrequencyLabel(schedule.frequency)
  }
  const hh = String(schedule.hourOfDay ?? 9).padStart(2, '0')
  const dayPart = schedule.frequency === 'weekly'
    ? `${(AUTOMATION_DAYS_OF_WEEK.find((d) => d.value === schedule.dayOfWeek) || AUTOMATION_DAYS_OF_WEEK[1]).label}s `
    : ''
  return `${schedule.frequency === 'weekly' ? '' : 'Daily '}${dayPart}at ${hh}:00 (${schedule.timezone || 'UTC'})`.trim()
}
