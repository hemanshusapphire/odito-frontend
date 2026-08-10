/**
 * Static/dummy data for the Social Media Reports page
 * (components/dashboard/social/reports/**, app/app/social/reports/page.jsx).
 *
 * Frontend-only: no API calls, no React Query, no backend, no persistence -
 * same approach as the rest of the Social Media module. Extends
 * PLATFORMS (lib/socialMediaDummyData.js) with a YouTube entry scoped to
 * this file only, since Reports is the one page in this module whose
 * reference screenshot includes a 6th platform - adding it to the shared
 * PLATFORMS array would have rippled into Overview/Feeds/Publishing,
 * which only ever specified 5.
 */

import { Youtube } from 'lucide-react'
import { PLATFORMS } from './socialMediaDummyData'

export const REPORT_PLATFORMS = [
  ...PLATFORMS.map((p) => ({ id: p.id, name: p.name, icon: p.icon, color: p.brandColor })),
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
]

export const QUICK_RANGES = [7, 30, 60, 90]
export const PERIODS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

const ACCOUNT_NAME = 'Bellhaven Family Dental'

function seededRandom(seed) {
  let s = seed
  return function next() { s = (s * 9301 + 49297) % 233280; return s / 233280 }
}

const PLATFORM_SEED = { facebook: 11, x: 22, instagram: 33, linkedin: 44, tiktok: 55, youtube: 66 }

/** KPI cards (Page Impressions / Total Engagement / Link Clicks) for one platform. */
export function kpisForPlatform(platformId) {
  const seed = PLATFORM_SEED[platformId] || 10
  const rnd = seededRandom(seed)
  const base = { impressions: 400 + Math.round(rnd() * 3000), engagement: 80 + Math.round(rnd() * 600), linkClicks: 20 + Math.round(rnd() * 300) }

  function spark(offset) {
    const r = seededRandom(seed + offset)
    let v = base.impressions * 0.2
    return Array.from({ length: 14 }, () => {
      v += (r() - 0.45) * (base.impressions * 0.08)
      v = Math.max(base.impressions * 0.1, v)
      return Math.round(v)
    })
  }

  return [
    {
      key: 'impressions', label: 'Page Impressions', icon: 'eye', value: base.impressions,
      trendPct: Math.round((rnd() - 0.35) * 30), previous: Math.round(base.impressions * (0.8 + rnd() * 0.3)), spark: spark(1),
    },
    {
      key: 'engagement', label: 'Total Engagement', icon: 'users', value: base.engagement,
      trendPct: Math.round((rnd() - 0.35) * 30), previous: Math.round(base.engagement * (0.8 + rnd() * 0.3)), spark: spark(2),
    },
    {
      key: 'linkClicks', label: 'Link Clicks', icon: 'mousePointer', value: base.linkClicks,
      trendPct: Math.round((rnd() - 0.35) * 30), previous: Math.round(base.linkClicks * (0.8 + rnd() * 0.3)), spark: spark(3),
    },
  ]
}

const PERIOD_POINT_COUNT = { day: 8, week: 7, month: 30 }

/** Multi-platform daily impressions series for the main Performance Chart. */
export function performanceSeries(period, days = 30) {
  const points = period === 'month' ? days : PERIOD_POINT_COUNT[period]
  const anchor = new Date('2026-07-30T00:00:00')

  return Array.from({ length: points }, (_, i) => {
    const d = new Date(anchor)
    if (period === 'day') d.setHours(d.getHours() - (points - 1 - i) * 3)
    else d.setDate(d.getDate() - (points - 1 - i))

    const row = { date: period === 'day' ? d.toISOString() : d.toISOString().slice(0, 10) }
    for (const p of REPORT_PLATFORMS) {
      const rnd = seededRandom((PLATFORM_SEED[p.id] || 10) + i * 7)
      row[p.id] = Math.max(0, Math.round(rnd() * (p.id === 'facebook' ? 2 : 1)))
    }
    return row
  })
}

/** "Social Stats by Profile" table rows - one per platform. */
export const STATS_ROWS = REPORT_PLATFORMS.map((p) => {
  const rnd = seededRandom((PLATFORM_SEED[p.id] || 10) + 99)
  const followers = Math.round(20 + rnd() * 400)
  const impressions = Math.round(5 + rnd() * 40)
  const followersGained = rnd() > 0.6 ? Math.round(rnd() * 6) : null
  const messagesSent = rnd() > 0.7 ? Math.round(rnd() * 10) : null
  const totalEngagement = rnd() > 0.65 ? Math.round(rnd() * 20) : null
  return {
    id: p.id,
    platform: p,
    profileName: ACCOUNT_NAME,
    followers,
    followersGained,
    impressions,
    messagesSent,
    totalEngagement,
    engagementPerFollower: totalEngagement ? Math.round((totalEngagement / followers) * 1000) / 10 : null,
  }
})

export function dateRangeLabel(days) {
  const end = new Date('2026-07-30T00:00:00')
  const start = new Date(end)
  start.setDate(start.getDate() - days)
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}
