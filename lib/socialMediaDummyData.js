/**
 * Static/dummy data for the Social Media Management module
 * (components/dashboard/social/**).
 *
 * Frontend-only module: no API calls, no React Query, no backend, no
 * persistence - same approach as lib/googleAdsDummyData.js and
 * lib/leadsDummyData.js. "Connect Account" toggles a platform's
 * `connected` flag in the page's local React state only; nothing survives
 * a refresh.
 */

import {
  Eye, FileText, Users, MessageSquare, UserPlus, AtSign,
  Image as ImageIcon, Heart, MousePointerClick, Video, Facebook, Instagram, Linkedin, Twitter, Music2,
} from 'lucide-react'

export const PERIODS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

function seededRandom(seed) {
  let s = seed
  return function next() {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const PERIOD_POINTS = {
  day: ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'],
  week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  month: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
}

const PERIOD_RANGE_LABEL = {
  day: 'Jul 30, 2026',
  week: 'Jul 24 – Jul 30, 2026',
  month: 'Jul 1 – Jul 30, 2026',
}

/** Deterministic dummy series for a single-metric chart (Area/Line). */
function buildSeries(seed, base, amp) {
  const out = {}
  for (const period of ['day', 'week', 'month']) {
    const rnd = seededRandom(seed + period.length)
    out[period] = PERIOD_POINTS[period].map((label) => {
      const v = Math.max(base * 0.25, base + (rnd() - 0.45) * amp)
      return { label, value: Math.round(v) }
    })
  }
  return out
}

/** Deterministic dummy series for a 2-metric chart (grouped Bar / dual Line). */
function buildDualSeries(seed, aKey, bKey, base, amp) {
  const out = {}
  for (const period of ['day', 'week', 'month']) {
    const rndA = seededRandom(seed + period.length)
    const rndB = seededRandom(seed + period.length + 7)
    out[period] = PERIOD_POINTS[period].map((label) => ({
      label,
      [aKey]: Math.round(Math.max(base * 0.2, base + (rndA() - 0.45) * amp)),
      [bKey]: Math.round(Math.max(base * 0.15, base * 0.7 + (rndB() - 0.45) * amp)),
    }))
  }
  return out
}

export const PLATFORMS = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    brandColor: '#1877F2',
    connected: true,
    kpis: [
      { key: 'impressions', label: 'Page Impressions', value: '6', icon: Eye },
      { key: 'posts', label: 'Recent Posts', value: '0', icon: FileText },
      { key: 'fans', label: 'New Fans', value: '0', icon: Users },
    ],
    chart: { type: 'area', title: 'Page Impressions', seriesKey: 'value', color: '#1877F2', series: buildSeries(11, 40, 30) },
    connectMessage: null,
  },
  {
    id: 'x',
    name: 'X',
    icon: Twitter,
    brandColor: '#0F1419',
    connected: false,
    kpis: [
      { key: 'tweets', label: 'Tweets', value: '356', icon: MessageSquare },
      { key: 'followers', label: 'Followers', value: '251', icon: UserPlus },
      { key: 'impressions', label: 'Impressions', value: '3', icon: Eye },
      { key: 'mentions', label: 'Mentions', value: '209', icon: AtSign },
    ],
    chart: { type: 'area', title: 'Page Engagement', seriesKey: 'value', color: '#0F1419', series: buildSeries(22, 55, 40) },
    connectMessage: 'X account is not linked for this project.',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    brandColor: '#E1306C',
    connected: false,
    kpis: [
      { key: 'posts', label: 'Total Posts', value: '356', icon: ImageIcon },
      { key: 'engagements', label: 'Total Engagements', value: '251', icon: Users },
      { key: 'followersGained', label: 'Followers Gained', value: '3', icon: UserPlus },
      { key: 'likes', label: 'Total Likes', value: '209', icon: Heart },
    ],
    chart: {
      type: 'bar', title: 'Total Comments vs Total Likes',
      seriesA: { key: 'comments', label: 'Comments', color: '#E1306C' },
      seriesB: { key: 'likes', label: 'Likes', color: '#F5B4CB' },
      series: buildDualSeries(33, 'comments', 'likes', 260, 130),
    },
    connectMessage: 'Instagram account is not linked for this project.',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    brandColor: '#0A66C2',
    connected: false,
    kpis: [
      { key: 'updates', label: 'Total Page Updates', value: '356', icon: FileText },
      { key: 'followers', label: 'Total Followers', value: '251', icon: Users },
      { key: 'impressions', label: 'Total Impressions', value: '3', icon: Eye },
      { key: 'clicks', label: 'Total Click', value: '209', icon: MousePointerClick },
    ],
    chart: {
      type: 'line', title: 'Total Clicks vs Total Impressions',
      seriesA: { key: 'clicks', label: 'Clicks', color: '#0A66C2' },
      seriesB: { key: 'impressions', label: 'Impressions', color: '#8FC1F2' },
      series: buildDualSeries(44, 'clicks', 'impressions', 260, 130),
    },
    connectMessage: 'LinkedIn access token expired.',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Music2,
    brandColor: '#111827',
    connected: false,
    kpis: [
      { key: 'following', label: 'Following', value: '32', icon: Users },
      { key: 'followers', label: 'Followers', value: '11', icon: UserPlus },
      { key: 'likes', label: 'Likes', value: '124', icon: Heart },
      { key: 'videos', label: 'Videos', value: '98', icon: Video },
    ],
    chart: { type: 'line', title: 'Page Engagement', seriesKey: 'value', color: '#111827', series: buildSeries(55, 400, 350), dashed: true },
    connectMessage: 'TikTok account is not linked for this project.',
  },
]

export function periodRangeLabel(period) {
  return PERIOD_RANGE_LABEL[period] || ''
}
