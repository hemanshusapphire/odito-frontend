import { MIX_LABELS, PLATFORM_LABELS } from '@/lib/socialMedia/aiStrategy'

/**
 * Display + option helpers for single-post AI generation (POST /social/ai-content/generate).
 * The selectable platforms / pillars / objectives come from the STORED strategy and the live
 * connection state the server reports; the server re-validates every choice, so nothing here is
 * an authority - it only avoids offering what would be refused.
 */

export const CONTENT_PLATFORMS = ['facebook', 'instagram']

/** What the form may offer. `connected` is the server's own report (strategy state `profile.connectedPlatforms`). */
export function generatorOptions(state) {
  const strategy = state?.strategy?.strategy
  if (!strategy) return { platforms: [], pillars: [], objectives: [] }
  const connected = state?.profile?.connectedPlatforms || {}
  const covered = new Set((strategy.platformStrategy || []).map((p) => p.platform))
  return {
    platforms: CONTENT_PLATFORMS.filter((p) => covered.has(p)).map((p) => ({ value: p, label: PLATFORM_LABELS[p], connected: connected[p] === true })),
    pillars: (strategy.contentPillars || []).map((p) => ({ value: p.name, label: p.name })),
    objectives: (strategy.contentMix || []).filter((m) => m.percentage > 0).map((m) => ({ value: m.type, label: MIX_LABELS[m.type] || m.type })),
  }
}

/** Where "Review content" goes: the existing Content Approvals tab the draft really sits in. */
export function approvalTabFor(approvalState) {
  switch (approvalState) {
    case 'content_review': return 'content-review'
    case 'design_review': return 'design-review'
    case 'content_approved':
    case 'design_approved': return 'approved'
    default: return 'drafts'
  }
}
export const reviewHref = (approvalState) => `/app/social-media/content-approvals?tab=${approvalTabFor(approvalState)}`

const APPROVAL_NOTE = Object.freeze({
  content_review: 'Waiting for content review',
  content_approved: 'Content approved - ready for the design step',
  design_review: 'Waiting for design review',
  design_approved: 'Content and design approved',
})
export const approvalNote = (approvalState) => APPROVAL_NOTE[approvalState] || 'Saved as a draft'

export const objectiveLabel = (objective) => MIX_LABELS[objective] || objective
