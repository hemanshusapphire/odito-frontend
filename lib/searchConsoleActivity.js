import { formatRelativeTime } from './formatRelativeTime'

/**
 * Recent Activity, built entirely from real Odito sync timestamps - Google
 * exposes no general activity/audit-log API for Search Console. Never
 * fabricated: an event only appears here if its underlying timestamp is
 * present. Mirrors lib/businessProfileActivity.js.
 */
export function buildRecentActivityFromSyncTimestamps(status) {
  const events = []

  if (status?.last_sync_at) {
    events.push({
      id: 'sync',
      text: 'Search Console data synced with Google',
      time: status.last_sync_at,
      color: '#5b7fff',
    })
  }
  if (status?.latest_data_date) {
    events.push({
      id: 'data',
      text: 'Search performance data imported',
      time: status.latest_data_date,
      color: '#22d3c7',
    })
  }

  return events
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .map((e) => ({ id: e.id, text: e.text, timestamp: formatRelativeTime(e.time), color: e.color }))
}
