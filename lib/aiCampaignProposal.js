/**
 * AI Campaign Builder — change-proposal display helpers (Phase 4).
 *
 * Pure functions only: turn the backend's structured `changes[]` (already
 * validated server-side — see proposalValidator.js) into copy the diff UI
 * can render. Never interprets `before`/`after` as anything other than
 * inert data — no HTML, no markdown, no code execution (spec §44).
 */

import {
  proposalTargetLabel,
  proposalSection,
  PROPOSAL_SECTION_ORDER,
  biddingStrategyLabel,
  matchTypeLabel,
  formatBudgetAmount,
} from './aiCampaignConstants'

function isPlainObject(v) {
  return v != null && typeof v === 'object' && !Array.isArray(v)
}

/** Render any change value (string, number, or a structured object) as short display text. */
export function describeValue(target, value) {
  if (value == null || value === '') return null

  switch (target) {
    case 'CAMPAIGN_DAILY_BUDGET':
      return formatBudgetAmount(value)
    case 'CAMPAIGN_BIDDING_STRATEGY':
      return biddingStrategyLabel(value)
    case 'CAMPAIGN_LOCATION':
      if (isPlainObject(value)) return [value.name, value.countryCode].filter(Boolean).join(', ')
      return String(value)
    case 'CAMPAIGN_LANGUAGE':
      return isPlainObject(value) ? value.name : String(value)
    case 'AD_GROUP':
      if (isPlainObject(value)) {
        const kw = value.keywords?.length || 0
        const ads = value.ads?.length || 0
        return `${value.name}${kw || ads ? ` (${[kw && `${kw} keyword${kw === 1 ? '' : 's'}`, ads && `${ads} ad${ads === 1 ? '' : 's'}`].filter(Boolean).join(', ')})` : ''}`
      }
      return String(value)
    case 'KEYWORD':
    case 'NEGATIVE_KEYWORD':
      if (isPlainObject(value)) return `"${value.text}"${value.matchType ? ` (${matchTypeLabel(value.matchType)})` : ''}`
      return `"${value}"`
    case 'AD':
      if (isPlainObject(value)) {
        const first = value.headlines?.[0]?.text || value.headlines?.[0]
        return first ? `Ad: "${first}"` : 'New ad'
      }
      return String(value)
    case 'AD_HEADLINE':
    case 'AD_DESCRIPTION':
      return isPlainObject(value) ? value.text : String(value)
    default:
      return isPlainObject(value) ? (value.text ?? value.name ?? JSON.stringify(value)) : String(value)
  }
}

/**
 * Normalize one raw backend change into everything the diff UI needs.
 * @param {object} change - { id, operation, target, before, after, reason }
 */
export function describeChange(change) {
  const target = change.target
  return {
    id: change.id,
    kind: change.operation, // 'add' | 'remove' | 'replace'
    section: proposalSection(target),
    fieldLabel: proposalTargetLabel(target),
    before: describeValue(target, change.before),
    after: describeValue(target, change.after),
    reason: change.reason || null,
  }
}

/**
 * Group a proposal's changes into the fixed section order the review UI
 * shows (spec §21): Campaign, Ad Groups, Keywords, Negative Keywords, Ads.
 * Empty sections are omitted.
 */
export function groupChangesBySection(changes) {
  const described = (changes || []).map(describeChange)
  const bySection = new Map()
  for (const c of described) {
    if (!bySection.has(c.section)) bySection.set(c.section, [])
    bySection.get(c.section).push(c)
  }
  return PROPOSAL_SECTION_ORDER
    .filter((section) => bySection.has(section))
    .map((section) => ({ section, changes: bySection.get(section) }))
}

/** Total change count — used for "AI proposed N changes" copy. */
export function countChanges(changes) {
  return (changes || []).length
}
