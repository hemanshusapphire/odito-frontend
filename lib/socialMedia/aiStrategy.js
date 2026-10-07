/**
 * Display helpers for the Social Media AI Strategy (GET /social/ai-strategy).
 * The backend decides every value; this file only turns codes into words.
 */

export const MIX_LABELS = Object.freeze({
  informational: 'Informational',
  educational: 'Educational',
  soft_sell: 'Soft sell',
  hard_sell: 'Hard sell',
  engagement: 'Engagement',
  behind_the_scenes: 'Behind the scenes',
})

export const PLATFORM_LABELS = Object.freeze({ facebook: 'Facebook', instagram: 'Instagram' })
export const PRIORITY_LABELS = Object.freeze({ high: 'High', medium: 'Medium', low: 'Low' })

export const WEEKDAY_LABELS = Object.freeze({
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
})

/** Names for the Business Profile parts the backend reports as changed (profile.changes). */
export const CHANGE_LABELS = Object.freeze({
  'business.name': 'Business name',
  'business.description': 'Business description',
  'business.category': 'Category',
  'business.secondaryCategories': 'Secondary categories',
  'business.website': 'Website',
  'business.language': 'Language',
  'business.seoScope': 'Local / national scope',
  'business.location': 'Location',
  'business.serviceArea': 'Service area',
  audience: 'Audience',
  toneOfVoice: 'Tone of voice',
  goals: 'Goals',
  uniqueSellingPoints: 'Unique selling points',
  offers: 'Offers',
  competitors: 'Competitors',
  contentPillars: 'Content pillars',
  prohibitedPhrases: 'Phrases to avoid',
  additionalInstructions: 'Additional instructions',
  brand: 'Brand colours & fonts',
  businessModel: 'Business type',
  brandKit: 'Brand identity & messaging',
  services: 'Services',
  products: 'Products',
  connectedPlatforms: 'Connected platforms',
})

export const GAP_LABELS = Object.freeze({
  audience: 'Audience',
  goals: 'Goals',
  connectedPlatforms: 'Connected accounts',
  description: 'Business description',
  category: 'Business category',
  toneOfVoice: 'Tone of voice',
  uniqueSellingPoints: 'Unique selling points',
  location: 'Location',
  offers: 'Offers',
  competitors: 'Competitors',
  contentPillars: 'Content pillars',
  brand: 'Brand colours & fonts',
  businessModel: 'Business type',
  services: 'Services',
  products: 'Products',
})

export const changeLabel = (path) => CHANGE_LABELS[path] || path
export const gapLabel = (field) => GAP_LABELS[field] || field

export function formatDateTime(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

/**
 * The headline of the status card, from the server's state only:
 *   none | generating | ready | failed  (+ whether a ready strategy is out of date)
 */
export function statusView(state) {
  if (!state) return { tone: 'neutral', title: 'AI strategy', subtitle: 'Loading…' }
  const { status, strategy, generation, profile } = state
  if (status === 'generating') {
    return { tone: 'working', title: 'Generating your strategy', subtitle: generation?.startedAt ? `Started ${formatDateTime(generation.startedAt)}` : 'This can take a minute' }
  }
  if (status === 'failed') {
    return { tone: 'error', title: 'Generation failed', subtitle: strategy ? `Showing version ${strategy.version}` : 'Nothing was saved' }
  }
  if (status === 'ready' && strategy) {
    return profile?.changed
      ? { tone: 'warning', title: `Strategy v${strategy.version} may be out of date`, subtitle: 'Business profile changed' }
      : { tone: 'success', title: `Strategy v${strategy.version} ready`, subtitle: `Generated ${formatDateTime(strategy.generatedAt) || ''}`.trim() }
  }
  return { tone: 'neutral', title: 'No strategy yet', subtitle: profile?.canGenerate === false ? 'Complete your business profile first' : 'Generate one from your business profile' }
}

/** Mix entries sorted largest-first for display (the stored order is the AI's). */
export const sortedMix = (mix) => [...(mix || [])].sort((a, b) => b.percentage - a.percentage)
