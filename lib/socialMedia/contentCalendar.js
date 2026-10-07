/**
 * Display helpers for the Social Media AI Content Calendar plan (GET /social/content-calendar).
 * The backend decides every value (dates, pillars, platforms, objectives, KPIs); this file only turns codes into
 * words and holds the defaults of the planning form.
 */
import { DateTime } from 'luxon'

export const FORMAT_LABELS = Object.freeze({ static_post: 'Static post', carousel: 'Carousel', reel: 'Reel', video: 'Video', text_post: 'Text post' })

export const OBJECTIVE_LABELS = Object.freeze({
  awareness: 'Awareness', engagement: 'Engagement', traffic: 'Traffic', lead_generation: 'Lead generation', conversion: 'Conversion',
})

export const KPI_LABELS = Object.freeze({
  reach: 'Reach', views: 'Views', comments: 'Comments', shares: 'Shares', saves: 'Saves', link_clicks: 'Link clicks',
  dms: 'DMs', calls: 'Calls', form_submissions: 'Form submissions', purchases: 'Purchases', bookings: 'Bookings',
})

export const ASSET_LABELS = Object.freeze({
  product_image: 'Product image', logo: 'Logo', team_photo: 'Team photo', customer_photo: 'Customer photo', testimonial: 'Testimonial',
  screenshot: 'Screenshot', stock_photo: 'Stock photo', video_clip: 'Video clip', infographic: 'Infographic',
})

/**
 * The ONE status a person sees for a planned post (the API's `effectiveStatus`): the planning status (planned / edited /
 * plan approved) until content exists, then the real state of the linked publication (review, approved, scheduled,
 * published). There is deliberately no second status system.
 */
export const ITEM_STATUS_LABELS = Object.freeze({
  planned: 'Planned', edited: 'Edited', plan_approved: 'Plan approved', draft: 'Draft', content_generated: 'Content generated', content_review: 'Content review',
  content_approved: 'Content approved', design_review: 'Design review', approved: 'Approved', scheduled: 'Scheduled', published: 'Published', failed: 'Failed', cancelled: 'Cancelled',
})

/** Badge colour per status (a Pill tone). */
export const ITEM_STATUS_TONE = Object.freeze({
  planned: 'slate', draft: 'slate', edited: 'amber', plan_approved: 'blue', content_generated: 'violet', content_review: 'amber', content_approved: 'blue',
  design_review: 'amber', approved: 'green', scheduled: 'blue', published: 'green', failed: 'red', cancelled: 'slate',
})

export const DISTRIBUTION_OPTIONS = Object.freeze([
  { value: 'ai_optimized', label: 'AI optimized', description: 'Odito decides which platform each post suits. A post can go to both.' },
  { value: 'balanced', label: 'Balanced', description: 'Posts are shared evenly across your platforms, one platform per post.' },
  { value: 'platform_specific', label: 'Platform-specific', description: 'One platform per post, weighted by your strategy\'s platform plan.' },
])

export const HOOK_CATEGORY_LABELS = Object.freeze({
  educational: 'Educational', curiosity: 'Curiosity', problem_solution: 'Problem / solution', contrarian: 'Contrarian', story: 'Story', proof: 'Proof', engagement: 'Engagement', promotional: 'Promotional',
})

export const POSTS_PER_WEEK_OPTIONS = Object.freeze([1, 2, 3, 4, 5, 6, 7])
export const QUICK_RANGES = Object.freeze([{ days: 7, label: 'Next 7 days' }, { days: 14, label: 'Next 14 days' }, { days: 30, label: 'Next 30 days' }])

const iso = (dt) => dt.toFormat('yyyy-LL-dd')

/** A range starting tomorrow (local time) and covering `days` days. */
export function rangeFromToday(days) {
  const start = DateTime.local().plus({ days: 1 }).startOf('day')
  return { startDate: iso(start), endDate: iso(start.plus({ days: days - 1 })) }
}

export function dayCount(startDate, endDate) {
  const a = DateTime.fromISO(startDate || '')
  const b = DateTime.fromISO(endDate || '')
  if (!a.isValid || !b.isValid || b < a) return 0
  return Math.round(b.diff(a, 'days').days) + 1
}

/** "Mon 7 Oct" for a calendar date string (no timezone conversion: it is a calendar date). */
export function formatPlanDate(date, { year = false } = {}) {
  const dt = DateTime.fromISO(date || '', { zone: 'utc' })
  return dt.isValid ? dt.toFormat(year ? 'ccc d LLL yyyy' : 'ccc d LLL') : String(date || '')
}

/** "Wednesday" for a calendar date string, or '' when it is not a date. */
export function weekdayName(date) {
  const dt = DateTime.fromISO(date || '', { zone: 'utc' })
  return dt.isValid ? dt.toFormat('cccc') : ''
}

/** A rough preview of how many posts a request will produce (the server decides the exact number). */
export function estimatePosts(postsPerWeek, days) {
  if (!postsPerWeek || !days) return 0
  return Math.max(1, Math.round((postsPerWeek * days) / 7))
}

/** The default posts per week: the strategy's recommendation, kept inside 1-7, else 3. */
export function defaultPostsPerWeek(recommended) {
  const n = Number(recommended?.postsPerWeek)
  return Number.isInteger(n) && n >= 1 && n <= 7 ? n : 3
}

export function recommendedLabel(recommended) {
  const r = recommended?.range
  if (r && r.min && r.max) return r.min === r.max ? `${r.min} posts/week` : `${r.min}-${r.max} posts/week`
  const n = Number(recommended?.postsPerWeek)
  return n >= 1 && n <= 7 ? `${n} posts/week` : null
}

export const platformsLabel = (platforms) => (platforms || []).map((p) => (p === 'facebook' ? 'Facebook' : p === 'instagram' ? 'Instagram' : p)).join(' + ')

export function groupByWeek(items) {
  const weeks = new Map()
  for (const item of items) {
    const dt = DateTime.fromISO(item.date, { zone: 'utc' })
    const key = dt.isValid ? dt.startOf('week').toFormat('yyyy-LL-dd') : item.date
    if (!weeks.has(key)) weeks.set(key, [])
    weeks.get(key).push(item)
  }
  return [...weeks.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([weekStart, list]) => ({ weekStart, items: list }))
}
