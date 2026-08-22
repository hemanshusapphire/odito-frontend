/**
 * Real-data UI config for the Social Media Feeds page
 * (components/dashboard/social/feeds/**, app/app/social/feeds/page.jsx)
 * and reused by the Publishing tab (components/dashboard/social/
 * publishing/ScheduleCalendar.jsx, ScheduleCard.jsx) for its own
 * unrelated, still-mock post data's platform icon lookup.
 *
 * Despite the filename (kept as-is so Publishing's existing import path
 * doesn't need to change), this file no longer contains any fabricated
 * post content. The Feeds page's actual posts now come from
 * GET /api/social/feeds (see hooks/useDashboardQueries.js's
 * useSocialFeeds and odito_backend's socialFeedService.js) — real,
 * synced Facebook/Instagram data. What remains here is legitimate UI
 * chrome (which icon/color represents which platform, the sort dropdown
 * options) — not business data, and not specific to any one project.
 */

import { PLATFORMS } from './socialMediaDummyData'

export const FEED_PLATFORMS = PLATFORMS.map((p) => ({ id: p.id, name: p.name, icon: p.icon, color: p.brandColor }))

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
]

// Single source of truth for the Feeds page's "Posts per page" selector —
// both page.jsx and FeedPagination.jsx import from here, never a
// hardcoded literal list, so the allowed values can never drift between
// the two. Must stay <= the backend's MAX_PAGE_SIZE (socialFeedService.js)
// or a user's own selection would be silently clamped down with no
// indication anything was capped.
export const FEED_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
export const DEFAULT_FEED_PAGE_SIZE = 50

export function platformConfig(id) {
  return FEED_PLATFORMS.find((p) => p.id === id)
}
