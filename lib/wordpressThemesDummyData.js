/**
 * Static/dummy data for the WordPress Management → Themes page
 * (components/wordpress/themes/**, app/app/wordpress/themes/page.jsx).
 *
 * Frontend-only: no API calls, no React Query, no backend, no WordPress
 * communication, no theme installation logic. "Divi Child Theme" reuses
 * the same theme name already referenced on the Dashboard's
 * WebsiteInfoCard and the Backups page's Website Snapshot
 * (lib/wordpressDummyData.js / lib/wordpressBackupsDummyData.js) for
 * continuity across the module.
 */

import { TODAY_ISO } from './leadsDummyData'

export { TODAY_ISO }

function theme(t) {
  return { isPremium: false, isFavorite: false, parentTheme: null, ...t }
}

export const THEMES = [
  theme({
    id: 'divi', name: 'Divi', tint: '#7c3aed',
    description: 'Smart. Flexible. Beautiful. Divi is the most powerful theme in our collection.',
    status: 'active', hasUpdate: true, currentVersion: '4.27.4', latestVersion: '4.28.0',
    isPremium: true, isFavorite: true, author: 'Elegant Themes',
    wpCompat: '6.4+', phpCompat: '7.4+', license: 'Lifetime License',
    installedAt: '2025-11-02', lastUpdated: '2026-06-15',
  }),
  theme({
    id: 'divi-child', name: 'Divi Child Theme', tint: '#7c3aed',
    description: 'A child theme template for Divi, customized for this site.',
    status: 'active', hasUpdate: false, currentVersion: '1.0.0', latestVersion: '1.0.0',
    parentTheme: 'Divi', author: 'Bellhaven Family Dental', isFavorite: true,
    wpCompat: '6.4+', phpCompat: '7.4+', license: 'N/A (Child Theme)',
    installedAt: '2025-11-02', lastUpdated: '2025-11-02',
  }),
  theme({
    id: 'astra', name: 'Astra', tint: '#f2632f',
    description: 'A fast, fully customizable & beautiful WordPress theme suitable for any website.',
    status: 'inactive', hasUpdate: true, currentVersion: '4.6.2', latestVersion: '4.7.0',
    isPremium: true, author: 'Brainstorm Force',
    wpCompat: '6.3+', phpCompat: '7.4+', license: 'Astra Pro Annual',
    installedAt: '2025-08-10', lastUpdated: '2026-02-01',
  }),
  theme({
    id: 'generatepress', name: 'GeneratePress', tint: '#0a66c2',
    description: 'A lightweight, fast and accessible WordPress theme built for performance.',
    status: 'inactive', hasUpdate: false, currentVersion: '3.4.1', latestVersion: '3.4.1',
    isPremium: true, author: 'Tom Usborne',
    wpCompat: '6.2+', phpCompat: '7.4+', license: 'GP Premium',
    installedAt: '2025-09-05', lastUpdated: '2026-01-12',
  }),
  theme({
    id: 'kadence', name: 'Kadence', tint: '#0d9488',
    description: 'A fast, fully customizable multi-purpose WordPress theme for any type of website.',
    status: 'inactive', hasUpdate: false, currentVersion: '1.2.10', latestVersion: '1.2.10',
    author: 'Kadence WP',
    wpCompat: '6.2+', phpCompat: '7.4+', license: 'Free (GPL)',
    installedAt: '2025-07-22', lastUpdated: '2025-12-04',
  }),
  theme({
    id: 'hello-elementor', name: 'Hello Elementor', tint: '#92003b',
    description: 'A lightweight starter theme designed to work seamlessly with Elementor.',
    status: 'inactive', hasUpdate: false, currentVersion: '3.1.0', latestVersion: '3.1.0',
    author: 'Elementor Team',
    wpCompat: '6.0+', phpCompat: '7.4+', license: 'Free (GPL)',
    installedAt: '2025-06-01', lastUpdated: '2025-10-19',
  }),
  theme({
    id: 'twenty-twenty-five', name: 'Twenty Twenty-Five', tint: '#1e293b',
    description: 'The default WordPress theme, built around blocks and full site editing.',
    status: 'inactive', hasUpdate: true, currentVersion: '1.2', latestVersion: '1.3',
    author: 'WordPress.org',
    wpCompat: '6.7+', phpCompat: '7.2+', license: 'Free (GPL)',
    installedAt: '2025-01-01', lastUpdated: '2025-11-30',
  }),
]

export const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'version', label: 'Version' },
  { value: 'status', label: 'Status' },
  { value: 'type', label: 'Theme Type' },
]

// ── Scheduling ────────────────────────────────────────────────────────
export const SCHEDULING_DEFAULTS = {
  automaticUpdates: true,
  frequency: 'Weekly',
  preferredTime: '02:30',
  maintenanceWindowStart: '01:00',
  maintenanceWindowEnd: '05:00',
  safeUpdateMode: true,
  emailNotifications: true,
}

export const UPDATE_FREQUENCIES = ['Daily', 'Weekly', 'Monthly']

// ── Scheduling History ───────────────────────────────────────────────
export const SCHEDULING_HISTORY = [
  { id: 'th1', date: '2026-07-27', theme: 'Divi', previousVersion: '4.27.1', newVersion: '4.27.4', status: 'Completed', durationSec: 26, triggeredBy: 'Automatic' },
  { id: 'th2', date: '2026-07-20', theme: 'Twenty Twenty-Five', previousVersion: '1.1', newVersion: '1.2', status: 'Completed', durationSec: 11, triggeredBy: 'Automatic' },
  { id: 'th3', date: '2026-07-11', theme: 'Astra', previousVersion: '4.6.0', newVersion: '4.6.2', status: 'Failed', durationSec: 5, triggeredBy: 'Automatic' },
  { id: 'th4', date: '2026-06-15', theme: 'Divi', previousVersion: '4.26.8', newVersion: '4.27.1', status: 'Completed', durationSec: 24, triggeredBy: 'sarang@ebrandz.com' },
  { id: 'th5', date: '2026-07-31', theme: 'Astra', previousVersion: '4.6.2', newVersion: '4.7.0', status: 'Running', durationSec: null, triggeredBy: 'sarang@ebrandz.com' },
]

// ── Compatibility ─────────────────────────────────────────────────────
export const COMPATIBILITY = {
  wordpress: { status: 'Compatible', variant: 'success' },
  php: { status: 'Compatible', variant: 'success' },
  plugins: { status: '1 Minor Conflict', variant: 'warning' },
  security: { status: 'No Issues', variant: 'success' },
  performance: { rating: 'Good', variant: 'success' },
}

// ── Recent Activity ───────────────────────────────────────────────────
export const THEME_ACTIVITY = [
  { id: 'ta1', text: 'Theme Updated — Divi to 4.27.4', time: '4 days ago' },
  { id: 'ta2', text: 'Theme Customized — Divi Child Theme header layout', time: '6 days ago' },
  { id: 'ta3', text: 'Theme Activated — Divi', time: '2025-11-02' },
  { id: 'ta4', text: 'Theme Installed — Divi Child Theme', time: '2025-11-02' },
  { id: 'ta5', text: 'Theme Deleted — Twenty Twenty-Four', time: '18 days ago' },
  { id: 'ta6', text: 'Automatic Update Completed — 1 theme updated', time: '20 days ago' },
]
