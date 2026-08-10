/**
 * Static/dummy data for the WordPress Management → Plugins page
 * (components/wordpress/plugins/**, app/app/wordpress/plugins/page.jsx).
 *
 * Frontend-only: no API calls, no React Query, no backend, no WordPress
 * communication, no plugin installation logic. The 4 plugins with real
 * update data (Advanced Custom Fields, AIOS, Disable Comments, Yoast SEO)
 * reuse the exact same names/versions as the WordPress Dashboard's
 * UpdatesCard (lib/wordpressDummyData.js) for continuity across the
 * module; the rest are new plugins covering the other statuses the
 * reference asked for (premium, security warning, inactive, favorites).
 */

import { TODAY_ISO } from './leadsDummyData'

export { TODAY_ISO }

function plugin(p) {
  return { isFavorite: false, isPremium: false, hasSecurityWarning: false, hasUpdate: false, ...p }
}

export const PLUGINS = [
  plugin({
    id: 'yoast-seo', name: 'Yoast SEO', initials: 'YO', tint: '#a4286a',
    description: 'Improve your SEO with real-time feedback, schema, and clear guidance.',
    status: 'active', hasUpdate: true, currentVersion: '27.3', latestVersion: '27.7',
    isFavorite: true, sizeKb: 18400, lastUpdated: '2026-06-02',
  }),
  plugin({
    id: 'acf', name: 'Advanced Custom Fields', initials: 'ACF', tint: '#2196f3',
    description: 'ACF helps customize WordPress with powerful, professional and intuitive fields.',
    status: 'active', hasUpdate: true, currentVersion: '6.8.0', latestVersion: '6.8.3',
    isFavorite: true, sizeKb: 9200, lastUpdated: '2026-05-14',
  }),
  plugin({
    id: 'aios', name: 'All-In-One Security (AIOS)', initials: 'AI', tint: '#0d47a1',
    description: 'Protect your website investment with a comprehensive, easy to use security plugin.',
    status: 'active', hasUpdate: true, currentVersion: '5.4.6', latestVersion: '5.4.8',
    hasSecurityWarning: true, sizeKb: 6800, lastUpdated: '2026-04-28',
  }),
  plugin({
    id: 'disable-comments', name: 'Disable Comments', initials: 'DC', tint: '#e53935',
    description: 'Allows administrators to globally disable comments on their site.',
    status: 'active', hasUpdate: true, currentVersion: '2.6.2', latestVersion: '2.7.0',
    sizeKb: 620, lastUpdated: '2026-03-19',
  }),
  plugin({
    id: 'elementor', name: 'Elementor', initials: 'EL', tint: '#f43654',
    description: 'The leading website builder platform for professionals on WordPress.',
    status: 'active', currentVersion: '3.28.0', latestVersion: '3.28.0',
    isPremium: true, isFavorite: true, sizeKb: 42100, lastUpdated: '2026-07-01',
  }),
  plugin({
    id: 'woocommerce', name: 'WooCommerce', initials: 'WC', tint: '#7f54b3',
    description: 'An eCommerce toolkit that helps you sell anything, beautifully.',
    status: 'active', currentVersion: '9.4.1', latestVersion: '9.4.1',
    isPremium: true, sizeKb: 38700, lastUpdated: '2026-06-20',
  }),
  plugin({
    id: 'rank-math', name: 'Rank Math', initials: 'RM', tint: '#fa6041',
    description: 'The Swiss Army Knife of WordPress SEO with the features of multiple plugins.',
    status: 'inactive', currentVersion: '1.0.223', latestVersion: '1.0.223',
    sizeKb: 15300, lastUpdated: '2026-05-30',
  }),
  plugin({
    id: 'wp-rocket', name: 'WP Rocket', initials: 'WR', tint: '#f2632f',
    description: 'The most powerful caching plugin to speed up your WordPress site.',
    status: 'inactive', currentVersion: '3.16.2', latestVersion: '3.16.2',
    isPremium: true, sizeKb: 4100, lastUpdated: '2026-06-11',
  }),
  plugin({
    id: 'aioseo', name: 'All In One SEO', initials: 'AIO', tint: '#00b26d',
    description: 'The original WordPress SEO plugin & toolkit to improve search rankings.',
    status: 'inactive', hasUpdate: true, currentVersion: '4.5.0', latestVersion: '4.5.2',
    sizeKb: 11800, lastUpdated: '2026-02-08',
  }),
]

export const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'status', label: 'Status' },
  { value: 'version', label: 'Version' },
  { value: 'size', label: 'Size' },
]

// ── Scheduling ────────────────────────────────────────────────────────
export const SCHEDULING_DEFAULTS = {
  automaticUpdates: true,
  frequency: 'Daily',
  preferredTime: '03:00',
  maintenanceWindowStart: '02:00',
  maintenanceWindowEnd: '05:00',
  emailNotifications: true,
  safeUpdateMode: true,
}

export const UPDATE_FREQUENCIES = ['Daily', 'Weekly', 'Monthly']

// ── Scheduling History ───────────────────────────────────────────────
export const SCHEDULING_HISTORY = [
  { id: 'sh1', date: '2026-07-30', plugin: 'Yoast SEO', previousVersion: '27.2', newVersion: '27.3', status: 'Completed', durationSec: 18, triggeredBy: 'Automatic' },
  { id: 'sh2', date: '2026-07-28', plugin: 'Advanced Custom Fields', previousVersion: '6.7.4', newVersion: '6.8.0', status: 'Completed', durationSec: 22, triggeredBy: 'Automatic' },
  { id: 'sh3', date: '2026-07-23', plugin: 'All-In-One Security (AIOS)', previousVersion: '5.4.5', newVersion: '5.4.6', status: 'Failed', durationSec: 6, triggeredBy: 'Automatic' },
  { id: 'sh4', date: '2026-07-19', plugin: 'WP Rocket', previousVersion: '3.16.1', newVersion: '3.16.2', status: 'Completed', durationSec: 14, triggeredBy: 'sarang@ebrandz.com' },
  { id: 'sh5', date: '2026-07-16', plugin: 'Disable Comments', previousVersion: '2.6.1', newVersion: '2.6.2', status: 'Completed', durationSec: 9, triggeredBy: 'Automatic' },
  { id: 'sh6', date: '2026-07-31', plugin: 'Elementor', previousVersion: '3.27.9', newVersion: '3.28.0', status: 'Running', durationSec: null, triggeredBy: 'sarang@ebrandz.com' },
]

// ── Health ────────────────────────────────────────────────────────────
export const PLUGIN_HEALTH = {
  score: 78,
  outdatedPlugins: 5,
  criticalUpdates: 1,
  securityRisk: 'Low',
  compatibilityStatus: 'Compatible',
}

// ── Recent Activity ───────────────────────────────────────────────────
export const PLUGIN_ACTIVITY = [
  { id: 'pa1', text: 'Plugin Updated — Yoast SEO to 27.3', time: '1h ago' },
  { id: 'pa2', text: 'Plugin Installed — Elementor 3.28.0', time: '2 days ago' },
  { id: 'pa3', text: 'Plugin Activated — WooCommerce', time: '4 days ago' },
  { id: 'pa4', text: 'Plugin Deactivated — Rank Math', time: '6 days ago' },
  { id: 'pa5', text: 'Plugin Removed — Contact Form 7', time: '9 days ago' },
  { id: 'pa6', text: 'Automatic Update Completed — 3 plugins updated', time: '15 days ago' },
]
