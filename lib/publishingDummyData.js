/**
 * Static/dummy data for the Social Media Publishing module
 * (components/dashboard/social/publishing/**, app/app/social/publishing/page.jsx).
 *
 * Frontend-only: no API calls, no React Query, no backend, no persistence.
 * Reuses PLATFORMS (icon/name/color) from lib/socialMediaDummyData.js and
 * USERS/TODAY_ISO from lib/leadsDummyData.js so every module in this demo
 * agency account shares the same platform palette, team roster, and "today"
 * (2026-07-31) instead of redeclaring them three times over.
 */

import { PLATFORMS } from './socialMediaDummyData'
import { USERS, TODAY_ISO } from './leadsDummyData'

export const PUBLISHING_PLATFORMS = PLATFORMS.map((p) => ({ id: p.id, name: p.name, icon: p.icon, color: p.brandColor }))

export const PUBLISHING_STATUSES = ['Scheduled', 'Published', 'Draft', 'Failed']

export const STATUS_STYLE = {
  Scheduled: { variant: 'info', dot: '#5B8DEF' },
  Published: { variant: 'success', dot: '#34D399' },
  Draft: { variant: 'secondary', dot: '#94A3B8' },
  Failed: { variant: 'critical', dot: '#F1665F' },
}

export const CAMPAIGNS = [
  'Back to School', 'Emergency Dental Awareness', 'Smile Makeover Month', 'Community Health Fair', 'New Patient Welcome',
]

export const PRIORITIES = ['High', 'Medium', 'Low']

export { TODAY_ISO }
export { USERS as AUTHORS }

function author(i) { return USERS[i % USERS.length].name }

export const PUBLISHING_POSTS = [
  { id: 'pub1', platform: 'facebook', title: 'Thanksgiving gratitude post', status: 'Published', scheduledAt: '2026-06-29T09:00:00', author: author(0), campaign: 'New Patient Welcome' },
  { id: 'pub2', platform: 'instagram', title: 'Waiting room renovation carousel', status: 'Published', scheduledAt: '2026-06-30T14:00:00', author: author(2), campaign: 'Smile Makeover Month' },
  { id: 'pub3', platform: 'linkedin', title: 'Continuing education milestone', status: 'Published', scheduledAt: '2026-07-02T10:00:00', author: author(1), campaign: 'New Patient Welcome' },
  { id: 'pub4', platform: 'x', status: 'Published', title: 'Enamel care myth-busting', scheduledAt: '2026-07-03T11:30:00', author: author(4), campaign: 'Emergency Dental Awareness' },
  { id: 'pub5', platform: 'tiktok', title: 'Behind-the-scenes cleaning explainer', status: 'Published', scheduledAt: '2026-07-06T18:00:00', author: author(3), campaign: 'Smile Makeover Month' },
  { id: 'pub6', platform: 'facebook', title: 'Same-day crown before/after', status: 'Published', scheduledAt: '2026-07-09T13:00:00', author: author(0), campaign: 'Smile Makeover Month' },
  { id: 'pub7', platform: 'instagram', title: 'Flossing reminder graphic', status: 'Published', scheduledAt: '2026-07-11T08:30:00', author: author(2), campaign: 'Emergency Dental Awareness' },
  { id: 'pub8', platform: 'linkedin', title: 'Hiring: dental hygienist', status: 'Published', scheduledAt: '2026-07-13T09:00:00', author: author(1), campaign: 'New Patient Welcome' },
  { id: 'pub9', platform: 'x', title: 'Whitening myths thread', status: 'Failed', scheduledAt: '2026-07-15T08:00:00', author: author(4), campaign: 'Emergency Dental Awareness' },
  { id: 'pub10', platform: 'tiktok', title: 'Patient experience POV', status: 'Published', scheduledAt: '2026-07-17T17:30:00', author: author(3), campaign: 'Smile Makeover Month' },
  { id: 'pub11', platform: 'facebook', title: 'New associate welcome post', status: 'Published', scheduledAt: '2026-07-19T12:00:00', author: author(5), campaign: 'New Patient Welcome' },
  { id: 'pub12', platform: 'instagram', title: 'Back to school checklist graphic', status: 'Published', scheduledAt: '2026-07-21T15:00:00', author: author(2), campaign: 'Back to School' },
  { id: 'pub13', platform: 'linkedin', title: 'Community fair sponsorship recap', status: 'Failed', scheduledAt: '2026-07-22T10:00:00', author: author(1), campaign: 'Community Health Fair' },
  { id: 'pub14', platform: 'x', title: 'Back to school dental tips thread', status: 'Draft', scheduledAt: '2026-07-24T09:00:00', author: author(4), campaign: 'Back to School' },
  { id: 'pub15', platform: 'facebook', title: 'Labor Day office hours reminder', status: 'Scheduled', scheduledAt: '2026-07-31T08:00:00', author: author(0), campaign: 'New Patient Welcome' },
  { id: 'pub16', platform: 'instagram', title: 'Patient testimonial reel', status: 'Draft', scheduledAt: '2026-07-31T16:00:00', author: author(2), campaign: 'Smile Makeover Month' },
  { id: 'pub17', platform: 'tiktok', title: 'Quick tips: sensitive teeth', status: 'Scheduled', scheduledAt: '2026-07-31T19:00:00', author: author(3), campaign: 'Emergency Dental Awareness' },
  { id: 'pub18', platform: 'linkedin', title: 'Community health fair announcement', status: 'Scheduled', scheduledAt: '2026-08-01T09:00:00', author: author(1), campaign: 'Community Health Fair' },
  { id: 'pub19', platform: 'facebook', title: 'Free screening event details', status: 'Scheduled', scheduledAt: '2026-08-01T13:30:00', author: author(5), campaign: 'Community Health Fair' },
  { id: 'pub20', platform: 'x', title: 'Screening event countdown', status: 'Scheduled', scheduledAt: '2026-08-02T10:00:00', author: author(4), campaign: 'Community Health Fair' },
  { id: 'pub21', platform: 'instagram', title: 'Back to school family bundle promo', status: 'Scheduled', scheduledAt: '2026-08-03T11:00:00', author: author(2), campaign: 'Back to School' },
  { id: 'pub22', platform: 'tiktok', title: 'Staff spotlight short', status: 'Draft', scheduledAt: '2026-08-05T17:00:00', author: author(3), campaign: 'New Patient Welcome' },
]

// ── Post History metrics (Published/Failed posts only) ──────────────
function seededRandom(seed) {
  let s = seed
  return function next() { s = (s * 9301 + 49297) % 233280; return s / 233280 }
}

export function historyMetricsFor(post) {
  if (post.status === 'Failed') return { reach: 0, engagement: 0, likes: 0, comments: 0, shares: 0 }
  const rnd = seededRandom(post.id.length * 97 + post.id.charCodeAt(3) * 13)
  const reach = Math.round(1200 + rnd() * 9000)
  const likes = Math.round(reach * (0.02 + rnd() * 0.05))
  const comments = Math.round(likes * (0.05 + rnd() * 0.1))
  const shares = Math.round(likes * (0.03 + rnd() * 0.08))
  const engagement = likes + comments + shares
  return { reach, engagement, likes, comments, shares }
}

export function postCounts() {
  const counts = { Scheduled: 0, Published: 0, Draft: 0, Failed: 0 }
  for (const p of PUBLISHING_POSTS) counts[p.status] = (counts[p.status] || 0) + 1
  return counts
}

export function scheduledTodayCount() {
  return PUBLISHING_POSTS.filter((p) => p.scheduledAt.slice(0, 10) === TODAY_ISO && p.status === 'Scheduled').length
}

// ── Post Planner (weekly board) ──────────────────────────────────────
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const INITIAL_PLANNER_TASKS = [
  { id: 't1', day: 'Monday', platform: 'facebook', topic: 'Weekly patient tip', campaign: 'New Patient Welcome', priority: 'Medium', status: 'Draft', assignee: author(0) },
  { id: 't2', day: 'Monday', platform: 'linkedin', topic: 'Team spotlight', campaign: 'New Patient Welcome', priority: 'Low', status: 'Planned', assignee: author(1) },
  { id: 't3', day: 'Tuesday', platform: 'instagram', topic: 'Before/after showcase', campaign: 'Smile Makeover Month', priority: 'High', status: 'Planned', assignee: author(2) },
  { id: 't4', day: 'Wednesday', platform: 'x', topic: 'Myth-busting thread', campaign: 'Emergency Dental Awareness', priority: 'Medium', status: 'Draft', assignee: author(4) },
  { id: 't5', day: 'Wednesday', platform: 'tiktok', topic: 'Quick tip short', campaign: 'Emergency Dental Awareness', priority: 'Medium', status: 'Planned', assignee: author(3) },
  { id: 't6', day: 'Thursday', platform: 'facebook', topic: 'Community fair teaser', campaign: 'Community Health Fair', priority: 'High', status: 'Approved', assignee: author(5) },
  { id: 't7', day: 'Friday', platform: 'instagram', topic: 'Weekend hours reminder', campaign: 'New Patient Welcome', priority: 'Low', status: 'Planned', assignee: author(2) },
  { id: 't8', day: 'Friday', platform: 'linkedin', topic: 'Back to school partnership post', campaign: 'Back to School', priority: 'Medium', status: 'Draft', assignee: author(1) },
  { id: 't9', day: 'Saturday', platform: 'tiktok', topic: 'Staff spotlight short', campaign: 'New Patient Welcome', priority: 'Low', status: 'Planned', assignee: author(3) },
  { id: 't10', day: 'Sunday', platform: 'x', topic: 'Week ahead preview', campaign: 'Back to School', priority: 'Low', status: 'Planned', assignee: author(4) },
]

export const PLANNER_STATUS_VARIANT = { Draft: 'secondary', Planned: 'info', Approved: 'success' }

// ── Bulk Upload ───────────────────────────────────────────────────────
export const UPLOAD_HISTORY = [
  { id: 'u1', fileName: 'july-campaign-posts.csv', rows: 18, status: 'Imported', uploadedAt: '2026-07-28T10:12:00', uploadedBy: author(1) },
  { id: 'u2', fileName: 'back-to-school-batch.xlsx', rows: 9, status: 'Imported', uploadedAt: '2026-07-20T14:03:00', uploadedBy: author(2) },
  { id: 'u3', fileName: 'q3-social-calendar.csv', rows: 42, status: 'Imported', uploadedAt: '2026-07-05T09:45:00', uploadedBy: author(0) },
  { id: 'u4', fileName: 'draft-imports-old.csv', rows: 6, status: 'Failed', uploadedAt: '2026-06-22T16:20:00', uploadedBy: author(4) },
]
