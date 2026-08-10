/**
 * Static/dummy data for the WordPress Management module
 * (components/wordpress/**, app/app/wordpress/**).
 *
 * Frontend-only: no API calls, no React Query, no backend, no persistence.
 * The backup dates below intentionally match the reference screenshot
 * exactly (15 days before/after this session's established "today",
 * 2026-07-31 - see lib/leadsDummyData.js's TODAY_ISO) for continuity.
 */

import { TODAY_ISO } from './leadsDummyData'

export { TODAY_ISO }

export const SITES = [
  { id: 'site-1', name: '247 Business Directory', domain: '247businessdirectory.net' },
  { id: 'site-2', name: 'Bellhaven Family Dental', domain: 'bellhavendental.com' },
  { id: 'site-3', name: 'Sapphire Agency Blog', domain: 'blog.sapphireagency.com' },
]

export const WP_VERSION = '7.0'

export const WEBSITE_INFO = {
  url: '247businessdirectory.net',
  hosting: 'GoDaddy Managed WordPress',
  phpVersion: '8.2',
  wpVersion: WP_VERSION,
  theme: 'Astra Pro 4.6.2',
  activePlugins: 18,
  users: 4,
  diskUsage: { usedGb: 2.4, totalGb: 10 },
}

// ── Updates ───────────────────────────────────────────────────────────
export const PLUGIN_UPDATES = [
  { id: 'p1', name: 'Advanced Custom Fields', currentVersion: '6.8.0', latestVersion: '6.8.3', severity: 'warning' },
  { id: 'p2', name: 'All-In-One Security (AIOS)', currentVersion: '5.4.6', latestVersion: '5.4.8', severity: 'warning' },
  { id: 'p3', name: 'Disable Comments', currentVersion: '2.6.2', latestVersion: '2.7.0', severity: 'info' },
  { id: 'p4', name: 'Yoast SEO', currentVersion: '27.3', latestVersion: '27.7', severity: 'warning' },
]

export const THEME_UPDATES_COUNT = 2
export const WORDPRESS_UPDATES_COUNT = 0

// ── Backups ───────────────────────────────────────────────────────────
export const BACKUP_STATUS = {
  success: true,
  lastBackup: { relative: '15 days ago', absolute: '2026-07-16, 20:25:50' },
  nextBackup: '2026-08-03, 19:55:20',
}

// ── Analytics ─────────────────────────────────────────────────────────
function seededRandom(seed) {
  let s = seed
  return function next() { s = (s * 9301 + 49297) % 233280; return s / 233280 }
}

function buildAnalyticsSeries(points, seed) {
  const rndV = seededRandom(seed)
  const rndP = seededRandom(seed + 13)
  let visitors = 40
  let pageviews = 90
  return Array.from({ length: points }, (_, i) => {
    visitors = Math.max(10, visitors + (rndV() - 0.45) * 12)
    pageviews = Math.max(20, pageviews + (rndP() - 0.45) * 25)
    return { i, visitors: Math.round(visitors), pageviews: Math.round(pageviews) }
  })
}

export const ANALYTICS_SERIES = {
  weekly: buildAnalyticsSeries(7, 21),
  monthly: buildAnalyticsSeries(30, 34),
}

// ── Optimization ──────────────────────────────────────────────────────
export const OPTIMIZATION = {
  postRevisions: 452,
  databaseSizeMb: 184,
  cacheStatus: 'Active',
  suggestions: [
    'Clean up 452 post revisions to reduce database size',
    'Compress 38 unoptimized images (potential savings: 12MB)',
    'Remove 6 inactive plugins left installed but disabled',
  ],
}

// ── Security ──────────────────────────────────────────────────────────
export const SECURITY = {
  score: 92,
  firewall: 'Active',
  malwareScan: { status: 'Clean', lastScan: '2 days ago' },
  loginProtection: 'Enabled',
  ssl: { status: 'Valid', expiresInDays: 87 },
}

// ── Performance ───────────────────────────────────────────────────────
export const PERFORMANCE = {
  pageSpeed: 84,
  databaseHealth: 91,
  objectCache: { status: 'Active', hitRate: 96 },
  cdn: { status: 'Connected', provider: 'Cloudflare' },
  responseTimeMs: 214,
}

// ── Recent Activity ───────────────────────────────────────────────────
export const RECENT_ACTIVITY = [
  { id: 'a1', type: 'update', text: 'Plugin Updated — Yoast SEO to 27.7', time: '2h ago' },
  { id: 'a2', type: 'backup', text: 'Backup Completed — full site snapshot', time: '15 days ago' },
  { id: 'a3', type: 'security', text: 'Security Scan — no threats found', time: '2 days ago' },
  { id: 'a4', type: 'theme', text: 'Theme Installed — Astra Pro 4.6.2', time: '6 days ago' },
  { id: 'a5', type: 'wordpress', text: 'WordPress Updated — core to 7.0', time: '9 days ago' },
  { id: 'a6', type: 'login', text: 'User Login — sarang@ebrandz.com', time: '11h ago' },
]
